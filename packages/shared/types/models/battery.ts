import { Types } from "mongoose";

export interface CreateGenericOption<T> {
  _id?: Types.ObjectId;
  name: string;
  default: T;
}

export interface CreateNumberOption extends CreateGenericOption<number> {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface CreateTextOption extends CreateGenericOption<string> {
  type: "text";
  maxLength?: number;
}

export interface CreateDropdownOption extends CreateGenericOption<number> {
  type: "dropdown";
  options: string[];
}

export interface CreateCheckboxOption extends CreateGenericOption<boolean> {
  type: "checkbox";
}

export interface CreateOptionGroup {
  _id?: Types.ObjectId;
  type: "group";
  name: string;
  options: CreateOption[];
}

interface IOptionGroup extends Required<CreateOptionGroup> {
  options: IOption[];
}

type CreateBasicOption =
  | CreateNumberOption
  | CreateTextOption
  | CreateDropdownOption
  | CreateCheckboxOption;

export type CreateOption = CreateBasicOption | CreateOptionGroup;

export type IOption = Required<CreateBasicOption> | IOptionGroup;

export interface CreateBatteryStage {
  _id?: Types.ObjectId;
  type: string;
  stageLabel: string;
  options: CreateOptionGroup;
  isVisibleToNonAdmins: boolean;
}

export interface IBatteryStage extends Required<CreateBatteryStage> {
  options: IOptionGroup;
}

export interface CreateBattery {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  imageUrl: string;
  stages: CreateBatteryStage[];
  deleted?: boolean;
}

export interface IBattery extends Required<CreateBattery> {
  stages: IBatteryStage[];
}

export interface CreateOptionValue {
  _id?: Types.ObjectId;
  option: Types.ObjectId;
  value: unknown;
}

export type IOptionValue = Required<CreateOptionValue>;

export interface CreateCustomizedBattery {
  _id?: Types.ObjectId;
  battery: Types.ObjectId;
  name: string;
  values: CreateOptionValue[];
}

export interface ICustomizedBattery extends Required<CreateCustomizedBattery> {
  values: IOptionValue[];
}
