import React from 'react'
import { IoSend } from 'react-icons/io5'

const Chat = () => {
  return (
    <div className="h-full flex flex-col">
      <div className='bg-[#fffafa] flex-grow'> messagee display </div>
      <div className="h-[20%] flex items-center"> 
        <div className="messagebox w-[95%] flex items-center mx-auto ">
          <input type="text" name="message" id="message" className='w-[85%] px-1 py-2 rounded-[6px] border-[#5cf25c] border-1 outline-[#5cf25c] bg-[#fffafa] mx-2' />
          <button type="button" className='bg-[#5cf25c] p-2 rounded-full cursor-pointer'><IoSend size={20} /></button>
        </div>
      </div>

    </div>
  )
}

export default Chat