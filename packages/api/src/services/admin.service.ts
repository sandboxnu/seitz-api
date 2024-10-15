import { UpdateWriteOpResult } from "mongoose";
import { User, Battery } from "../models";
import HttpError from "../types/errors";
import { APIResponse } from "../util/handlers";
import * as crypto from "crypto";
import type {
  CreateBattery,
  CreateBatteryStage,
  CreateOption,
  IBattery,
} from "@seitz/shared";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const promoteToAdmin = async (filter: any): APIResponse<void> => {
  const update = { isAdmin: true };
  const user = await User.findOneAndUpdate({ email: filter }, update);
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