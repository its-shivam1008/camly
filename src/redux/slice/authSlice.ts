import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  id:string;
  email:string;
  role:string;
  isUserLoggedIn:boolean;
}

interface UserData{
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

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
        state.id = '';
        state.email = '';
        state.role = '';
        state.isUserLoggedIn = false;
    },
    isLoggedIn: (state) => {
        if(document.cookie.length > 0){
            state.isUserLoggedIn = true;
        }else{
            state.isUserLoggedIn = false;
        }
    },
    saveUser: (state, action: PayloadAction<any>) => {
        state.id = action.payload.id
        state.email = action.payload.email
        state.role = action.payload.role
        state.isUserLoggedIn = action.payload.isUserLoggedIn
    },
  },
})

// Action creators are generated for each case reducer function
export const { logoutUser, isLoggedIn, saveUser } = authSlice.actions

export default authSlice.reducer