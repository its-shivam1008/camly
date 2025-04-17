import axios, { AxiosError } from "axios";
import { Link } from "react-router-dom"
import { ApiResponse } from "../types/AuthTypes";
import { useEffect, useState } from "react";
import { Bounce } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import {ToastContainer, toast} from 'react-toastify';
import {CgSpinner} from 'react-icons/cg';
import { ClassRoom } from "../types/ClassRoomTypes";

const GetClasses = () => {


  const [isLoaderRunning, setIsLoaderRunning] = useState<boolean>(false);
  const [classArray, setClassArray] = useState<[ClassRoom]>([{createdById:'', id:'', name:'', description:'', passcode:''}]);

  useEffect(() => {
    fetchClasses();
  }, [])

  const fetchClasses = async () => {
    setIsLoaderRunning(true);
    const token =  localStorage.getItem('token');
    try{
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL_PROD}/teacher/classes`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
      setClassArray(response.data.classRooms)
      setIsLoaderRunning(false);
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
      setIsLoaderRunning(false);
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
        <h1 className='md:text-3xl text-xl text-green-900 font-bold pt-3'>All your classrooms!!</h1>
        <div className="mx-auto w-[80%] h-fit pb-4">
            {
                isLoaderRunning ? <CgSpinner className='text-[rebeccapurple] size-18 animate-spin mx-auto'/> :
                classArray[0].id != '' ? classArray.map((elem:any, index:number)=>(
                  <Link key={index} to={`/teacher/class/${elem.id}`}><div className="flex flex-col gap-2 bg-green-300/40 mt-6 px-3 py-2 rounded-[6px] hover:shadow-xl hover:shadow-[#D8bfd8] transition-all duration-400">
                      <h1 className='text-black/70 font-bold text-lg md:text:xl'>{elem.name}</h1>
                      <div className="font-semibold text-gray-500 text-sm">{elem.description.slice(0,50)}</div>
                      </div></Link>
                  )) : <div className='font-bold text-center my-5'>No class rooms found, make some class rooms to see them here.</div>
            }
        </div>
    </div>
    </>
  )
}

export default GetClasses