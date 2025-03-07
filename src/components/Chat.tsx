import React from 'react'
import { IoSend } from 'react-icons/io5'

const Chat = () => {
  return (
    <div className="m-1.5 rounded-[8px] h-full flex flex-col bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
      <div className='bg-transparent w-[95%] mx-auto flex-grow relative'> 
        <div className="bottom-1 right-10 absolute bg-[#fffafa] px-2 py-1 rounded-t-2xl rounded-bl-2xl">
          <h1 className="text-xs font-bold text-[#41ae41]">You</h1>
          <div className="text-sm">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime, ipsa!</div>
        </div>
      </div>
      <div className="h-[20%] flex items-center bg-transparent"> 
        <div className="messagebox w-[95%] flex items-center mx-auto ">
          <input type="text" name="message" id="message" className='w-[85%] px-1 py-2 rounded-[6px] border-[#5cf25c] border-1 outline-[#5cf25c] bg-[#fffafa]/40 mx-2' />
          <button type="button" className='bg-[#5cf25c] p-2 rounded-full cursor-pointer'><IoSend size={20} /></button>
        </div>
      </div>
    </div>
  )
}

export default Chat