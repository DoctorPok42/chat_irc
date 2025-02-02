import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import Channel from "../models/channels";
import Message from "../models/message";
import { Socket } from "socket.io";

const leave = async (data: any, callback: any, socket: Socket) => {
  const { token, args } = data;
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JwtPayload;
  const channel = args;
  const user = await User.findOne({ _id: decoded.id });

  if (!user) {
    callback({ success: false, message: "User not found" });
    return;
  }

  try {
    const existingChannel = await Channel.findOne({ name: channel });
    if (!existingChannel) {
      callback({ success: false, message: "Channel does not exist" });
      return;
    }
    if (!user?.channels.includes(existingChannel._id as string)) {
      callback({ success: false, message: "User not in channel" });
      return;
    }

    await Channel.findOneAndUpdate(
      { name: channel },
      { $pull: { users: user.id } }
    );
    await User.findOneAndUpdate(
      { _id: decoded.id },
      { $pull: { channels: channel } }
    );

    const notifMessage = new Message({
      text: `${decoded.username} left the channel`,
      sender: "server",
      timestamp: new Date(),
      channel: channel,
      conversationsId: existingChannel._id,
      img: "",
      type: "server",
    });

    await notifMessage.save();

    await Promise.all(
      existingChannel.users.map(async (userId: any) => {
        const user = (await User.findOne({ _id: userId })) as any;
        if (!user) return;
        if (user._id.toString() === decoded.id) return;

        socket.to(user.socketId).emit("message", {
          _id: notifMessage._id,
          text: notifMessage.text,
          sender: notifMessage.sender,
          timestamp: notifMessage.timestamp,
          conversationsId: notifMessage.conversationsId,
          img: notifMessage.img,
          type: notifMessage.type,
        });
      })
    );

    callback({ success: true, message: "User left channel" });
  } catch (error) {
    console.error(error);
  }
};

export default leave;
