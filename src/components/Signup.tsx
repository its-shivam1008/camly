import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from 'axios';
import { ApiResponse, User } from "../types/AuthTypes";
import {ToastContainer, toast} from 'react-toastify';
import { Bounce } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import {CgSpinner} from 'react-icons/cg';
import { AuthState, saveUser } from "../redux/slice/authSlice";
import { useDispatch } from "react-redux";

export default function Signup() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [user, setUser] = useState<User>({email:'', role:'STUDENT', password:'', name:''});
    const [isSignUpClicked, setIsSignUpClicked] = useState<boolean>(false);

    const handleChange = (event:React.ChangeEvent<HTMLInputElement>) =>{
        const {name, value}:any = event.target;
        setUser((prvData) => ({
            ...prvData,
            [name]:value
        }))
    }

    const authMe = async () =>{
        const token = localStorage.getItem('token');
        try{
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL_PROD}/user/auth/me`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            if(response.data.user){
                const user:AuthState = {id:response.data.user.id, email:response.data.user.email, role:response.data.user.role, isUserLoggedIn:true, isVerified:response.data.user.isVerified}
                localStorage.setItem('userData', JSON.stringify(user));
                dispatch(saveUser(user));
                setIsSignUpClicked(false);
                navigate('/verify')
            }
        }catch(err){
            toast.error("Some error while authenticating the user",{
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


    const handleSignUp = async () =>{
        setIsSignUpClicked(true);
        try{
            const response = await axios.post(`${import.meta.env.VITE_SERVER_URL_PROD}/user/signup`, user);
            toast.success( response.data.message,{
                position:'bottom-right',
                autoClose:5000,
                pauseOnHover:true,
                draggable:true,
                progress:undefined,
                theme:"colored",
                transition:Bounce
            });
            localStorage.setItem('token', response.data.token);
            await authMe();
            
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
            setIsSignUpClicked(false);
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
        <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center min-[0px]:max-md:mt-20">
            <div className="max-w-screen m-0 sm:m-10 bg-white shadow md:rounded-[120px] sm:rounded-[20px] flex justify-center flex-1">
                <div className="flex-1 bg-white text-center hidden lg:flex rounded-l-[20px]">
                    <div className="m-12 xl:m-16  w-full bg-contain bg-center bg-no-repeat bg-[url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')]">
                    </div>
                </div>
                <div className="lg:w-1/2 xl:w-5/12 p-3 sm:p-12">
                <div className='w-50 h-10 mx-auto my-2'>
                        <img src="./newLogo.png" alt='app logo here'
                            className="mx-auto w-50 h-10 object-cover" />
                    </div>
                    <div className="mt-2 flex flex-col items-center">
                        <h1 className="text-2xl xl:text-3xl font-extrabold my-1">
                            Sign up
                        </h1>
                        <div className="w-full flex-1 mt-3">
                        <div className="mx-auto max-w-xs">
                            <form action={handleSignUp}>
                                <input onChange={handleChange} value={user.name} required
                                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                                    type="text" placeholder="Name" name="name"/>
                                <input onChange={handleChange} value={user.email} required
                                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-2"
                                    type="email" placeholder="Email" name="email"/>
                                <div className="flex justify-evenly items-center py-2">
                                    <p className='font-bold'>You are a :</p>
                                    <label className={`rounded-[6px] px-2 py-1 cursor-pointer ${user.role==='TEACHER'? 'text-white bg-[#3f9e3f]/70':'text-[#3f9e3f]' } border-2 border-[#3f9e3f]`}><input className='hidden' type="radio" name="role" onChange={handleChange} value="TEACHER" checked={user.role === "TEACHER"} />Teacher</label>
                                    <label className={`rounded-[6px] px-2 py-1 cursor-pointer ${user.role==='STUDENT'? 'text-white bg-[#3f9e3f]/70':'text-[#3f9e3f]' } border-2 border-[#3f9e3f]`}><input className='hidden' type="radio" name="role" onChange={handleChange} value="STUDENT" checked={user.role === "STUDENT"}/>Student</label>
                                </div>
                                <input onChange={handleChange} value={user.password} required
                                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-2"
                                    type="password" placeholder="Password" name="password"/>
                                <button type="submit" disabled={isSignUpClicked}
                                    className="mt-5 tracking-wide font-semibold disabled:bg-[#3f9e3f]/50 bg-[#3f9e3f] text-gray-100 w-full py-4 rounded-lg hover:bg-[#355c35] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none cursor-pointer">
                                    {
                                        isSignUpClicked ? <CgSpinner className='animate-spin size-5'/> : <svg className="w-6 h-6 -ml-2" fill="none" stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                        <circle cx="8.5" cy="7" r="4" />
                                        <path d="M20 8v6M23 11h-6" />
                                    </svg>
                                    }
                                    <span className="ml-3">
                                        Sign up
                                    </span>
                                </button>
                                
                            </form>
                                </div>
                            
        
                            <div className="my-6 border-b text-center">
                                <div
                                    className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                                    Or continue with
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <button
                                    className="w-full max-w-xs font-bold shadow-sm rounded-lg py-2 bg-white border-2 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline cursor-pointer">
                                    <div className="bg-white p-2 rounded-full">
                                        <svg className="w-4" viewBox="0 0 533.5 544.3">
                                            <path
                                                d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
                                                fill="#4285f4" />
                                            <path
                                                d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
                                                fill="#34a853" />
                                            <path
                                                d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
                                                fill="#fbbc04" />
                                            <path
                                                d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
                                                fill="#ea4335" />
                                        </svg>
                                    </div>
                                    <span className="ml-2">
                                        Sign up with Google
                                    </span>
                                </button>
        
                                <button
                                    className="w-full max-w-xs font-bold shadow-sm rounded-lg py-2 bg-white border-2 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-3 cursor-pointer">
                                    <div className="bg-white p-1 rounded-full">
                                        <svg className="w-6" viewBox="0 0 32 32">
                                            <path fillRule="evenodd"
                                                d="M16 4C9.371 4 4 9.371 4 16c0 5.3 3.438 9.8 8.207 11.387.602.11.82-.258.82-.578 0-.286-.011-1.04-.015-2.04-3.34.723-4.043-1.609-4.043-1.609-.547-1.387-1.332-1.758-1.332-1.758-1.09-.742.082-.726.082-.726 1.203.086 1.836 1.234 1.836 1.234 1.07 1.836 2.808 1.305 3.492 1 .11-.777.422-1.305.762-1.605-2.664-.301-5.465-1.332-5.465-5.93 0-1.313.469-2.383 1.234-3.223-.121-.3-.535-1.523.117-3.175 0 0 1.008-.32 3.301 1.23A11.487 11.487 0 0116 9.805c1.02.004 2.047.136 3.004.402 2.293-1.55 3.297-1.23 3.297-1.23.656 1.652.246 2.875.12 3.175.77.84 1.231 1.91 1.231 3.223 0 4.61-2.804 5.621-5.476 5.922.43.367.812 1.101.812 2.219 0 1.605-.011 2.898-.011 3.293 0 .32.214.695.824.578C24.566 25.797 28 21.3 28 16c0-6.629-5.371-12-12-12z" />
                                        </svg>
                                    </div>
                                    <span className="ml-2">
                                        Sign up with GitHub
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className='text-center mt-6'>
                        Already have an account ? <Link className='text-green-600 hover:text-green-700' to='/login'>login</Link>
                    </p>
                </div>
            </div>
        </div>
        </>
    )
  }
  