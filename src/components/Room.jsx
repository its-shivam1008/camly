import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useParams } from "react-router-dom";
import { IoMdExit } from "react-icons/io";
import { IoVideocam, IoVideocamOff } from "react-icons/io5";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";

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
        <div className='grid grid-cols-[70%_30%] min-h-screen bg-[#fffafa]'>
            <div className='videos-of-participants flex flex-col space-y-2'>
                <div className='produced-shareable-link w-[90%] h-fit py-3 px-2 mx-auto mt-2.5 bg-[#f2f2f2] rounded-[12px] flex items-center'>
                    this is your shareable link
                </div>
                <div className='relative'>
                    <video ref={localVideoRef} autoPlay muted className='h-[90%] w-[80%] object-cover  mx-auto border-green-500 border-2 border-solid rounded-[10px]' />
                    {
                        localVideoRef && <div className='m-[10px] flex left-1/2 transform -translate-x-1/2 space-x-5 items-center  bottom-12 absolute'>
                            <button onClick={toggleVideo}>
                                {isVideoOn ? <div className='bg-black p-3 rounded-full'> <IoVideocamOff size={28}  color="white"/> </div> : <div className='bg-white p-3 rounded-full'> <IoVideocam size={28} color="black"/> </div> }
                            </button>
                        <button onClick={exitRoom} className='m-[10px] bg-rose-500 px-2 py-2 rounded-[4px] text-white font-semibold flex items-center'>
                                Exit Room <IoMdExit size={24} />
                            </button>
                            <button onClick={toggleAudio} className='m-[10px]'>
                                {isAudioOn ? <div className='bg-black p-3 rounded-full'> <AiOutlineAudioMuted size={28}  color="white"/> </div> : <div className='bg-white p-3 rounded-full'> <AiFillAudio size={28} color="black"/> </div> }
                            </button>
                        </div>
                    }
                </div>
                
                {/* // problem user video also produced as I seen it as yellow box without any video*/}
                <div
                    id="remote-videos" className='flex wrap gap-3 py-2 w-[95%] mx-auto'
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
                                className='w-[20%] border-2 border-solid border-amber-400 rounded-[8px]'
                            />
                        );
                    })}
                </div>
            </div>
            <div className="future-chat-room bg-blue-400">lol</div>
        </div>
    );
}