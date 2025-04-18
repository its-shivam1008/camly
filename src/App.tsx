// import Navbar from './components/Navbar.js';
import { Outlet } from 'react-router-dom';
import Footer from './components/Footer.js';
import ConditionalNavbar from './components/ConditionalNavbar.js';


const App = () => {
    
  return (
    <>
        <ConditionalNavbar/>
        <Outlet/>
        <Footer/>
    </>
  )
}

export default App;