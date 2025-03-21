import { useState } from "react";
import { CgSpinner } from "react-icons/cg";


const CreateClass = () => {

  interface CreateClassInterface{
    name:string;
    description:string;
    passcode:string;
  }

  const [isButtonClicked, setIsButtonClicked] = useState<boolean>(false);
  const [classValue, setClassValue] = useState<CreateClassInterface>({name:'', description:'', passcode:''});

  const handleChange = (event:React.ChangeEvent<any>) => {
    const {name, value} = event.target;
    setClassValue((prvData:any) => ({
      ...prvData,
      [name]:value
    })) 
  }

  const handleSubmit = async() => {

    setIsButtonClicked(true);
  }
  return (
    <div className='container min-h-screen bg-[#f2f2f2] space-y-8'>
      <h1 className='md:text-3xl text-xl text-green-900 font-bold pt-3'>Create new class room</h1>
      <div className="mx-auto w-[80%] h-10">
        <form action={handleSubmit} className="space-y-5 flex flex-col">
          <input onChange={handleChange} value={classValue.name} className='outline-green-800/70 h-12 outline-3 rounded-[6px] p-2 placeholder:text-black/70 placeholder:font-bold ' type="text" name="name" id="name" placeholder="Name of the class" required maxLength={50} minLength={3} />
          <textarea onChange={handleChange} value={classValue.description} className='outline-green-800/70 outline-3 rounded-[6px] p-2 placeholder:text-black/70 placeholder:font-bold ' name="description" id="description" cols={30} rows={10} minLength={10} maxLength={100} placeholder="Add a description"></textarea>
          <input onChange={handleChange} value={classValue.passcode} className='outline-green-800/70 h-12 outline-3 rounded-[6px] p-2 placeholder:text-black/70 placeholder:font-bold ' type="text" name="passcode" id="passcode" placeholder="Set a passcode" required maxLength={10} minLength={6}/>
          <button type="submit" className='py-4 bg-green-800 text-white/90 font-bold cursor-pointer rounded-[12px]'>{
            isButtonClicked ? <div className='flex items-center gap-3 justify-center'><CgSpinner className='animate-spin size-5'/><span className="">Creating...</span></div> : 'Create a class room'
          }</button>
        </form>
      </div>

    </div>
  )
}

export default CreateClass