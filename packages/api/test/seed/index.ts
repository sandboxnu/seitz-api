import mongoose from "mongoose";
import { Battery, CustomizedBattery, User } from "../../src/models";
import type { CreateBattery, CreateUser } from "@seitz/shared";

export const seedUsers = [
  {
    _id: new mongoose.Types.ObjectId(),
    email: "admin@test.com",
    password: "password123",
    isAdmin: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    email: "user@test.com",
    password: "password123",
    isAdmin: false,
  },
] as CreateUser[];

export const seedBatteries = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: "Test Battery",
    description: "A test battery",
    imageUrl: "https://test.com/image.jpg",
    stages: [],
    deleted: false,
  },
] as CreateBattery[];

export const seedCustomizedBatteries = [
  {
    _id: new mongoose.Types.ObjectId(),
    battery: seedBatteries[0]._id,
    isVisibleToNonAdmins: false,
  },
];

export const seedDatabase = async () => {
  await User.create(seedUsers);
  await Battery.create(seedBatteries);
  await CustomizedBattery.create(seedCustomizedBatteries);
};
