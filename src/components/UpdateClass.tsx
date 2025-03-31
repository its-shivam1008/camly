import { CgSpinner } from "react-icons/cg";
import { Bounce } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import {ToastContainer, toast} from 'react-toastify';
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "../types/AuthTypes";
import { ClassRoom } from "../types/ClassRoomTypes";
import Modal from "./Modal";
import { IoClose } from "react-icons/io5";


const UpdateClass = () => {
  
    const [isLoaderRunning, setIsLoaderRunning] = useState<boolean>(false);
    const [classArray, setClassArray] = useState<[ClassRoom]>([{createdById:'', id:'', name:'', description:'', passcode:''}]);
    const [isEditOpened, setIsEditOpened] = useState<boolean>(false);
    const [isUpdateButtonClicked, setIsUpdateButtonClicked] = useState<boolean>(false);
    const [classValue, setClassValue] = useState<ClassRoom>({name:'', description:'', passcode:'', id:'', createdById:''});
  
    const handleChange = (event:React.ChangeEvent<any>) => {
      const {name, value} = event.target;
      setClassValue((prvData:any) => ({
        ...prvData,
        [name]:value
      })) 
    }
  
    useEffect(() => {
      fetchClasses();
    }, [])

    const handleDelete = async(id:string) => {
      const token = localStorage.getItem('token');
      try{
        const response = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/teacher/delete-class/${id}`, {
          headers:{
            Authorization:`Bearer ${token}`
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
        await fetchClasses();
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
    const handleEdit = (element:ClassRoom) => {
      setIsEditOpened(true);
      setClassValue(element);
    }

    const handleSubmit = async (classId:string) => {
      setIsUpdateButtonClicked(true);
      const token = localStorage.getItem('token');
      try{
        const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/teacher/update-class/${classId}`, classValue,{
          headers:{
            Authorization:`Bearer ${token}`
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
        setClassValue(response.data.updatedClass)
        await fetchClasses();
        setIsUpdateButtonClicked(false);
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
        setIsUpdateButtonClicked(false);
      }

    }
  
    const fetchClasses = async () => {
      setIsLoaderRunning(true);
      const token =  localStorage.getItem('token');
      try{
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/teacher/classes`,{
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
        <h1 className='md:text-3xl text-xl text-green-900 font-bold pt-3'>Your Classroom</h1>
          <div className="mx-auto w-[80%] h-fit pb-4">
          {
            isEditOpened && <Modal>

              <div className='min-[0px]:max-md:h-screen min-[0px]:max-md:w-[95%] mx-auto'>
                <div className="w-auto flex justify-end"><button type="button" onClick={() => setIsEditOpened(false)} title='close'><IoClose className='text-gray-500 cursor-pointer font-bold size-8' /></button></div>
                <div className='bg-[#f2f2f2] p-4 rounded-[8px] w-auto'>
                <form action={() => handleSubmit(classValue.id)} className="space-y-5 flex flex-col">
                  <input onChange={handleChange} value={classValue.name} className='outline-green-800/70 h-12 outline-3 rounded-[6px] p-2 placeholder:text-black/70 placeholder:font-bold ' type="text" name="name" id="name" placeholder="Name of the class" required maxLength={50} minLength={3} />
                  <textarea onChange={handleChange} value={classValue.description} className='outline-green-800/70 outline-3 rounded-[6px] p-2 placeholder:text-black/70 placeholder:font-bold ' name="description" id="description" cols={20} rows={10} minLength={10} placeholder="Add a description"></textarea>
                  <input onChange={handleChange} value={classValue.passcode} className='outline-green-800/70 h-12 outline-3 rounded-[6px] p-2 placeholder:text-black/70 placeholder:font-bold ' type="text" name="passcode" id="passcode" placeholder="Set a passcode" required maxLength={10} minLength={6}/>
                  <button type="submit" className='py-2 bg-green-800 text-white/90 font-bold cursor-pointer rounded-[12px]'>{
                    isUpdateButtonClicked ? <div className='flex items-center gap-3 justify-center'><CgSpinner className='animate-spin size-5'/><span className="">Updating...</span></div> : 'Update'
                  }</button>
                </form>
                </div>
              </div>

            </Modal>
          }
          {
            isLoaderRunning ? <CgSpinner className='text-[rebeccapurple] size-18 animate-spin mx-auto'/> :
            classArray[0].id != '' ? classArray.map((elem:any, index:number)=>(
              <div key={index} ><div className="flex flex-col gap-2 bg-green-300/40 mt-6 px-3 py-3 rounded-[6px] hover:shadow-xl hover:shadow-[#D8bfd8] transition-all duration-400 ">
                  <h1 className='text-black/70 font-bold text-lg md:text:xl'>{elem.name}</h1>
                  <div className="font-semibold text-gray-500 text-sm">{elem.description.slice(0,50)}</div>
                  <div className={`flex gap-2 w-fit px-4 py-2 rounded-[8px]`}>
                    <button onClick={() => handleEdit(elem)} type="button" className='text-sm cursor-pointer font-bold'>Edit</button>
                    <button onClick={() => handleDelete(elem.id)} type="button" className='text-sm w-fit h-fit cursor-pointer text-red-500 font-bold'>Delete</button>
                  </div>
                  </div></div>
              )) : <div className='font-bold text-center my-5'>No class rooms found, make some class rooms to see them here.</div>
          }
          </div>
      </div>
    </>
  )
}

export default UpdateClass