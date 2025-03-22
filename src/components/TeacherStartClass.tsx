import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bounce } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import {ToastContainer, toast} from 'react-toastify';
import { ApiResponse } from '../types/AuthTypes';
import { CgSpinner } from 'react-icons/cg';
import { IoPlayForward } from "react-icons/io5";

const TeacherstartClass = () => {
    const params = useParams();

    const [isClassFetched, setIsClassFetched] = useState<boolean>(false);
    const [classDelatils, setClassDetails] = useState<any>({});

    useEffect(() => {
        fetchClass();
    }, []);

    const fetchClass = async () => {
        setIsClassFetched(true);
        try{
            const token =  localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/teacher/class/${params.classId}`,{
                headers:{
                Authorization: `Bearer ${token}`
                }
            })
            setClassDetails(response.data.existingClass);
            console.log(response.data.existingClass);
            setIsClassFetched(false);
        }catch(err){
            const axiosError = err as AxiosError<ApiResponse>;
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
        <div className='container bg-[#f2f2f2] min-h-screen'>
            <h1 className='md:text-3xl text-xl text-green-900 font-bold pt-3'>Your Classroom</h1>
            <div className="mx-auto w-[80%] h-fit pb-4">
                {
                    isClassFetched ? <CgSpinner className='text-[rebeccapurple] size-18 animate-spin mx-auto'/> : <div className="flex flex-col gap-2 bg-[#eaeab5] mt-6 px-3 py-2 rounded-[6px] hover:shadow-xl hover:shadow-[#D8bfd8] transition-all duration-400">
                        <h1 className='font-extrabold text-xl tracking-wider'>{classDelatils.name}</h1>
                        <p>{classDelatils.description}</p>
                        <div className='font-bold'>Passcode : {classDelatils.passcode}</div>
                    </div>
                }
                <button type="button" className='px-3 py-2 flex justify-center items-center bg-transparent border-2 rounded-[8px] border-black gap-2 mt-4 hover:shadow-xl  transition-shadow duration-300 cursor-pointer'><span className="font-bold text-black">Start Class</span><IoPlayForward className='text-black'/></button>
            </div>
        </div>
    </>
  )
}

export default TeacherstartClass;
