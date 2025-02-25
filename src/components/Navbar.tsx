// import React from 'react'
import { NavLink } from "react-router-dom"

const Navbar = () => {
  return (
    <div className="bg-gradient-to-b from-white to-transparent bg-opacity-50 backdrop-blur-xl shadow-md h-12 text-black flex justify-around sticky top-0 w-full z-20">
        <div className='bg-transparent h-[inherit] w-[95%] flex justify-between items-center'>
            <NavLink to="/" className="font-extrabold text-xl">
                Camly
            </NavLink>
            <div className='flex flex-row space-x-5'>
            <NavLink to='/room' className="font-semibold text-lg hover:text-white hover:bg-[#001219] rounded-full px-2 py-1 transition-colors duration-500 cursor-pointer">Room</NavLink>
                <NavLink to='#features' className="font-semibold text-lg hover:text-white hover:bg-[#001219] rounded-full px-2 py-1 transition-colors duration-500 cursor-pointer">Features</NavLink>
                <NavLink to='#' className="font-semibold text-lg hover:text-white hover:bg-[#001219] rounded-full px-2 py-1 transition-colors duration-500 cursor-pointer">Option3</NavLink>
            {/* <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
                 */}
            </div>
        </div>
    </div>
  )
}

export default Navbar