import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slice/counterSlice';
import  authSlice, { AuthState }  from './slice/authSlice';


const loadState = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  if(token && userData){
    const parsedData:AuthState = JSON.parse(userData);
    return {
      auth : {
        id:parsedData.id,
        email:parsedData.email,
        role:parsedData.role,
        isUserLoggedIn:true,
        isVerified:parsedData.isVerified
      }
    }
  }
  return undefined;
}

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth:authSlice
  },
  preloadedState:loadState(),
});


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch