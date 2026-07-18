import { connectDB } from "./config/db";
import { UserModel } from "./modules/user/model/user.model";
import mongoose from "mongoose";

const checkUsers = async () => {
  await connectDB();
  const users = await UserModel.find({}).select("username email fcmToken").lean().exec();
  console.log("Registered Users in DB:");
  console.log(users);
  await mongoose.disconnect();
};

checkUsers();
