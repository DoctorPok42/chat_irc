import mongoose from "mongoose";
import { io } from "../../main";
import ConversationsModel from "../../schemas/conversations";
import UserModel from "../../schemas/users";
import { DecodedToken, Message } from "../../types";

const msg = async (
  { args }: { args: string },
  decoded: DecodedToken,
  socketId: string
) => {
  if (args.length < 2) {
    return {
      status: "error",
      message: "Please provide a nickname and a message.",
    };
  }

  const user = await UserModel.findById(decoded.id);
  if (!user) {
    return {
      status: "error",
      message: "User not found.",
      data: null,
    };
  }

  const userToSend = await UserModel.findOne({ username: args.split(",")[0] });
  if (!userToSend) {
    return {
      status: "error",
      message: "User not found.",
      data: null,
    };
  }

  // check if the user and the userToSend are not the same
  if (userToSend.id === decoded.id) {
    return {
      status: "error",
      message: "You can't send a message to yourself.",
      data: null,
    };
  }

  // check if a private conversation already exists
  var conversation = await ConversationsModel.findOne({
    membersId: { $all: [decoded.id, userToSend.id] },
    conversationType: "private",
  });
  if (!conversation) {
    const newConversation = new ConversationsModel({
      name: `${user.username}-${userToSend.username}`,
      conversationType: "private",
      membersId: [decoded.id, userToSend.id],
      lastMessage: "",
      lastMessageDate: new Date(),
      lastMessageAuthorId: "",
    });

    await newConversation.save();

    conversation = newConversation;
  }

  // save message to conversation
  const message = {
    _id: new mongoose.Types.ObjectId(),
    content: args.split(",")[1],
    authorId: decoded.id,
    date: new Date(),
  } as Message;

  const response = await mongoose.connection.db
    .collection(`channel-${conversation._id}`)
    .insertOne(message);
  if (!response) {
    return { status: "error", message: "An error occurred.", data: null };
  }

  // send message to the user
  io.to(userToSend.socketId).emit("message", {
    status: "success",
    conversationId: conversation?._id,
    _id: message._id,
    content: message.content,
    date: message.date,
    authorId: message.authorId,
  });

  // add conversation to user
  const conversationId = conversation._id;
  user.conversationsId.push({ conversationId, lastMessageSeen: "" });
  userToSend.conversationsId.push({ conversationId, lastMessageSeen: "" });

  await user.save();
  await userToSend.save();

  return {
    status: "success",
    message: "Message sent.",
    data: message,
  };
};

module.exports.params = {
  authRequired: true,
};

export default msg;
