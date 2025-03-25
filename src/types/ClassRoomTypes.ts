export interface ClassRoom {
  createdById: string;
  id: string;
  name: string;
  description: string;
  passcode: string;
}

export interface CreateClassInterface {
  passcode: string;
  name: string;
  description: string;
}

export interface CreatedByUser {
  id: string;
  user: {
    name: string;
  }
}

export interface FetchedStudentClass {
  id: string;
  name: string;
  description: string;
  createdBy: CreatedByUser;
}

export interface Student {
  user: {
    email: string;
    name: string;
  }
}

export interface JoinReuestsFetched {
  classId: string;
  studentId: string;
  id: string;
  passcode: string;
  student: Student;
}

export interface EnrolledStudents {
  student: Student;
  id: string;
  studentId: string;
  classId: string;
}