import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useParams } from "react-router-dom";
import { IoMdExit } from "react-icons/io";
import { IoClipboard, IoClose, IoVideocam, IoVideocamOff } from "react-icons/io5";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { TiTick } from "react-icons/ti";
import Chat from "./Chat";
import { useSelector } from "react-redux";
// import { AuthState } from "../redux/slice/authSlice";
import { RootState } from "../redux/store";
import {ToastContainer, toast} from 'react-toastify';
import { Bounce } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import { Consumer, DtlsParameters, MediaKind, Producer, RtpParameters } from "mediasoup-client/lib/types";
import Modal from "./Modal";

const SERVER_URL = `${import.meta.env.VITE_SERVER_URL_PROD}`;

export default function Room() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const deviceRef = useRef<mediasoupClient.Device | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Record<string, MediaStream>>({});
  const sendTransport = useRef<any>(null);
  const recvTransport = useRef<any>(null);
  const producers = useRef<Producer[]>([]);
  const consumers = useRef<Consumer[]>([]);
  const producerQueue = useRef<string[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const params = useParams();
  // const dispatch = useDispatch();
  const userObj = useSelector((state: RootState) => state.auth);

//   const userData: UserData = {
//     id: "87597e89-75cf-4ddd-b414-f126156b504a",
//     role: "STUDENT",
//     email: "shivamshukla.email@gmail.com",
//   };
  // const userdata:any = localStorage.getItem('userData')
  // const userObj:AuthState = JSON.parse(userdata as any);
  const role = userObj.role;
  const userId = userObj.id;
  const username = userObj.email;
  
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", async () => {
      //console.log("Connected to Mediasoup server");
      await joinRoom(newSocket);
    });

    newSocket.on("newProducer", (producerId: string) => {
      //console.log("🎥 New producer found:", producerId);
      if (!producerId) {
        console.error("❌ No producerId received!");
        return;
      }
      if (!deviceRef.current || !recvTransport.current) {
        //console.log("⏳ Queuing producer", producerId, "until ready");
        producerQueue.current.push(producerId);
      } else {
        //console.log("🚀 Transport and device ready, consuming producer immediately");
        consume(producerId, newSocket);
      }
    });

    newSocket.on("participantLeft", (producerId: string) => {
      //console.log(`Participant with producer ${producerId} left the room`);
      if (remoteVideosRef.current[producerId]) {
        delete remoteVideosRef.current[producerId];
        setRemoteStreams(Object.values(remoteVideosRef.current));
        //console.log(`Removed stream for producer ${producerId}`);
        const consumer = consumers.current.find((c) => c.producerId === producerId);
        if (consumer) {
          consumer.close();
          consumers.current = consumers.current.filter((c) => c.producerId !== producerId);
        }
      }
    });

    return () => {
      newSocket.disconnect();
      newSocket.off("newProducer");
      newSocket.off("participantLeft");
    };
  }, []);

  // useEffect(() => {
  //   dispatch(isLoggedIn());
  // }, []);

  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  const joinRoom = async (socket: Socket) => {
    //console.log("Starting joinRoom");
    socket.emit(
      "joinRoom",
      { roomId: params.roomId, userId: userId, role },
      async ({ routerRtpCapabilities, existingProducerIds, error }: {
        routerRtpCapabilities: any;
        existingProducerIds: string[];
        error:string;
      }) => {
        if(error==="User not allowed to join the room"){
          toast.error(error,{
              position:'bottom-right',
              autoClose:5000,
              pauseOnHover:true,
              draggable:true,
              progress:undefined,
              theme:"colored",
              transition:Bounce
          });
          setShowErrorModal(true);
        }
        //console.log("Received routerRtpCapabilities:", routerRtpCapabilities);
        //console.log("Existing producer IDs from server:", existingProducerIds || "None");

        const device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities });
        deviceRef.current = device;
        //console.log("Device loaded:", deviceRef.current);

        await createSendTransport(socket, device);
        //console.log("Send transport created:", sendTransport.current);
        await createRecvTransport(socket, device);
        //console.log("Recv transport created:", recvTransport.current);

        if (existingProducerIds && existingProducerIds.length > 0) {
          //console.log("Consuming existing producers:", existingProducerIds);
          for (const producerId of existingProducerIds) {
            //console.log(`Consuming existing producer ${producerId}`);
            await consume(producerId, socket);
          }
        }
        processQueue(socket);
      }
    );
  };

  const createSendTransport = async (socket: Socket, device: mediasoupClient.Device) => {
    return new Promise<void>((resolve) => {
      socket.emit("createTransport", { roomId: params.roomId }, async (data: any) => {
        //console.log("Send transport data received:", data);
        // sendTransport.current = device.createSendTransport(data);
        sendTransport.current = device.createSendTransport({
          id:data.id,
          iceParameters:data.iceParameters,
          iceCandidates:data.iceCandidates,
          dtlsParameters:data.dtlsParameters,
          iceServers:data.iceServers
        });

        sendTransport.current.on("connect", ({ dtlsParameters }:{dtlsParameters:DtlsParameters}, callback:any) => {
          //console.log("Connecting send transport:", sendTransport.current?.id);
          socket.emit("connectTransport", {
            transportId: sendTransport.current?.id,
            dtlsParameters,
          });
          callback();
        });

        sendTransport.current.on("produce", async ({ kind, rtpParameters }:{kind:MediaKind, rtpParameters:RtpParameters}, callback:any) => {
          //console.log(`Producing ${kind} track`);
          socket.emit(
            "produce",
            {
              roomId: params.roomId,
              transportId: sendTransport.current?.id,
              kind,
              rtpParameters,
            },
            ({ id }: { id: string }) => {
              //console.log(`Producer created with ID: ${id}`);
              callback({ id });
            }
          );
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        //console.log("Local stream tracks:", stream.getTracks());

        for (const track of stream.getTracks()) {
          const producer = await sendTransport.current!.produce({ track });
          producers.current.push(producer);
          //console.log(`Producer ${producer.id} for ${track.kind} started`);
        }
        resolve();
      });
    });
  };

  const createRecvTransport = async (socket: Socket, device: mediasoupClient.Device) => {
    return new Promise<void>((resolve) => {
      socket.emit("createTransport", { roomId: params.roomId }, (data: any) => {
        //console.log("Recv transport data received:", data);
        // recvTransport.current = device.createRecvTransport(data);
        recvTransport.current = device.createRecvTransport({
          id:data.id,
          iceParameters:data.iceParameters,
          iceCandidates:data.iceCandidates,
          dtlsParameters:data.dtlsParameters,
          iceServers:data.iceServers
        });

        recvTransport.current.on("connect", ({ dtlsParameters }:{dtlsParameters:DtlsParameters}, callback:any) => {
          //console.log("Connecting recv transport:", recvTransport.current?.id);
          socket.emit("connectTransport", {
            transportId: recvTransport.current?.id,
            dtlsParameters,
          });
          callback();
        });

        //console.log("✅ Receiver transport created with ID:", recvTransport.current?.id);
        processQueue(socket);
        resolve();
      });
    });
  };

  const processQueue = (socket: Socket) => {
    if (producerQueue.current.length > 0 && deviceRef.current && recvTransport.current) {
      //console.log("Processing queued producers:", producerQueue.current);
      producerQueue.current.forEach((producerId) => consume(producerId, socket));
      producerQueue.current = [];
    }
  };

  const consume = async (producerId: string, socket: Socket) => {
    //console.log("📡 Attempting to consume producer:", producerId);
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
      async (response: any) => {
        if (response.error) {
          console.error("❌ Consume error:", response.error);
          return;
        }

        //console.log("Consume response:", response);
        const consumer = await recvTransport.current!.consume({
          id: response.id,
          producerId: response.producerId,
          kind: response.kind,
          rtpParameters: response.rtpParameters,
        });

        consumers.current.push(consumer);

        const stream = new MediaStream();
        stream.addTrack(consumer.track);
        //console.log("Consumer track added to stream:", consumer.track);

        remoteVideosRef.current[producerId] = stream;
        setRemoteStreams(Object.values(remoteVideosRef.current));
        //console.log("✅ Stream added for producer:", producerId);
      }
    );
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        //console.log(`Video ${videoTrack.enabled ? "enabled" : "disabled"}`);
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
        //console.log(`Audio ${audioTrack.enabled ? "enabled" : "disabled"}`);
        if (!audioTrack.enabled) {
          producers.current.filter(p => p.kind === "audio").forEach(p => p.pause());
        } else {
          producers.current.filter(p => p.kind === "audio").forEach(p => p.resume());
        }
        Object.values(audioRefs.current).forEach((audioEl) => {
          if (audioEl) {
            audioEl.muted = false;
            //console.log("Ensuring remote audio element is not muted");
          }
        });
      }
    }
  };

  const exitRoom = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }
    if (sendTransport.current) sendTransport.current.close();
    if (recvTransport.current) recvTransport.current.close();
    producers.current.forEach(p => p.close());
    consumers.current.forEach(c => c.close());
    const producerIds = producers.current.map(p => p.id);
    socket?.emit("exitRoom", { roomId: params.roomId, producerIds });
    socket?.disconnect();
    setRemoteStreams([]);
    //console.log("Exited room, notified server with producer IDs:", producerIds);
  };

  useEffect(() => {
    remoteStreams.forEach((stream, index) => {
      const producerId = Object.keys(remoteVideosRef.current)[index];
      const videoEl = videoRefs.current[producerId];
      const audioEl = audioRefs.current[producerId];

      const tracks = stream.getTracks();
      const hasVideo = tracks.some(track => track.kind === "video");
      const hasAudio = tracks.some(track => track.kind === "audio");

      if (hasVideo && videoEl) {
        if (videoEl.srcObject !== stream) {
          //console.log(`Attaching stream to video element for producer ${producerId}`);
          videoEl.srcObject = stream;
          videoEl.muted = false;
        }
      }

      if (hasAudio && !videoEl && audioEl) {
        if (audioEl.srcObject !== stream) {
          //console.log(`Attaching stream to audio element for producer ${producerId}`);
          audioEl.srcObject = stream;
        }
      }
    });
  }, [remoteStreams]);

  const fullLink = window.location.href;
  const copyBtn = useRef<HTMLButtonElement>(null);
  const clickToChatRef = useRef<HTMLDivElement>(null);

  const clickToChat = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (clickToChatRef.current && e.target instanceof HTMLElement) {
      e.target.style.display = "none";
      clickToChatRef.current.style.display = "block";
    }
  };

  const showDone = () => {
    if (copyBtn.current) {
      copyBtn.current.style.display = "none";
      setTimeout(() => {
        if (copyBtn.current) {
          copyBtn.current.style.display = "block";
        }
      }, 2000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLink)
      .then(() => showDone())
      .catch(err => console.error("Failed to copy", err));
  };

  return (
    <div className='pt-20 bg-[#f2f2f2]/80'>
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
    />
    {
      showErrorModal && <Modal>
        <div className='min-[0px]:max-md:w-[95%] mx-auto'>
          <div className="w-auto flex justify-end"><button type="button" onClick={() => setShowErrorModal(false)} title='close'><IoClose className='text-gray-500 cursor-pointer font-bold size-8' /></button></div>
            <div className="bg-white rounded-lg text-center font-bold p-4">To join the class room you have to send join request to the class, then the teacher will review your request and enroll you to the class room, then you will be able to join the class room</div>
        </div>
      </Modal>
    }
      <div className='grid min-[0px]:max-md:grid-rows-2 md:grid-cols-2 w-full min-h-screen bg-[#fffafa]'>
        <div className='local-video-and-chat grid grid-rows-2 space-y-2'>
          <div className='relative my-auto'>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className='h-[80%] w-[80%] object-cover mt-2.5 mx-auto border-[#5cf25c] border-2 border-solid rounded-[10px]'
            />
            {localVideoRef.current && (
              <div className='mx-[10px] flex left-1/2 transform -translate-x-1/2 space-x-5 items-center bottom-10 absolute'>
                <button onClick={toggleVideo}>
                  {isVideoOn ? (
                    <div className='bg-black p-3 rounded-full'>
                      <IoVideocamOff size={28} color="white" />
                    </div>
                  ) : (
                    <div className='bg-white p-3 rounded-full'>
                      <IoVideocam size={28} color="black" />
                    </div>
                  )}
                </button>
                <button
                  onClick={exitRoom}
                  className='mx-[10px] bg-rose-500 px-2 py-2 rounded-[4px] text-white font-semibold flex items-center'
                >
                  Exit Room <IoMdExit size={24} />
                </button>
                <button onClick={toggleAudio} className='mx-[10px]'>
                  {isAudioOn ? (
                    <div className='bg-black p-3 rounded-full'>
                      <AiOutlineAudioMuted size={28} color="white" />
                    </div>
                  ) : (
                    <div className='bg-white p-3 rounded-full'>
                      <AiFillAudio size={28} color="black" />
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={clickToChat}
            className="px-2 py-1 h-fit mx-auto rounded-[4px] cursor-pointer bg-[#5cf25c] shadow-md"
          >
            Click to start chat
          </button>
          <div className="textChat hidden" ref={clickToChatRef}>
            <Chat roomId={params.roomId as string} socketToHandle={socket as Socket} role={role as string} username={username as string}/>
          </div>
        </div>
        <div className="videos-of-participants">
          <div className='produced-shareable-link w-[90%] h-fit py-4 px-2 mx-auto mt-2.5 bg-[#f2f2f2] rounded-[12px] flex items-center relative'>
            <code className='text-sm'>{fullLink}</code>
            <TiTick color="green" size={24} className='right-5 absolute'/>
            <button
              type="button"
              ref={copyBtn}
              onClick={handleCopy}
              className='bg-[#bfbfbf] p-2 absolute shadow-md rounded-[8px] right-5 my-auto cursor-pointer'
            >
              <IoClipboard />
            </button>
          </div>
          <div id="remote-videos" className='flex wrap py-2 w-[95%] mx-auto'>
            {remoteStreams.map((stream, index) => {
              const producerId = Object.keys(remoteVideosRef.current)[index];
              const tracks = stream.getTracks();
              const hasVideo = tracks.some(track => track.kind === "video");
              const hasAudio = tracks.some(track => track.kind === "audio");

              return (
                <div key={producerId} className='flex min-[0px]:max-md:flex-col min-[0px]:max-md:mx-auto'>
                  {hasVideo && (
                    <video
                      ref={(el) => {
                        if (el) {
                          videoRefs.current[producerId] = el;
                          if (el.srcObject !== stream) {
                            el.srcObject = stream;
                            el.muted = false;
                            //console.log(`Rendering video for producer ${producerId}`);
                          }
                        }
                      }}
                      autoPlay
                      playsInline
                      className='w-[200px] border-2 border-solid border-amber-400 rounded-[8px] mx-2'
                    />
                  )}
                  {hasAudio && !hasVideo && (
                    <audio
                      ref={(el) => {
                        if (el) {
                          audioRefs.current[producerId] = el;
                          if (el.srcObject !== stream) {
                            el.srcObject = stream;
                            //console.log(`Rendering audio for producer ${producerId}`);
                          }
                        }
                      }}
                      autoPlay
                      controls
                      className='hidden'
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}