import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";

const SERVER_URL = "http://localhost:5000";

export default function Call() {
    const [socket, setSocket] = useState(null);
    const deviceRef = useRef(null);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const localVideoRef = useRef(null);
    const remoteVideosRef = useRef({});
    const sendTransport = useRef(null);
    const recvTransport = useRef(null);
    const producers = useRef([]);
    const consumers = useRef([]);
    const producerQueue = useRef([]);

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
            console.log("Current deviceRef:", deviceRef.current);
            console.log("Current recvTransport:", recvTransport.current);

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

        return () => {
            newSocket.disconnect();
            newSocket.off("newProducer");
        };
    }, []);

    const joinRoom = async (socket) => {
        console.log("Starting joinRoom");
        socket.emit("joinRoom", { roomId: "room1" }, async ({ routerRtpCapabilities, existingProducerIds }) => {
            console.log("Received routerRtpCapabilities:", routerRtpCapabilities);
            console.log("Received existingProducerIds:", existingProducerIds);

            const device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities });
            deviceRef.current = device;
            console.log("Device loaded");

            await createTransport(socket, device);
            console.log("Send transport created");
            await createRecvTransport(socket, device);
            console.log("Recv transport created, recvTransport.current:", recvTransport.current);

            // Consume existing producers if any
            if (existingProducerIds && existingProducerIds.length > 0) {
                console.log("Consuming existing producers:", existingProducerIds);
                for (const producerId of existingProducerIds) {
                    await consume(producerId, socket); // Ensure each consume completes
                }
            } else {
                console.log("No existing producers to consume");
            }

            // Process any queued producers after setup
            processQueue(socket);
        });
    };

    const createTransport = async (socket, device) => {
        return new Promise((resolve) => {
            socket.emit("createTransport", { roomId: "room1" }, async (data) => {
                sendTransport.current = device.createSendTransport(data);

                sendTransport.current.on("connect", ({ dtlsParameters }, callback) => {
                    socket.emit("connectTransport", { transportId: sendTransport.current.id, dtlsParameters });
                    callback();
                });

                sendTransport.current.on("produce", async ({ kind, rtpParameters }, callback) => {
                    socket.emit(
                        "produce",
                        { roomId: "room1", transportId: sendTransport.current.id, kind, rtpParameters },
                        ({ id }) => {
                            callback({ id });
                        }
                    );
                });

                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localVideoRef.current.srcObject = stream;

                for (const track of stream.getTracks()) {
                    producers.current.push(await sendTransport.current.produce({ track }));
                }
                resolve();
            });
        });
    };

    const createRecvTransport = async (socket, device) => {
        return new Promise((resolve) => {
            socket.emit("createTransport", { roomId: "room1" }, (data) => {
                recvTransport.current = device.createRecvTransport(data);

                recvTransport.current.on("connect", ({ dtlsParameters }, callback) => {
                    socket.emit("connectTransport", { transportId: recvTransport.current.id, dtlsParameters });
                    callback();
                });

                console.log("✅ Receiver transport created with ID:", recvTransport.current.id);
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
        console.log("device:", deviceRef.current, "recvTransport.current:", recvTransport.current);

        if (!deviceRef.current || !recvTransport.current) {
            console.error("❌ Device or recvTransport not initialized");
            return;
        }

        socket.emit(
            "consume",
            {
                roomId: "room1",
                producerId,
                transportId: recvTransport.current.id,
                rtpCapabilities: deviceRef.current.rtpCapabilities,
            },
            async (response) => {
                if (response.error) {
                    console.error("❌ Consume error:", response.error);
                    return;
                }

                const consumer = await recvTransport.current.consume({
                    id: response.id,
                    producerId: response.producerId,
                    kind: response.kind,
                    rtpParameters: response.rtpParameters,
                });

                consumers.current.push(consumer);

                const stream = new MediaStream();
                stream.addTrack(consumer.track);

                remoteVideosRef.current[producerId] = stream;
                setRemoteStreams([...Object.values(remoteVideosRef.current)]);
                console.log("✅ Remote video attached for producer:", producerId);
            }
        );
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", backgroundColor: "green" }}>
            <h1>Mediasoup Video Call</h1>
            <video ref={localVideoRef} autoPlay muted style={{ width: "300px", border: "1px solid black" }} />
            <div
                id="remote-videos"
                style={{ display: "flex", flexWrap: "wrap", gap: "10px", backgroundColor: "blue", padding: "4px" }}
            >
                {remoteStreams.map((stream, index) => (
                    <video
                        key={index}
                        ref={(el) => el && (el.srcObject = stream)}
                        autoPlay
                        playsInline
                        style={{ width: "300px", border: "1px solid blue" }}
                    />
                ))}
            </div>
        </div>
    );
}