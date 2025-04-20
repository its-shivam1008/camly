
import { useEffect, useState } from 'react'
import { IoSend } from 'react-icons/io5'
import { Socket } from 'socket.io-client';
import { MessageType } from '../types/MessageTypes';

interface ChatInterface {
  roomId:string;
  username:string;
  role:string;
  socketToHandle:Socket;
}

const Chat: React.FC<ChatInterface> = ({roomId, socketToHandle, username, role}) => {

  const [message, setMessage] = useState<string>("");

  const [myChat, setMyChat] = useState<MessageType[]>([])

  useEffect(() => {
    if(!socketToHandle) return;
    
    socketToHandle.on("receiveMessage",({message, username, role})=>{
      setMyChat((prev) => [...prev, {message, username, role, isMessageFromOtherUser:true}])
    })
  
    return () => {
      socketToHandle.off("receiveMessage")
    }
  }, [socketToHandle])
  

  const handleSend = () => {
    socketToHandle.emit('message', {message, roomId, username, role});
    setMyChat((prev) => [...prev, {message, username, role, isMessageFromOtherUser:false}])
    setMessage("");
  }
  return (
    <div className="m-1.5 rounded-[8px] h-[400px] flex flex-col bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
      <div className='bg-transparent w-[95%] flex-grow mx-auto flex-col-reverse overflow-y-auto flex gap-1 py-1'> 
        {
          [...myChat].reverse().map((elem:MessageType, index:number)=> {
           return  <div key={index} className={`max-w-[70%] ${elem.isMessageFromOtherUser ? 'self-start rounded-t-2xl rounded-br-2xl':'self-end rounded-t-2xl rounded-bl-2xl'} bg-[#fffafa] px-2 py-1`}>
              <h1 className="text-xs font-bold text-[#41ae41]">{elem.isMessageFromOtherUser ? `${elem.username.split("@")[0]} (${elem.role})` : "You"}</h1>
              <div className="text-xs">{elem.message}</div>
            </div>
          })
        }
      </div>
      <div className="h-[60px] flex items-center bg-transparent"> 
        <div className="messagebox w-[95%] flex items-center mx-auto ">
          <input onChange={(e) => setMessage(e.target.value)} value={message} type="text" name="message" id="message" className='w-[85%] px-1 py-2 rounded-[6px] border-[#5cf25c] border-1 outline-[#5cf25c] bg-[#fffafa]/40 mx-2' />
          <button onClick={handleSend} type="button" className='bg-[#5cf25c] p-2 rounded-full cursor-pointer'><IoSend size={20} /></button>
        </div>
      </div>
    </div>
  )
}

export default Chat