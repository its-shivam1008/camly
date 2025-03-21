import { Link } from "react-router-dom"

const GetClasses = () => {

  return (
    <div className='container bg-[#f2f2f2] min-h-screen'>
        <h1 className='md:text-3xl text-xl text-green-900 font-bold pt-3'>All your classrooms!!</h1>
        <div className="mx-auto w-[80%] h-fit pb-4">
            {
                [...Array(6)].map((elem:any, index:number)=>(
                    <Link key={index} to='#'><div className="flex flex-col gap-2 bg-[#ececb7] mt-6 px-3 py-2 rounded-[6px] hover:shadow-xl hover:shadow-[#D8bfd8] transition-all duration-400">
                        <h1 className='text-black/70 font-bold text-lg md:text:xl'>Title</h1>
                        <div className="font-semibold text-gray-500 text-sm">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptatibus, magnam ut dolorum eos sapiente officia autem repudiandae aliquid sit quidem! Odio ullam necessitatibus vero repellat corrupti autem dolores impedit, dicta quae, natus accusantium. Sequi corrupti numquam dolorum quis obcaecati, quo labore exercitationem. Aperiam eaque debitis et omnis natus, sed asperiores magni harum architecto ducimus laboriosam quos laudantium amet, qui perspiciatis!</div>
                        </div></Link>
                ))
            }
        </div>
    </div>
  )
}

export default GetClasses