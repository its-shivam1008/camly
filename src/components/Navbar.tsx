// import React from 'react'
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { RootState } from "../redux/store";
import { useState } from "react";

const Navbar = () => {

  const {role} = useSelector((state:RootState) => state.auth);
  const [menuClicked, setMenuClicked] = useState<boolean>(false);

  const handleClick = () => {
    setMenuClicked(!menuClicked);
  }


  return (
    <div className="bg-gradient-to-b from-white to-transparent bg-opacity-50 backdrop-blur-xl shadow-md h-12 text-black flex justify-around sticky top-0 w-full z-20">
        <div className='bg-transparent h-[inherit] w-[95%] flex justify-between items-center'>
            <NavLink to="/" className="font-extrabold text-xl">
                Camly
            </NavLink>
           {
              !menuClicked &&  <div onClick={handleClick} className="menu md:hidden flex flex-col gap-1">
              <div className="w-8 h-1 rounded-full bg-black"></div>
              <div className="w-8 h-1 rounded-full bg-black"></div>
              <div className="w-8 h-1 rounded-full bg-black"></div>
            </div>
           }
           {
             menuClicked && <div className="flex flex-col justify-center absolute top-12 items-center bg-white w-full rounded-b-[8px]">
              {
                  role === "TEACHER" && <NavLink to={role==='TEACHER' ? '/teacher' : ''} className={({isActive}:{isActive:boolean}) => isActive ? "font-semibold px-2 py-1 rounded-full bg-[#001219] text-white cursor-pointer" : "font-semibold text-lg hover:text-white hover:bg-[#001219] rounded-full px-2 py-1 transition-colors duration-500 cursor-pointer"}>Teacher</NavLink>
                }
                <NavLink to='/about' className={({isActive}:{isActive:boolean}) => isActive ? "font-semibold px-2 py-1 rounded-full bg-[#001219] text-white cursor-pointer" : "font-semibold text-lg hover:text-white hover:bg-[#001219] rounded-full px-2 py-1 transition-colors duration-500 cursor-pointer"}>About</NavLink>
                <NavLink to='/class'className={({isActive}:{isActive:boolean}) => isActive ? "font-semibold px-2 py-1 rounded-full bg-[#001219] text-white cursor-pointer" : "font-semibold text-lg hover:text-white hover:bg-[#001219] rounded-full px-2 py-1 transition-colors duration-500 cursor-pointer"}>Classes</NavLink>
             </div>
           }
           {
              menuClicked && <div onClick={handleClick} className="text-2xl font-bold text-black">X</div>
           }
            <div className='md:flex flex-row space-x-5 hidden'>
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