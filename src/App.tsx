import Navbar from './components/Navbar.js';
import { Outlet } from 'react-router-dom';
import Footer from './components/Footer.js';


const App = () => {
    
  return (
    <>
        <Navbar/>
        <Outlet/>
        <Footer/>
    </>
  )
}

export default App