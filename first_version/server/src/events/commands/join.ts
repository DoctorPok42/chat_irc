import mongoose from "mongoose";
import ConversationsModel from "../../schemas/conversations";
import UserModel from "../../schemas/users";
import { DecodedToken, Message, User } from "../../types";
import { io } from "../../main";

const join = async (
  { args }: { args: string },
  decoded: DecodedToken,
  socketId: string
) => {
  const user = await UserModel.findById(decoded.id);
  if (!user) return { status: "error", message: "User not found.", data: null };

  const channel = await ConversationsModel.findOne({
    name: args,
  });
  if (!channel)
    return { status: "error", message: "Channel not found.", data: null };

  if (channel.membersId.includes(decoded.id))
    return {
      status: "error",
      message: "You are already in this channel.",
      data: null,
    };

  channel.membersId.push(decoded.id);

  const channelId = channel._id;
  user.conversationsId.push({ conversationId: channelId, lastMessageSeen: "" });

  const welcomeMessage = ({
    content: `${user.username} joined the channel!`,
    authorId: "server",
    date: new Date(),
    type: "server",
  } as unknown) as Message;

  const request = await mongoose.connection.db
    .collection(`channel-${channelId.toString()}`)
    .insertOne(welcomeMessage);
  if (!request)
    return { status: "error", message: "Error joining the channel." };

  // send the welcome message to all members
  await channel.membersId.map(async (memberId: string) => {
    const user = (await UserModel.findOne({ _id: memberId })) as User;
    if (!user.options.online) return;
    if (user._id === decoded.id) return;

    io.to(user.socketId).emit("message", {
      status: "success",
      conversationsId: channelId,
      _id: welcomeMessage._id,
      content: welcomeMessage.content,
      date: welcomeMessage.date,
      authorId: welcomeMessage.authorId,
      phone: user.phone,
      img: user.username,
      options: welcomeMessage.options,
      type: "server",
    } as Message & User & { status: string });
  });

  await channel.save();
  await user.save();

  return {
    status: "success",
    message: "Channel successfully joined!",
    data: channel,
  };
};

module.exports.params = {
  authRequired: true,
};

export default join;
