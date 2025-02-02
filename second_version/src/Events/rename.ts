import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import channels from "../models/channels";

const rename = async (data: any, callback: any, socket: Socket) => {
  const { token, conversationId, newName } = data;
  if (!token || !conversationId || !newName) {
    return callback({
      status: "error",
      message: "Missing required fields.",
    });
  }

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
  if (!decoded)
    return callback({
      status: "error",
      message: "Invalid token.",
    });

  const channel = await channels.findOne({
    _id: conversationId,
  });
  if (!channel) {
    return callback({
      status: "error",
      message: "Channel not found.",
    });
  }

  // check if the user is a member of the channel
  const isMember = channel.users.find(
    (member: any) => member.toString() === decoded.id
  );

  if (!isMember) {
    return callback({
      status: "error",
      message: "You are not a member of this channel.",
    });
  }

  channel.name = newName;

  await channel.save();

  callback({
    status: "success",
    message: "Channel renamed.",
    data: {
      conversationId,
      newName,
    },
  });
};

module.exports.params = {
  authRequired: true,
};

export default rename;
