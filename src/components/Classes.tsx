import { IoClose, IoSearch } from "react-icons/io5";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "../types/AuthTypes";
import {ToastContainer, toast} from 'react-toastify';
import { Bounce } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import { CgSpinner } from "react-icons/cg";
import { FetchedStudentClass } from "../types/ClassRoomTypes";
import Modal from "./Modal";

const Classes = () => {

  const initialStateFetchedClass = {name:'', description:'', id:'', createdBy:{id:'', user:{name:''}}}

  const [queryParam, setQueryParam] = useState<string>('');
  
  const [isClassesFetched, setIsClassesFetched] = useState<boolean>(false);
  const [classArray, setClassArray] = useState<FetchedStudentClass[]>([]);

  const [isClassOpened, setIsClassOpened] = useState<boolean>(false);
  const [classValue, setClassValue] = useState<FetchedStudentClass>(initialStateFetchedClass);

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

  const handleFetchClass = async (classId:string) =>{
    try{
      setIsClassOpened(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/student/get-class/${classId}`, {
          headers:{
              Authorization: `Bearer ${token}`
          }
      }); 
      setClassValue(response.data.existingClass);
    }catch(err){
      setIsClassOpened(false);
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
  const handleCloseModal = () => {
    setIsClassOpened(false);
    setClassValue(initialStateFetchedClass);
    setPasscode({passcode:''});
  }


  const handleClick = async(id:string) => {
    setIsClassOpened(true);
    await handleFetchClass(id);
  }

  interface PasscodeType {
    passcode:string
  }

  const [passcode, setPasscode] = useState<PasscodeType>({passcode:''});
  const [isButtonToJOinClassClicked, setIsButtonToJOinClassClicked] = useState<boolean>(false);

  const handleChangePasscode = (event:React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = event.target;
    setPasscode((prvData) => ({
      ...prvData,
      [name]:value
    }))
  }

  const handleClickToJoin = async (classId:string) => {
    setIsButtonToJOinClassClicked(true);
    try{
      const token = localStorage.getItem('token');
      const payload = {
        classId:classId,
        passcode:passcode.passcode
      }
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/student/join-request`, payload,{
          headers:{
              Authorization: `Bearer ${token}`
          }
      });
      toast.success( response.data.message,{
        position:'bottom-right',
        autoClose:5000,
        pauseOnHover:true,
        draggable:true,
        progress:undefined,
        theme:"colored",
        transition:Bounce
      });
      setIsButtonToJOinClassClicked(false);
    }catch(err){
      setIsButtonToJOinClassClicked(false);
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

  const handleSearch = async () =>{
    setIsClassesFetched(true);
    try{
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/student/search?query=${queryParam}`,{
          headers:{
              Authorization: `Bearer ${token}`
          }
      });
      console.log(response.data.anyClassFound, queryParam);
      setClassArray([
        ...response.data.anyClassFound,
      ]);
      setIsClassesFetched(false);
    }catch(err){
      setIsClassesFetched(false);
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
      await fetchClassRooms();
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
                  <input type="search" onChange={(e:React.ChangeEvent<HTMLInputElement>) => setQueryParam(e.target.value)} value={queryParam} name="searchBar" id="searchBar" className="w-88 h-10 rounded-full p-2 outline-2 outline-[#78ff78] placeholder:text-xs" placeholder='Search by class id, name or description of the class room'/>
                  <button type="button" onClick={handleSearch} className="rounded-full p-2 bg-[#fffafa] absolute top-0.3 right-1"><IoSearch color={"#158215"} size={20}/></button>
              </div>
          </div>
          <div className="listOfClasses space-y-3 py-2">
          {
            isClassOpened && <Modal>
              <div className='min-[0px]:max-md:h-screen min-[0px]:max-md:w-[95%] mx-auto'>
                <div className="w-auto flex justify-end"><button type="button" onClick={handleCloseModal} title='close'><IoClose className='text-gray-500 cursor-pointer font-bold size-8' /></button></div>
                <div className='bg-[#f2f2f2] p-4 rounded-[8px] w-auto'>
                  <h1 className='font-bold text-lg'>{classValue.name}</h1>
                  <div className="text-sm font-bold text-right"> {classValue.createdBy.user.name}</div>
                  <div className="text-sm">{classValue.description}</div>
                  <div className='flex gap-2 items-center mt-2'><input className='p-2 outline-2 outline-black placeholder:text-sm rounded-[4px]' type="password" name="passcode" id="passcode" value={passcode.passcode} onChange={handleChangePasscode} placeholder="Passcode to join the class" /><button onClick={() => handleClickToJoin(classValue.id)} type="button" disabled={isButtonToJOinClassClicked} className='bg-black rounded-[8px] w-[150px] h-10 cursor-pointer text-white disabled:bg-gray-400/50 shadow-lg px-2 py-1 flex items-center justify-center gap-2'>{isButtonToJOinClassClicked ? <CgSpinner className='text-gray-800 size-5 animate-spin mx-auto'/>:'Join Class'}</button></div>
                </div>
              </div>
            </Modal>
          }
              { isClassesFetched ? <CgSpinner className='text-[rebeccapurple] size-18 animate-spin mx-auto'/> : 
              classArray.map((elem:FetchedStudentClass, index:number)=>{
                  return(
                  <div key={index} onClick={() => handleClick(elem.id)} className="flex flex-col gap-2 mx-auto bg-green-300/40 mt-6 px-3 py-2 rounded-[6px] hover:shadow-xl hover:shadow-[#D8bfd8] transition-all duration-400 cursor-pointer w-[80%]">
                        <div className="title font-bold text-2xl">{elem.name}</div>
                        <div className="text-sm font-bold text-right">by {elem.createdBy.user.name}</div>
                        <div className="description text-sm w-[70%] text-gray-400">{elem.description.slice(0,50)}</div>                  
                </div>)
                })
              }
          </div>
      </div>
    </>
  )
}

export default Classes