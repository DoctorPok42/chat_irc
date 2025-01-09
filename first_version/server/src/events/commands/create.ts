import mongoose from "mongoose";
import ConversationsModel from "../../schemas/conversations";
import UserModel from "../../schemas/users";
import { Conversations, DecodedToken } from "../../types";

const create = async (
  { args }: { args: string },
  decoded: DecodedToken,
  socketId: string
) => {
  const user = await UserModel.findById(decoded.id);
  if (!user) return { status: "error", message: "User not found.", data: null };

  const newChannel = new ConversationsModel({
    _id: new mongoose.Types.ObjectId(),
    name: args,
    conversationType: "group",
    membersId: [decoded.id],
    lastMessage: "",
    lastMessageDate: new Date(),
    lastMessageAuthorId: "",
  }) as Conversations;

  let response = (await newChannel.save()) as any;
  if (!response)
    return {
      status: "error",
      message: "An error occurred.",
      data: null,
    };

  const channelCollection = await mongoose.connection.db.createCollection(
    `channel-${newChannel._id}`
  );
  if (!channelCollection)
    return { status: "error", message: "An error occurred.", data: null };

  const channelId = newChannel._id;
  user.conversationsId.push({ conversationId: channelId, lastMessageSeen: "" });

  await user.save();

  return {
    status: "success",
    message: "Channel successfully created!",
    data: newChannel,
  };
};

module.exports.params = {
  authRequired: true,
};

export default create;
