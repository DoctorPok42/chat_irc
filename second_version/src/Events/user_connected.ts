import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import UserModel from "../models/user";

const user_connected = async (data: any, callback: any, socket: Socket) => {
  const { token } = data;
  if (!token)
    return { status: "error", message: "Token is required.", data: null };

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
  if (!decoded)
    return { status: "error", message: "Invalid token.", data: null };

  const userInfos = await UserModel.findOne({ _id: decoded.id });
  if (!userInfos)
    return { status: "error", message: "User not found.", data: null };

  userInfos.socketId = socket.id;
  userInfos.save();

  return { status: "success", message: "User is connected.", data: userInfos };
};

module.exports.params = {
  authRequired: true,
};

export default user_connected;
