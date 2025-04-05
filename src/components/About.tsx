

const About = () => {
  return (
    <div className='mx-auto min-h-screen bg-green-50/50'>
        <div className='w-[80%] mx-auto'>
        <h1 className='text-2xl font-bold text-green-900 pt-3'>Empowering Teachers, Securing Classrooms, Enhancing Online Learning</h1>
        <p className='my-10'> Our platform was born out of a simple but critical problem faced by countless teachers and students during the COVID-19 pandemic. Like many, we adapted to the sudden shift to online education, using popular platforms like Zoom. However, one major issue kept disrupting learning — unwanted participants. Anyone with a link or password could easily join a class, causing disturbances and ruining the learning experience.</p>

        <p className='my-10'> I decided it was time to fix this.

        Our app is a group video calling platform designed specifically for online teaching, built to ensure that virtual classrooms remain safe, focused, and productive.

        With our unique Join Request System, students cannot directly enter the class by just having a link or password. Instead, they must send a join request to the teacher. The teacher has full control to accept or decline these requests. Once approved, the student becomes part of the enrolled students list and can access the classroom. If a student becomes disruptive, the teacher can instantly remove them from the enrolled list, blocking them from rejoining unless they go through the join request process again.</p>

        <ol className='my-10 font-semibold text-green-800'>
            This ensures:
            <li>100% Teacher Control over who enters the class.</li>
            <li>Safe & Distraction-Free Learning for all students.</li>
            <li>Secure Online Classrooms tailored for education, not just generic video calls.</li>
        </ol>
        <p className='my-10'> Whether you're an educator teaching a group of students or running an online coaching center, our platform offers you the security, flexibility, and ease that you truly need.

        Join us in making online education better, safer, and more effective for everyone.</p>
        </div>
        </div>
  )
}

export default About