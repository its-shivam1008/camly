// import React from 'react'
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { RootState } from "../redux/store";

const Navbar = () => {

  const {role} = useSelector((state:RootState) => state.auth);
  return (
    <div className="bg-gradient-to-b from-white to-transparent bg-opacity-50 backdrop-blur-xl shadow-md h-12 text-black flex justify-around sticky top-0 w-full z-20">
        <div className='bg-transparent h-[inherit] w-[95%] flex justify-between items-center'>
            <NavLink to="/" className="font-extrabold text-xl">
                Camly
            </NavLink>
            <div className='flex flex-row space-x-5'>
                {
                  role === "TEACHER" && <NavLink to={role==='TEACHER' ? '/teacher' : ''} className={({isActive}:{isActive:boolean}) => isActive ? "font-semibold px-2 py-1 rounded-full bg-[#001219] text-white cursor-pointer" : "font-semibold text-lg hover:text-white hover:bg-[#001219] rounded-full px-2 py-1 transition-colors duration-500 cursor-pointer"}>Teacher</NavLink>
                }
                <NavLink to='/about' className={({isActive}:{isActive:boolean}) => isActive ? "font-semibold px-2 py-1 rounded-full bg-[#001219] text-white cursor-pointer" : "font-semibold text-lg hover:text-white hover:bg-[#001219] rounded-full px-2 py-1 transition-colors duration-500 cursor-pointer"}>About</NavLink>
                <NavLink to='/class'className={({isActive}:{isActive:boolean}) => isActive ? "font-semibold px-2 py-1 rounded-full bg-[#001219] text-white cursor-pointer" : "font-semibold text-lg hover:text-white hover:bg-[#001219] rounded-full px-2 py-1 transition-colors duration-500 cursor-pointer"}>Classes</NavLink>
            <div className="hidden bg-[#001219] rounded-full px-2 py-1 text-white"></div>
            </div>
        </div>
    </div>
  )
}

export default Navbar