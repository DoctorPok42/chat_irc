import User from "../models/user";
import jwt, { JwtPayload } from "jsonwebtoken";
import Channel from "../models/channels";
import Message from "../models/message";
import { Socket } from "socket.io";

const join = async (data: any, callback: any, socket: Socket) => {
  try {
    const { token, args } = data;
    const channel = args;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await User.findOne({ _id: decoded.id });
    if (user?.channels.includes(channel)) {
      return;
    }

    const Chan = (await Channel.findOneAndUpdate(
      { name: channel },
      { $push: { users: decoded.id } }
    )) as any;
    if (!Chan)
      return callback({ success: false, message: "Channel does not exist" });

    if (user != null) {
      user.channels.push(Chan._id);
      await user.save();
    }

    const notifMessage = new Message({
      text: `${decoded.username} joined the channel`,
      sender: "server",
      timestamp: new Date(),
      channel: channel,
      conversationsId: Chan._id,
      img: "",
      type: "server",
    });

    await notifMessage.save();

    await Promise.all(
      Chan.users.map(async (userId: any) => {
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

    callback({ success: true, messages: await Message.find({ channel }) });
  } catch (error) {
    console.error(error);
  }
};

export default join;
