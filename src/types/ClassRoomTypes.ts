export interface ClassRoom {
    createdById:string;
    id:string;
    name:string;
    description:string;
    passcode:string;
}

export interface CreateClassInterface{
    passcode:string;
    name:string;
    description:string;
}

export interface CreatedByUser {
    id:string;
    user:{
      name:string;
    }
  }

 export  interface FetchedStudentClass {
    id:string;
    name:string;
    description:string;
    createdBy:CreatedByUser;
  }