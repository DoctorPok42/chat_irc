import Message from "../models/message";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import Channel from "../models/channels";
import User from "../models/user";

const message = async (data: any, callback: any, socket: Socket) => {
  const { token, conversationId, content, files } = data;
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JwtPayload;
  const channel = await Channel.findOne({ _id: conversationId });
  const user = await User.findOne({ _id: decoded.id });
  if (!user) {
    callback({ success: false, message: "User does not exist" });
    return;
  }
  try {
    if (!channel) {
      callback({ success: false, message: "Channel does not exist" });
      return;
    }
    const newMessage = new Message({
      channel: channel,
      conversationsId: conversationId,
      sender: decoded.id,
      text: data.content,
      timestamp: new Date(),
      img: user.username,
    });
    await newMessage.save();
    callback({ success: true, message: "Message sent" });

    // Emit the message to all users in the channel
    await Promise.all(
      channel.users.map(async (userId) => {
        const user = (await User.findOne({ _id: userId })) as any;
        if (!user) return;
        if (user._id.toString() === decoded.id) return;

        socket.to(user.socketId).emit("message", {
          _id: newMessage._id,
          text: newMessage.text,
          sender: newMessage.sender,
          timestamp: newMessage.timestamp,
          conversationsId: newMessage.conversationsId,
          img: newMessage.img,
        });
      })
    );

    socket.emit("message", {
      _id: newMessage._id,
      text: newMessage.text,
      sender: newMessage.sender,
      timestamp: newMessage.timestamp,
      conversationsId: newMessage.conversationsId,
      img: newMessage.img,
    });
  } catch (error) {
    console.error(error);
  }
};

export default message;
