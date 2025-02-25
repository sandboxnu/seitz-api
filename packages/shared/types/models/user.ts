import { Types } from "mongoose";

export enum Role {
  BasicUser = "Basic User",
  UserManager = "User Manager",
  StudyManager = "Study Manager",
  SuperAdmin = "Super Admin",
}

export interface CreateUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  studies?: Types.ObjectId[];
}

export interface IUser extends Required<CreateUser> {
  token: string;
  verified: boolean;
  verifyPassword(password: string): Promise<boolean>;
}
