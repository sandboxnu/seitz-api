import mongoose, { UpdateWriteOpResult } from "mongoose";
import { User, Battery, CustomizedBattery } from "../models";
import HttpError from "../types/errors";
import { APIResponse } from "../util/handlers";
import * as crypto from "crypto";
import {
  Role,
  type CreateBattery,
  type CreateBatteryStage,
  type CreateOption,
  type IBattery,
  type ICustomizedBattery,
  type IUser,
} from "@seitz/shared";
import { parseVisibility } from "../util/validation.utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const updateRole = async (
  userId: string,
  role: Role
): APIResponse<void> => {
  if (!Object.values(Role).includes(role)) {
    throw new HttpError(400, "Invalid role");
  }

  let user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404);
  }

  // TODO this needa be figured out lol
  // if (user.role === Role.SuperAdmin && role !== Role.SuperAdmin) {
  //   throw new HttpError(403); // Super Admins can't be assigned a lesser role
  // }

  user = await User.findOneAndUpdate({ _id: userId }, { role: role });
  if (!user) {
    throw new HttpError(404);
  }

  return [200];
};

export const createBattery = async (json: any): APIResponse<IBattery> => {
  json = json as Record<string, any> & {
    Stages: Record<string, any>[];
  };
  const name = json["Name"];
  const desc = json["Description"];
  const imageUrl = `https://picsum.photos/300/300?${crypto.randomUUID()}`;
  const stages: CreateBatteryStage[] = json["Stages"].map((s: any) => {
    const options: CreateOption[] = parseOptions(s);

    return {
      stageLabel: s["StageLabel"],
      type: s["Type"],
      options: {
        type: "group",
        name: s["StageLabel"] ?? s["Type"],
        options,
      },
    };
  });

  const bat: CreateBattery = {
    name: name,
    description: desc,
    imageUrl: imageUrl,
    stages: stages,
    deleted: false,
  };

  const data = await Battery.create(bat);
  return [201, data];
};

export const editBattery = async (
  updates: any,
  id: any
): APIResponse<UpdateWriteOpResult> => {
  updates = updates as Record<string, any>;
  const battery = await Battery.findById(id);
  if (!battery) {
    return [404];
  }
  const newBattery = await Battery.updateOne({ _id: id }, updates, {
    new: true,
  });
  return [200, newBattery];
};

export const deleteBattery = async (batteryId: string): APIResponse<void> => {
  await Battery.updateOne({ _id: batteryId }, { deleted: true });
  return [200];
};

export const getAdminUsers = async (): APIResponse<IUser[]> => {
  const adminUsers = await User.find({ role: { $ne: Role.BasicUser } });
  return [200, adminUsers];
};

export const removeUserAsAdmin = async (userId: string): APIResponse<void> => {
  const user = await User.updateOne({ _id: userId }, { role: Role.BasicUser });
  if (!user) {
    throw new HttpError(404);
  }
  return [200];
};

export const updateStageVisibility = async (
  batteryId: string,
  stageId: string,
  visibility: string
): APIResponse<IBattery> => {
  const isVisibleToNonAdmins = parseVisibility(visibility);

  const updatedBattery = await Battery.findOneAndUpdate(
    { _id: batteryId, "stages._id": stageId },
    { $set: { "stages.$.isVisibleToNonAdmins": isVisibleToNonAdmins } },
    { new: true }
  );

  if (!updatedBattery) {
    throw new HttpError(
      404,
      `Battery ${batteryId} or Stage ${stageId} not found.`
    );
  }

  return [200, updatedBattery];
};

function parseOptions(s: any): CreateOption[] {
  return Object.entries(s).reduce((acc: CreateOption[], item: any) => {
    const optionName = item[0];
    const optionValue = item[1];
    // FIXME: Might need stage precursor later
    if (["Type", "StageLabel", "Stage Precursor"].includes(optionName))
      return acc;

    let option: CreateOption;

    if (typeof optionValue === "object") {
      const groupOptions = parseOptions(optionValue);

      option = {
        type: "group",
        name: optionName,
        options: groupOptions,
      };
    } else {
      option = {
        _id: new mongoose.Types.ObjectId(),
        name: optionName,
        default: optionValue,
        type:
          typeof optionValue === "number"
            ? "number"
            : typeof optionValue === "boolean"
            ? "checkbox"
            : "text",
      };
    }

    acc.push(option);
    return acc;
  }, []);
}

export const updateAdminVisibility = async (
  batteryId: string,
  visibility: string
): APIResponse<ICustomizedBattery> => {
  const isVisibleToNonAdmins = parseVisibility(visibility);

  const battery = await CustomizedBattery.findOneAndUpdate(
    { _id: batteryId },
    { isVisibleToNonAdmins: isVisibleToNonAdmins },
    { new: true }
  );

  if (!battery) {
    throw new HttpError(404, `Battery not found with ID: ${batteryId}`);
  }

  return [200, battery];
};
