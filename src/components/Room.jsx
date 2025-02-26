import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useParams } from "react-router-dom";

const SERVER_URL = "http://localhost:5000";

export default function Room() {
    const [socket, setSocket] = useState(null);
    const deviceRef = useRef(null);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const localVideoRef = useRef(null);
    const remoteVideosRef = useRef({});
    const sendTransport = useRef(null);
    const recvTransport = useRef(null);
    const producers = useRef([]);
    const consumers = useRef([]);
    const producerQueue = useRef([]);
    const localStreamRef = useRef(null);
    const videoRefs = useRef({});

    const params = useParams();

    useEffect(() => {
        const newSocket = io(SERVER_URL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });
        setSocket(newSocket);

        newSocket.on("connect", async () => {
            console.log("Connected to Mediasoup server");
            await joinRoom(newSocket);
        });

        newSocket.on("newProducer", (producerId) => {
            console.log("🎥 New producer found:", producerId);
            if (!producerId) {
                console.error("❌ No producerId received!");
                return;
            }
            if (!deviceRef.current || !recvTransport.current) {
                console.log("⏳ Queuing producer", producerId, "until ready");
                producerQueue.current.push(producerId);
            } else {
                console.log("🚀 Transport and device ready, consuming producer immediately");
                consume(producerId, newSocket);
            }
        });

        // New event listener for when a participant leaves
        newSocket.on("participantLeft", (producerId) => {
            console.log(`Participant with producer ${producerId} left the room`);
            if (remoteVideosRef.current[producerId]) {
                delete remoteVideosRef.current[producerId];
                setRemoteStreams(Object.values(remoteVideosRef.current));
                console.log(`Removed stream for producer ${producerId}`);
                // Clean up consumer if it exists
                const consumer = consumers.current.find(c => c.producerId === producerId);
                if (consumer) {
                    consumer.close();
                    consumers.current = consumers.current.filter(c => c.producerId !== producerId);
                }
            }
        });

        return () => {
            newSocket.disconnect();
            newSocket.off("newProducer");
            newSocket.off("participantLeft");
        };
    }, []);

    const joinRoom = async (socket) => {
        console.log("Starting joinRoom");
        socket.emit("joinRoom", { roomId: params.roomId }, async ({ routerRtpCapabilities, existingProducerIds }) => {
            console.log("Received routerRtpCapabilities:", routerRtpCapabilities);
            console.log("Existing producer IDs from server:", existingProducerIds || "None");

            const device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities });
            deviceRef.current = device;
            console.log("Device loaded:", deviceRef.current);

            await createSendTransport(socket, device);
            console.log("Send transport created:", sendTransport.current);
            await createRecvTransport(socket, device);
            console.log("Recv transport created:", recvTransport.current);

            if (existingProducerIds && existingProducerIds.length > 0) {
                console.log("Consuming existing producers:", existingProducerIds);
                for (const producerId of existingProducerIds) {
                    console.log(`Consuming existing producer ${producerId}`);
                    await consume(producerId, socket);
                }
            } else {
                console.log("No existing producers to consume");
            }

            processQueue(socket);
        });
    };

    const createSendTransport = async (socket, device) => {
        return new Promise((resolve) => {
            socket.emit("createTransport", { roomId: params.roomId }, async (data) => {
                console.log("Send transport data received:", data);
                sendTransport.current = device.createSendTransport(data);

                sendTransport.current.on("connect", ({ dtlsParameters }, callback) => {
                    console.log("Connecting send transport:", sendTransport.current.id);
                    socket.emit("connectTransport", { transportId: sendTransport.current.id, dtlsParameters });
                    callback();
                });

                sendTransport.current.on("produce", async ({ kind, rtpParameters }, callback) => {
                    console.log(`Producing ${kind} track`);
                    socket.emit(
                        "produce",
                        { roomId: params.roomId, transportId: sendTransport.current.id, kind, rtpParameters },
                        ({ id }) => {
                            console.log(`Producer created with ID: ${id}`);
                            callback({ id });
                        }
                    );
                });

                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream;
                localVideoRef.current.srcObject = stream;
                console.log("Local stream tracks:", stream.getTracks());

                for (const track of stream.getTracks()) {
                    const producer = await sendTransport.current.produce({ track });
                    producers.current.push(producer);
                    console.log(`Producer ${producer.id} for ${track.kind} started`);
                }
                resolve();
            });
        });
    };

    const createRecvTransport = async (socket, device) => {
        return new Promise((resolve) => {
            socket.emit("createTransport", { roomId: params.roomId }, (data) => {
                console.log("Recv transport data received:", data);
                recvTransport.current = device.createRecvTransport(data);

                recvTransport.current.on("connect", ({ dtlsParameters }, callback) => {
                    console.log("Connecting recv transport:", recvTransport.current.id);
                    socket.emit("connectTransport", { transportId: recvTransport.current.id, dtlsParameters });
                    callback();
                });

                console.log("✅ Receiver transport created with ID:", recvTransport.current.id);
                processQueue(socket);
                resolve();
            });
        });
    };

    const processQueue = (socket) => {
        if (producerQueue.current.length > 0 && deviceRef.current && recvTransport.current) {
            console.log("Processing queued producers:", producerQueue.current);
            producerQueue.current.forEach((producerId) => consume(producerId, socket));
            producerQueue.current = [];
        } else if (producerQueue.current.length > 0) {
            console.log("Queue not processed yet, waiting for device and transport");
        } else {
            console.log("No queued producers to process");
        }
    };

    const consume = async (producerId, socket) => {
        console.log("📡 Attempting to consume producer:", producerId);
        if (!deviceRef.current || !recvTransport.current) {
            console.error("❌ Device or recvTransport not initialized");
            producerQueue.current.push(producerId);
            return;
        }

        socket.emit(
            "consume",
            {
                roomId: params.roomId,
                producerId,
                transportId: recvTransport.current.id,
                rtpCapabilities: deviceRef.current.rtpCapabilities,
            },
            async (response) => {
                if (response.error) {
                    console.error("❌ Consume error:", response.error);
                    return;
                }

                console.log("Consume response:", response);
                const consumer = await recvTransport.current.consume({
                    id: response.id,
                    producerId: response.producerId,
                    kind: response.kind,
                    rtpParameters: response.rtpParameters,
                });

                consumers.current.push(consumer);

                const stream = new MediaStream();
                stream.addTrack(consumer.track);
                console.log("Consumer track added to stream:", consumer.track);

                remoteVideosRef.current[producerId] = stream;
                setRemoteStreams(Object.values(remoteVideosRef.current));
                console.log("✅ Stream added for producer:", producerId);
            }
        );
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
                console.log(`Video ${videoTrack.enabled ? "enabled" : "disabled"}`);
                if (!videoTrack.enabled) {
                    producers.current.filter(p => p.kind === "video").forEach(p => p.pause());
                } else {
                    producers.current.filter(p => p.kind === "video").forEach(p => p.resume());
                }
            }
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
                console.log(`Audio ${audioTrack.enabled ? "enabled" : "disabled"}`);
                if (!audioTrack.enabled) {
                    producers.current.filter(p => p.kind === "audio").forEach(p => p.pause());
                } else {
                    producers.current.filter(p => p.kind === "audio").forEach(p => p.resume());
                }
                Object.values(videoRefs.current).forEach((videoEl) => {
                    if (videoEl) {
                        videoEl.muted = false;
                        console.log("Ensuring remote video element is not muted");
                    }
                });
            }
        }
    };

    const exitRoom = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }
        if (sendTransport.current) sendTransport.current.close();
        if (recvTransport.current) recvTransport.current.close();
        producers.current.forEach(p => p.close());
        consumers.current.forEach(c => c.close());
        // Notify server of exit with producer IDs
        const producerIds = producers.current.map(p => p.id);
        socket.emit("exitRoom", { roomId: params.roomId, producerIds });
        socket.disconnect();
        setRemoteStreams([]);
        console.log("Exited room, notified server with producer IDs:", producerIds);
    };

    useEffect(() => {
        remoteStreams.forEach((stream, index) => {
            const producerId = Object.keys(remoteVideosRef.current)[index];
            const videoEl = videoRefs.current[producerId];
            if (videoEl && videoEl.srcObject !== stream) {
                console.log(`Attaching stream to video element for producer ${producerId}`);
                videoEl.srcObject = stream;
                videoEl.muted = false;
            }
        });
    }, [remoteStreams]);

    return (
        <div className='flex flex-col bg-green-500'>
            <h1>Mediasoup Video Call</h1>
            <video ref={localVideoRef} autoPlay muted className='w-[300px] border-amber-500 rounded-[8px]' />
            <div className='m-[10px]'>
                <button onClick={toggleVideo}>
                    {isVideoOn ? "Turn Video Off" : "Turn Video On"}
                </button>
                <button onClick={toggleAudio} className='m-[10px]'>
                    {isAudioOn ? "Turn Audio Off" : "Turn Audio On"}
                </button>
                <button onClick={exitRoom} className='m-[10px]'>
                    Exit Room
                </button>
            </div>
            <div
                id="remote-videos" className='flex wrap gap-[10px] bg-blue-400 p-4'
            >
                {remoteStreams.map((stream, index) => {
                    const producerId = Object.keys(remoteVideosRef.current)[index];
                    return (
                        <video
                            key={producerId}
                            ref={(el) => {
                                if (el) {
                                    videoRefs.current[producerId] = el;
                                    if (el.srcObject !== stream) {
                                        el.srcObject = stream;
                                        el.muted = false;
                                        console.log(`Rendering video for producer ${producerId}`);
                                    }
                                }
                            }}
                            autoPlay
                            playsInline
                            className='w-[300px] border-amber-400 rounded-[8px]'
                        />
                    );
                })}
            </div>
        </div>
    );
}