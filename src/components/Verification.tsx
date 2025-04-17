import axios, { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { VerifyCodeState, OtpInputField, ApiResponse } from "../types/AuthTypes";
import {useTimer} from 'react-timer-hook';
import {ToastContainer, toast} from 'react-toastify';
import { Bounce } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import {CgSpinner} from 'react-icons/cg';
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const Verification = () => {

    const time = new Date();
    time.setSeconds(time.getSeconds() + 120);
    const expiryTime:Date = time;

    const {start, restart, minutes, seconds} = useTimer({expiryTimestamp:expiryTime});
    const [isResendClicked, setIsResendClicked] = useState<boolean>(true);
    const [isVerifyClicked, setIsVerifyClicked] = useState<boolean>(false);

    const [verifyCode, setVerifyCode] = useState<VerifyCodeState>({verifyCode:''});
    const [inputField, setInputField] = useState<OtpInputField>({});
    const inputRef = useRef<(HTMLInputElement | null)[]>([]);

    const userObj = useSelector((state:RootState) => state.auth);
    // const [flag, setFlag] = useState<boolean>(false);
    // const dispatch = useDispatch();

    useEffect(()=>{
        // if(userObj.isUserLoggedIn && !flag){
        //     dispatch(isLoggedIn());
        //     setFlag(true);
        // }
        start();
        setTimeout(() => {
            setIsResendClicked(false);
        }, 120000)
        if(inputRef.current[0]){
            inputRef.current[0].focus();
        }
    }, []);

    const enableCount = () => {
        const resetTime = new Date();
        resetTime.setSeconds(resetTime.getSeconds()+120);
        restart(resetTime);
        setTimeout(()=>{
            setIsResendClicked(false);
        },120000);
    }

    const handleResend = async () => {
        setIsResendClicked(true);
        enableCount();
        
        try{
            const response = await axios.put(`${import.meta.env.VITE_SERVER_URL_PROD}/user/resend-otp`, {email:'saboteurshivam@gmail.com'})
            toast.success( response.data.message,{
                position:'bottom-right',
                autoClose:5000,
                pauseOnHover:true,
                draggable:true,
                progress:undefined,
                theme:"colored",
                transition:Bounce
            })
        }catch(err){
            const axiosError = err as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message,{
                position:'bottom-right',
                autoClose:5000,
                pauseOnHover:true,
                draggable:true,
                progress:undefined,
                theme:"colored",
                transition:Bounce
            });
        }
    }


    const handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        const {id, value}:any = event.target;

        setInputField((prvData) => {
            const newInputField = {...prvData, [id]:value};
            const combinedOtp = Object.values(newInputField).join("").slice(0,6);
            setVerifyCode({verifyCode:combinedOtp});
            return newInputField;
        })

        if(id < inputRef.current.length -1 && value){
            const index:any= Number(id)+1
            const nextInput = inputRef.current[index];
            if(nextInput){
                nextInput.focus();
            }
        }
        
    }

    const handleKeyDown = (index:number, event:React.KeyboardEvent<HTMLInputElement>) => {
        const place:any= Number(index) - 1;
        const prevInput = inputRef.current[place];
        if((event.key ==="Backspace" || event.key==="Delete") && prevInput && index>0 && !inputField[index]){
            prevInput.focus();
        }
    }
    
    const handleSubmit = async()=>{
        setIsVerifyClicked(true);
        try{
            const payload = {
                email:userObj.email,
                ...verifyCode
            }
            const response = await axios.put(`${import.meta.env.VITE_SERVER_URL_PROD}/user/verify`, payload);
            toast.success( response.data.message,{
                position:'bottom-right',
                autoClose:5000,
                pauseOnHover:true,
                draggable:true,
                progress:undefined,
                theme:"colored",
                transition:Bounce
            });
            setIsVerifyClicked(false);
        }catch(err){
            const axiosError = err as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message,{
                position:'bottom-right',
                autoClose:5000,
                pauseOnHover:true,
                draggable:true,
                progress:undefined,
                theme:"colored",
                transition:Bounce
            });
            setIsVerifyClicked(false);
        }
    }



  return (
    <>
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
    <div className="w-full min-h-screen flex justify-center items-center ">
        <div className="verifyBox min-[0px]:max-md:px-2 min-[0px]:max-md:w-90 py-auto h-fit space-y-12 flex flex-col justify-between bg-[#e9ffd3] md:w-[40%] px-10 max-w-screen p-4 rounded-[20px] shadow-[#b5d397] shadow-xl">
            <div className='flex justify-center items-center flex-col space-y-4'>
                <h1 className="text-center text-2xl">Verify yourself</h1>
                <p className='text-sm text-center'>A verification email has been sent to {userObj.email}</p>
            </div>
            <div className="inputField flex min-[0px]:max-md:gap-3 gap-5 justify-center">
                {
                    [...Array(6)].map((elem:any, index:number)=>{
                        return <input maxLength={1} ref={(e:any) => (inputRef.current[index] = e)} key={index+(elem-elem)} type="text" name="verifyCode" id={String(index)} value={inputField[String(index)]} onKeyDown={(e) => handleKeyDown(index, e)} onChange={handleChange} className="outline-2 text-center outline-gray-400 focus:outline-3 focus:outline-gray-600 min-[0px]:max-md:px-1  w-10 h-fit py-2 px-2 rounded-[10px]" />
                    })
                }
            </div>
            <div className="flex justify-between">
                <button onClick={handleResend} disabled={isResendClicked} className="ResendOtp&timer disabled:bg-white disabled:text-black  rounded-[10px] border-2 hover:border-black bg-black text-white px-3 py-2 cursor-pointer hover:bg-transparent hover:text-black transition-colors duration-400">{isResendClicked ? minutes+':'+seconds : 'Resend Otp' }</button>
                <button onClick={handleSubmit} disabled={isVerifyClicked} className="verify flex gap-1 items-center disabled:bg-black/50 rounded-[10px] border-2 hover:border-black bg-black text-white px-3 py-2 cursor-pointer hover:bg-transparent hover:text-black transition-colors duration-400">{isVerifyClicked ? <CgSpinner className='animate-spin size-5'/> : ''}Verify</button>
            </div>
        </div>
    </div>
    </>
  )
}

export default Verification