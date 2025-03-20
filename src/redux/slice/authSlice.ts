import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  id:string | null;
  email:string | null;
  role:string | null;
  isUserLoggedIn:boolean;
}

const initialState: AuthState = {
  id:null,
  email:null,
  role:null,
  isUserLoggedIn:false
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
        state.id = null;
        state.email = null;
        state.role = null;
        state.isUserLoggedIn = false;
    },
    isLoggedIn: (state) => {
        if(document.cookie.length > 0){
            state.isUserLoggedIn = true;
        }else{
            state.isUserLoggedIn = false;
        }
    },
    saveUser: (state, action: PayloadAction<AuthState>) => {
        state.id = action.payload.id;
        state.email = action.payload.email;
        state.role = action.payload.role;
    },
  },
})

// Action creators are generated for each case reducer function
export const { logoutUser, isLoggedIn, saveUser } = authSlice.actions

export default authSlice.reducer