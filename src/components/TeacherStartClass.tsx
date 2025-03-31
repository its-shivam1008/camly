import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bounce } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import {ToastContainer, toast} from 'react-toastify';
import { ApiResponse } from '../types/AuthTypes';
import { CgSpinner } from 'react-icons/cg';
import { IoPlayForward } from "react-icons/io5";
import { ClassRoom, EnrolledStudents, JoinReuestsFetched } from '../types/ClassRoomTypes';

const TeacherStartClass = () => {
    const params = useParams();
    const navigate = useNavigate();

    const [isClassFetched, setIsClassFetched] = useState<boolean>(false);
    const [classDetails, setClassDetails] = useState<ClassRoom>({name:'', description:'', passcode:'', createdById:'', id:''});


    const handleClick = () =>{
        navigate(`/room/${classDetails.id}`)
    }

    useEffect(() => {
        fetchClass();
        handleFetchJoinRequest();
        handleFetchEnrollStudents();
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
            setIsClassFetched(false);
        }
    }

    const handleFetchJoinRequest = async () => {
        setIsJoinRequestFetched(true);
        try{
            const token =  localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/teacher/join-request?classId=${params.classId}`,{
                headers:{
                Authorization: `Bearer ${token}`
                }
            })
            setJoinRequestArray(response.data.classes)
            console.log(response.data.classes);
            setIsJoinRequestFetched(false);
        }catch(err){
            setIsJoinRequestFetched(false);
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
    const handleFetchEnrollStudents = async () => {
        setIsEnrolledStudentsFetched(true);
        try{
            const token =  localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/teacher/enroll-classes?classId=${params.classId}`,{
                headers:{
                Authorization: `Bearer ${token}`
                }
            })
            setEnrolledStudentsArray(response.data.classes)
            console.log("enrolled =>",response.data.classes);
            setIsEnrolledStudentsFetched(false);
        }catch(err){
            setIsEnrolledStudentsFetched(false);
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


    const [isJoinRequestFetched, setIsJoinRequestFetched] = useState<boolean>(false);
    const [isEnrolledStudentsFetched, setIsEnrolledStudentsFetched] = useState<boolean>(false);

    const [joinRequestArray, setJoinRequestArray] = useState<JoinReuestsFetched[]>([]);
    const [enrolledStudentsArray, setEnrolledStudentsArray] = useState<EnrolledStudents[]>([]);

    const [isEnrollDeleteButtonClicked, setIsEnrollDeleteButtonClicked] = useState<boolean>(false);
    const [isJoinDeleteButtonClicked, setIsJoinDeleteButtonClicked] = useState<boolean>(false);
    const [isEnrollButtonClicked, setIsEnrollButtonClicked] = useState<boolean>(false);

    const handleEnrollStudent = async (studentId:string) => {
        setIsEnrollButtonClicked(true);
        try{
            const token =  localStorage.getItem('token');
            const payload:any = {
                classId:params.classId,
                studentId:studentId
            }
            const response = await axios.put(`${import.meta.env.VITE_SERVER_URL}/teacher/enroll-student`, payload,{
                headers:{
                Authorization: `Bearer ${token}`
                }
            })
            toast.success( response.data.message,{
                position:'bottom-right',
                autoClose:5000,
                pauseOnHover:true,
                draggable:true,
                progress:undefined,
                theme:"colored",
                transition:Bounce
            });
            await handleFetchJoinRequest();
            await handleFetchEnrollStudents();
            setIsEnrollButtonClicked(false);
        }catch(err){
            setIsEnrollButtonClicked(false);
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

    const handleEnrollDeleteButton = async (studentId:string) => {
        setIsEnrollDeleteButtonClicked(true)
        try{
            const token =  localStorage.getItem('token');
            const response = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/teacher/enroll-student?classId=${params.classId}&studentId=${studentId}`, {
                headers:{
                Authorization: `Bearer ${token}`
                }
            })
            toast.success( response.data.message,{
                position:'bottom-right',
                autoClose:5000,
                pauseOnHover:true,
                draggable:true,
                progress:undefined,
                theme:"colored",
                transition:Bounce
            });
            await handleFetchEnrollStudents();
            setIsEnrollDeleteButtonClicked(false);
        }catch(err){
            setIsEnrollButtonClicked(false);
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
    const handleJoinDeleteButton = async (studentId:string) => {
        setIsJoinDeleteButtonClicked(true)
        try{
            const token =  localStorage.getItem('token');
            const response = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/teacher/join-request?classId=${params.classId}&studentId=${studentId}`, {
                headers:{
                Authorization: `Bearer ${token}`
                }
            })
            toast.success( response.data.message,{
                position:'bottom-right',
                autoClose:5000,
                pauseOnHover:true,
                draggable:true,
                progress:undefined,
                theme:"colored",
                transition:Bounce
            });
            await handleFetchJoinRequest();
            setIsJoinDeleteButtonClicked(false);
        }catch(err){
            setIsJoinDeleteButtonClicked(false);
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
            {
                classDetails.id != '' ? <div className="mx-auto w-[80%] h-fit pb-4">
                {
                    isClassFetched ? <CgSpinner className='text-[rebeccapurple] size-18 animate-spin mx-auto'/> : <div className="flex flex-col gap-2 bg-[#eaeab5] mt-6 px-3 py-2 rounded-[6px] hover:shadow-xl hover:shadow-[#D8bfd8] transition-all duration-400">
                        <h1 className='font-extrabold text-xl tracking-wider'>{classDetails.name}</h1>
                        <p>{classDetails.description}</p>
                        <div className='font-bold'>Passcode : {classDetails.passcode}</div>
                    </div>
                }
                <button onClick={handleClick} type="button" className='px-3 py-2 flex justify-center items-center bg-transparent border-2 rounded-[8px] border-black gap-2 mt-4 hover:shadow-xl  transition-shadow duration-300 cursor-pointer'><span className="font-bold text-black">Start Class</span><IoPlayForward className='text-black'/></button>
                <div className='grid grid-cols-2 gap-2'>
                    <div className="">
                        <h1 className='font-bold text-xl text-center'>Join Requests</h1>
                        {
                            isJoinRequestFetched ? <CgSpinner className='text-[rebeccapurple] size-10 animate-spin mx-auto'/> : <div className="flex flex-col space-y-2">
                                {
                                    joinRequestArray.length === 0 ? <div className="font-bold text-sm mx-auto">No join requests</div> : joinRequestArray.map((elem:JoinReuestsFetched, index:number) => {
                                        return <div key={index} className="rounded-md bg-gray-200/50 flex justify-between items-center py-3">
                                            <div className="font-semibold flex flex-col gap-1 pl-2">
                                                <h1 className="text-black">{elem.student.user.name}</h1>
                                                <h2 className="text-gray-500 text-xs">{elem.student.user.email}</h2>
                                            </div>
                                            <div className="button flex items-center">
                                                <button onClick={() => handleEnrollStudent(elem.studentId)} disabled={isEnrollButtonClicked} className="text-white bg-black px-2 py-1 cursor-pointer rounded-md disabled:bg-gray-400/50">{isEnrollButtonClicked ? <CgSpinner className='text-gray-800 size-5 animate-spin mx-auto'/>:'Enroll'}</button>
                                                <button type="button" onClick={() => handleJoinDeleteButton(elem.studentId)} disabled={isJoinDeleteButtonClicked} className='text-red-500 cursor-pointer px-2 py-1 rounded-md text-center'>{isJoinDeleteButtonClicked ? <CgSpinner className='text-red-500 size-5 animate-spin mx-auto'/>:'Delete'}</button>
                                            </div>
                                        </div>   
                                    })
                                }
                            </div>
                        }
                    </div>
                    <div className="">
                        <h1 className='font-bold text-xl text-center'>Enrolled Students</h1>
                        {
                            isEnrolledStudentsFetched ? <CgSpinner className='text-[rebeccapurple] size-10 animate-spin mx-auto'/> : <div className="flex flex-col space-y-2">
                                {
                                    enrolledStudentsArray.length === 0 ? <div className="font-bold text-sm mx-auto">No students enrolled</div> : enrolledStudentsArray.map((elem:EnrolledStudents, index:number) => {
                                        return <div key={index} className="rounded-md bg-gray-200/50 flex justify-between items-center py-3">
                                            <div className="font-semibold flex flex-col gap-1 pl-2">
                                                <h1 className="text-black">{elem.student.user.name}</h1>
                                                <h2 className="text-gray-500 text-xs">{elem.student.user.email}</h2>
                                            </div>
                                            <button type="button" onClick={() => handleEnrollDeleteButton(elem.studentId)} disabled={isEnrollDeleteButtonClicked} className='text-red-500 cursor-pointer px-2 py-1 rounded-md text-center'>{isEnrollDeleteButtonClicked ? <CgSpinner className='text-red-500 size-5 animate-spin mx-auto'/>:'Delete'}</button>
                                        </div>
                                    })
                                }
                            </div>
                        }
                    </div>
                </div>
            </div> : <div className='font-bold text-center my-5'>No class rooms found, make some class rooms to see them here.</div>
            }
            
        </div>
    </>
  )
}

export default TeacherStartClass;