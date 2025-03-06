// import React from 'react'

const Chat = () => {
  return (
    <div className="flex flex-col bg-[#fffafa]">
        <div className="area min-h-auto">

        </div>
        <div className="messageBar h-[12%] ">
            <div className="inputBar my-1 mx-1 w-auto h-auto rounded-[6px] relative">

                <button type="button" className="sendBtn rounded-full w-2 h-2 absolute right-0">send</button>
            </div>
        </div>
    </div>
  )
}

export default Chat