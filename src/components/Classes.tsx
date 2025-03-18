import { IoSearch } from "react-icons/io5";
import { FcLikePlaceholder } from "react-icons/fc";

const Classes = () => {
  const arr:any[] = [1,2,3,4,5,6,7,8,9,10];
  return (
    <div className='min-h-screen'>
        <div className="searchBar flex justify-center">
            <div className="searchBarAndButton my-3 flex items-center relative">
                <input type="search" name="searchBar" id="searchBar" className="w-88 h-10 rounded-full p-2 outline-2 outline-[#78ff78]"/>
                <button type="button" className="rounded-full p-2 bg-[#fffafa] absolute top-0.3 right-1"><IoSearch color={"#158215"} size={20}/></button>
            </div>
        </div>
        <div className="listOfClasses space-y-3 py-2">
            {
             arr.map((elem:any)=>{
                return(
                <div key={elem} className="course text-black py-3 flex space-x-10 items-center w-[90%] mx-auto rounded-[10px] bg-[#61e861]/30">
                <div className="logo p-2 rounded-full ">
                  <FcLikePlaceholder size={32}/>
                </div>
                <div className="TitleAndDescription flex flex-col space-y-1">
                  <div className="title font-bold text-2xl">Lorem, ipsum.</div>
                  <div className="description text-sm w-[70%] md:block hidden">Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus, molestias fugit. Deleniti, modi dignissimos accusamus ex consequuntur dolor omnis incidunt dolores corporis excepturi voluptate repellat fugiat similique, tenetur voluptates sit.</div>
                </div>
                <button type="button" className='px-2 py-1 transition-colors duration-300 cursor-pointer bg-transparent text-black border-black border-2 hover:bg-black rounded-[8px] hover:text-white font-bold tracking-widest mr-3'>Enroll</button>
              </div>)
              })
            }
        </div>
    </div>
  )
}

export default Classes