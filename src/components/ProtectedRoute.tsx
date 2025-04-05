import { Navigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';

interface ProtectedRouteProps {
    element:React.ReactNode;
    allowedRoles:string[];
}


const ProtectedRoute:React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
  // const navigate = useNavigate();
    const { role, isVerified, isUserLoggedIn } = useSelector((state:RootState) => state.auth);

    const isUserVerified = () => {
    //   if(!isUserLoggedIn) return true;
      return isVerified; 
    };

    if(!isUserLoggedIn){
      return <Navigate to="/login" />
    }
  

    if (!isUserVerified()) {
      if (window.location.pathname !== '/verify') {
        return <Navigate to="/verify" />;
      }
    }

  const canAccess = (userRole:string) => {
    // if (!isUserLoggedIn) return allowedRoles.includes('GUEST');
    return allowedRoles.includes(userRole);
  };

  return canAccess(role) ? element : <Navigate to="/" />;
};

export default ProtectedRoute;