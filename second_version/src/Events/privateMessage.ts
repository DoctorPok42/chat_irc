import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import Channel from "../models/channels";
import Message from "../models/message";
import { Socket } from "socket.io";

const privateMessage = async (data: any, callback: any, socket: Socket) => {
  const { token, args } = data;
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JwtPayload;
  const receiverArgs = args.split(",")[0];
  const message = args.split(",")[1];
  console.log("yfguhijokpl", receiverArgs, message);
  const receiver = await User.findOne({ username: receiverArgs });
  if (!receiver) {
    callback({ success: false, message: "User does not exist" });
    return;
  }
  let chan = await Channel.findOne({
    users: { $all: [decoded.id, receiver.id] },
    type: "private",
  });
  if (!chan) {
    const newChannel = new Channel({
      name: `${decoded.username}-${receiver.username}`,
      users: [decoded.id, receiver.id],
      type: "private",
    });
    await newChannel.save();
    chan = newChannel;
  }
  console.log("chann", chan);
  const newMessage = new Message({
    channel: chan,
    sender: decoded.id,
    text: message,
    timestamp: new Date(),
    img: decoded.username,
    conversationsId: chan.id,
  });
  console.log(newMessage);
  await newMessage.save();

  // add channel to user
  const user = await User.findOne({ _id: decoded.id });
  if (!user) {
    callback({ success: false, message: "User does not exist" });
    return;
  }

  user.channels.push(chan.id);
  receiver.channels.push(chan.id);
  await user.save();
  await receiver.save();

  callback({ success: true, message: "Message sent" });
  socket.emit("message", {
    text: message,
    sender: decoded.id,
    timestamp: new Date(),
    conversationId: chan.id,
  });
};

export default privateMessage;
