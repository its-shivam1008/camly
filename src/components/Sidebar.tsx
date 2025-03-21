import { IoLogOut } from 'react-icons/io5';
import { logoutUser } from '../redux/slice/authSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdOutlineFiberNew, MdUpdate } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";

const Sidebar = ({children}:{children:React.ReactNode}) => {
  const dispatch = useDispatch();
  const currentPath = useLocation();

  

  return (
    <div className='grid grid-cols-[1fr_6fr] md:grid-cols-[1fr_3fr] min-h-screen'>
      
      <div className=' md:p-5 pt-5 pl-2  bg-[#f2f2f2] space-y-20'>
        <div className="space-y-8">
          <Link to={'/teacher'} className={`${currentPath.pathname== '/teacher' ? 'bg-gradient-to-r shadow-2xl from-green-100 to-teal-100 text-green-900 rounded-full p-3':'text-green-600'} flex gap-4 items-center font-bold text-xl`}><MdOutlineFiberNew className={`${currentPath.pathname== '/teacher' ? 'text-green-900':'text-green-900'} size-8`} /><div className='hidden md:flex'>Class</div></Link>
          <Link to={'/teacher/update'} className={`${currentPath.pathname== '/teacher/update' ? 'bg-gradient-to-r shadow-2xl from-green-100 to-teal-100 text-green-900 rounded-full p-3':'text-green-600'} flex gap-4 items-center font-bold text-xl`}><MdUpdate className={`${currentPath.pathname== '/teacher/update' ? 'text-green-900':'text-green-900'} size-8`} /><div className='hidden md:flex'>Update</div></Link>
          <Link to={'/teacher/classes'} className={`${currentPath.pathname== '/teacher/classes' ? 'bg-gradient-to-r shadow-2xl from-green-100 to-teal-100 text-green-900 rounded-full p-3':'text-green-600'} flex gap-4 items-center font-bold text-xl`}><LiaChalkboardTeacherSolid className={`${currentPath.pathname== '/teacher/classes' ? 'text-green-900':'text-green-900'} size-8`} /><div className='hidden md:flex'>Class Room</div></Link>
        </div>
        
        <div className='text-green-900 flex gap-2 items-center cursor-pointer' onClick={()=>{dispatch(logoutUser())}}><IoLogOut className='text-green-900 size-5' /><div className='hidden md:flex'>Logout</div></div>
      </div>
      <div className=''>{children}</div>
    </div>
  )
}

export default Sidebar