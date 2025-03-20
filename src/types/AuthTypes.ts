export interface VerifyCodeState{
    verifyCode:string;
}

export interface OtpInputField{
    [key: string] : string;
}

export interface ApiResponse{
    success:boolean;
    message:string;
}

export interface User{
    name:string;
    email:string;
    password:string;
    role:string;
}

export interface LoginUser{
    email:string;
    password:string;
}
