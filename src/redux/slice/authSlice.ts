import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
// import { useNavigate } from 'react-router-dom';

export interface AuthState {
  id:string;
  email:string;
  role:string;
  isUserLoggedIn:boolean;
}

const initialState: AuthState = {
  id:'',
  email:'',
  role:'',
  isUserLoggedIn:false
}
// const navigate = useNavigate();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      const token = localStorage.getItem('token');
      if(token){
        localStorage.removeItem('token');
      }
      state.id = '';
      state.email = '';
      state.role = '';
      state.isUserLoggedIn = false;
      // navigate('/');
    },
    isLoggedIn: (state) => {
      const userData:any = localStorage.getItem('user-data');
      const token:any = localStorage.getItem('token');
      if(token){
        state.email = userData.email;
        state.id = userData.id;
        state.role = userData.role;
        state.isUserLoggedIn = true;
      }
    },
    saveUser: (state, action: PayloadAction<AuthState>) => {
        state.id = action.payload.id
        state.email = action.payload.email
        state.role = action.payload.role
        state.isUserLoggedIn = action.payload.isUserLoggedIn
        const userData:any = {
          id:action.payload.id,
          email:action.payload.email,
          role:action.payload.id,
          isUserLoggedIn:action.payload.isUserLoggedIn,
        }
        localStorage.setItem('user-data',userData);
    },
  },
})

// Action creators are generated for each case reducer function
export const { logoutUser, isLoggedIn, saveUser } = authSlice.actions

export default authSlice.reducer