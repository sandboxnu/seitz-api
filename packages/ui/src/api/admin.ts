import { Role } from "@seitz/shared";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

interface IGenericOption<T> {
  name: string;
  default: T;
}

interface INumberOption extends IGenericOption<number> {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

interface ITextOption extends IGenericOption<string> {
  type: "text";
  maxLength?: number;
}

interface IDropdownOption extends IGenericOption<number> {
  type: "dropdown";
  options: string[];
}

interface ICheckboxOption extends IGenericOption<boolean> {
  type: "checkbox";
}

interface IOptionGroup {
  type: "group";
  name: string;
  options: IOption[];
}

type IOption =
  | INumberOption
  | ITextOption
  | IDropdownOption
  | ICheckboxOption
  | IOptionGroup;

interface GetStageResponse {
  _id: string;
  type: string;
  stageLabel: string;
  options: IOptionGroup;
}

async function getStages() {
  const result = await axiosInstance.get<GetStageResponse[]>("admin/stages");
  return result.data;
}

async function getAdminUsers() {
  const result = await axiosInstance.get("admin/users");
  console.log(result.data);
  return result.data;
}

async function getAllUsers() {
  const result = await axiosInstance.get("auth/users");
  console.log(result.data);
  return result.data;
}

async function assignAdminRole(userId: string, role: Role) {
  return await axiosInstance.post(`admin/users/${userId}`, { role });
}

async function removeUserAsAdmin(userId: string) {
  return await axiosInstance.delete(`admin/users/${userId}`);
}

export default {
  getStages,
  getAdminUsers,
  getAllUsers,
  assignAdminRole,
  removeUserAsAdmin,
};
