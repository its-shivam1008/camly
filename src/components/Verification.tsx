import React, { useRef, useState } from "react"


const Verification = () => {

    interface VerifyCodeState{
        verifyCode:string;
    }

    interface OtpInputField{
        [key: number] : string;
    }

    const [verifyCode, setVerifyCode] = useState<VerifyCodeState>({verifyCode:''});
    const [inputField, setInputField] = useState<OtpInputField>({});
    const inputRef = useRef<(HTMLInputElement | null)[]>([]);


    const handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        const {id, value}:any = event.target;
        setInputField((prvData) => ({
            ...prvData,
            [id]:value
        }));

        const combinedOtp = (inputField as any).join('');
        if(combinedOtp.length === 6) setVerifyCode(combinedOtp);

        if(id < inputRef.current.length -1 && value){
            const index:any= String(Number(id)+1)
            const nextInput = inputRef.current[index];
            if(nextInput){
                nextInput.focus();
            }
        }
        
    }

    const handleKeyDown = (index:number, event:React.KeyboardEvent<HTMLInputElement>) => {
        const place:any= String((Number(index))-1)
        const prevInput = inputRef.current[place];
        if((event.key ==="Backspace" || event.key==="Delete") && prevInput && index>0 && !inputField[index]){
            prevInput.focus();
        }
    }

    const handleSubmit = async()=>{
        alert(verifyCode);
    }



  return (
    <div className="w-full min-h-screen flex justify-center items-center ">
        <div className="verifyBox py-auto h-fit space-y-12 flex flex-col justify-between bg-[#e9ffd3] md:w-[40%] px-10 max-w-screen p-4 rounded-[20px] shadow-[#b5d397] shadow-xl">
            <div className='flex justify-center items-center flex-col space-y-4'>
                <h1 className="text-center text-2xl">Verify yourself</h1>
                <p className='text-sm'>A verififcation email has been sent to email</p>
            </div>
            <div className="inputField flex gap-5 justify-center">
                {
                    [...Array(6)].map((elem:any, index:number)=>{
                        return <input maxLength={1} ref={(e:any) => (inputRef.current[index] = e)} key={index} type="text" name="verifyCode" id={String(index)} value={inputField[index]} onKeyDown={(e) => handleKeyDown(index, e)} onChange={handleChange} className="outline-2 text-center outline-gray-400 focus:outline-3 focus:outline-gray-600  w-10 h-fit py-2 px-2 rounded-[10px]" />
                    })
                }
            </div>
            <div className="flex justify-between">
                <button className="ResendOtp&timer rounded-[10px] border-2 hover:border-black bg-black text-white px-3 py-2 cursor-pointer hover:bg-transparent hover:text-black transition-colors duration-400">Resent otp</button>
                <button onClick={handleSubmit} className="verify rounded-[10px] border-2 hover:border-black bg-black text-white px-3 py-2 cursor-pointer hover:bg-transparent hover:text-black transition-colors duration-400">Verify</button>
            </div>
        </div>
    </div>
  )
}

export default Verification