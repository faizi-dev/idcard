export interface Student {
  _id?: string;
  photoUrl: string;
  fullName: string;
  address: string;
  dateOfBirth: Date;
  mobileNumber: string;
  prnNumber: string;
  rollNumber: string;
  yearOfJoining: number;
  courseName: string;
  qrCode?: string;
  cardValidity?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}