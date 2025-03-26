import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
// import { useNavigate } from 'react-router-dom';

export interface AuthState {
  id:string;
  email:string;
  role:string;
  isUserLoggedIn:boolean;
  isVerified:boolean;
}

const initialState: AuthState = {
  id:'',
  email:'',
  role:'',
  isUserLoggedIn:false,
  isVerified:false
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
      state.isVerified = false;
      // navigate('/');
    },
    saveUser: (state, action: PayloadAction<AuthState>) => {
        state.id = action.payload.id
        state.email = action.payload.email
        state.role = action.payload.role
        state.isUserLoggedIn = action.payload.isUserLoggedIn
        state.isVerified = action.payload.isVerified
    },
  },
})

// Action creators are generated for each case reducer function
export const { logoutUser, saveUser } = authSlice.actions

export default authSlice.reducer