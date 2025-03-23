import { IoSearch } from "react-icons/io5";
import { FcLikePlaceholder } from "react-icons/fc";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "../types/AuthTypes";
import {ToastContainer, toast} from 'react-toastify';
import { Bounce } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import { CgSpinner } from "react-icons/cg";

const Classes = () => {

  interface CreatedByUser {
    id:string;
    user:{
      name:string;
    }
  }

  interface FetchedStudentClass {
    id:string;
    name:string;
    description:string;
    createdBy:CreatedByUser;
  }
  
  const [isClassesFetched, setIsClassesFetched] = useState<boolean>(false);
  const [classArray, setClassArray] = useState<FetchedStudentClass[]>([]);

  useEffect(() => {
    fetchClassRooms();
  },[])

  const fetchClassRooms = async () => {
    setIsClassesFetched(true);
    try{
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/student/get-class`, {
          headers:{
              Authorization: `Bearer ${token}`
          }
      });    
      setClassArray(response.data.classRooms);
      console.log(response.data.classRooms);
      setIsClassesFetched(false);
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
      setIsClassesFetched(false);
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
      <div className='min-h-screen'>
          <div className="searchBar flex justify-center">
              <div className="searchBarAndButton my-3 flex items-center relative">
                  <input type="search" name="searchBar" id="searchBar" className="w-88 h-10 rounded-full p-2 outline-2 outline-[#78ff78]"/>
                  <button type="button" className="rounded-full p-2 bg-[#fffafa] absolute top-0.3 right-1"><IoSearch color={"#158215"} size={20}/></button>
              </div>
          </div>
          <div className="listOfClasses space-y-3 py-2">
              { isClassesFetched ? <CgSpinner className='text-[rebeccapurple] size-18 animate-spin mx-auto'/> : 
              classArray.map((elem:any)=>{
                  return(
                  <div key={elem} className="course text-black py-3 md:justify-between flex space-x-10 items-center w-[90%] mx-auto rounded-[10px] bg-[#61e861]/30">
                    <div className='flex gap-4 items-center '>
                      <div className="logo p-2 rounded-full ">
                        <FcLikePlaceholder size={32}/>
                      </div>
                      <div className="TitleAndDescription flex flex-col space-y-1">
                        <div className="title font-bold text-2xl">{elem.name}</div>
                        <div className="description text-sm w-[70%] md:block hidden">{elem.description.slice(0,50)}</div>
                      </div>
                    </div>
                  <button type="button" className='px-2 py-1 transition-colors duration-300 cursor-pointer bg-transparent text-black border-black border-2 hover:bg-black rounded-[8px] hover:text-white font-bold tracking-widest mr-3'>Enroll</button>
                </div>)
                })
              }
          </div>
      </div>
    </>
  )
}

export default Classes