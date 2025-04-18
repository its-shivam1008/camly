import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const ConditionalNavbar = () => {
    const location = useLocation();

    const hideNavbarfromPath = location.pathname.startsWith('/teacher') || location.pathname.startsWith('/about');
  return (
    (!hideNavbarfromPath && <Navbar />)
  )
}

export default ConditionalNavbar;