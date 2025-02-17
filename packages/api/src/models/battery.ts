import { Schema, model } from "mongoose";
import type {
  CreateCheckboxOption,
  CreateDropdownOption,
  CreateNumberOption,
  CreateOptionGroup,
  CreateTextOption,
  IBattery,
  IBatteryStage,
  ICustomizedBattery,
  IOption,
  IOptionValue,
} from "@seitz/shared";

const optionSchema = new Schema<IOption>(
  {
    name: { type: String, required: true },
  },
  { discriminatorKey: "type" }
);

const optionGroupSchema = new Schema<CreateOptionGroup>({
  name: { type: String, required: true },
  options: [optionSchema],
});

const batteryStageSchema = new Schema<IBatteryStage>({
  type: { type: String, required: true },
  stageLabel: String,
  options: optionGroupSchema,
});

const optArray = optionGroupSchema.path<Schema.Types.DocumentArray>("options");

const numberOptionSchema = new Schema<CreateNumberOption>({
  default: { type: Number, required: true },
  min: Number,
  max: Number,
  step: Number,
});

const textOptionSchema = new Schema<CreateTextOption>({
  default: { type: String, required: true },
  maxLength: Number,
});

const dropdownOptionSchema = new Schema<CreateDropdownOption>({
  default: { type: Number, required: true },
  options: [String],
});

const checkboxOptionSchema = new Schema<CreateCheckboxOption>({
  default: { type: Boolean, required: true },
});

export const NumberOption = optArray.discriminator(
  "number",
  numberOptionSchema
);

export const TextOption = optArray.discriminator("text", textOptionSchema);
export const DropdownOption = optArray.discriminator(
  "dropdown",
  dropdownOptionSchema
);
export const CheckboxOption = optArray.discriminator(
  "checkbox",
  checkboxOptionSchema
);

export const OptionGroup = optArray.discriminator("group", optionGroupSchema);

export const batterySchema = new Schema<IBattery>({
  name: { type: String, required: true },
  description: String,
  imageUrl: { type: String, required: true },
  stages: [batteryStageSchema],
  deleted: { type: Boolean, default: false },
});

export const Battery = model<IBattery>("Battery", batterySchema);

// TODO: Tech Debt - is there a better typing for this?
const optionValueSchema = new Schema<IOptionValue>({
  option: Schema.Types.ObjectId,
  value: Schema.Types.Mixed,
});

export const customizedBatterySchema = new Schema<ICustomizedBattery>({
  battery: { type: Schema.Types.ObjectId, ref: "Battery", required: true },
  name: { type: String, required: true },
  values: [optionValueSchema],
  isVisibleToNonAdmins: { type: Boolean, default: true },
});

export const CustomizedBattery = model<ICustomizedBattery>(
  "CustomizedBattery",
  customizedBatterySchema
);
