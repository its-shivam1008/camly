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