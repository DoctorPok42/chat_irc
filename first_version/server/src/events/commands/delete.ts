import mongoose from "mongoose";
import ConversationsModel from "../../schemas/conversations";
import UserModel from "../../schemas/users";
import { DecodedToken } from "../../types";

const delete2 = async (
  { args }: { args: string },
  decoded: DecodedToken,
  socketId: string
) => {
  const user = await UserModel.findById(decoded.id);
  if (!user) return { status: "error", message: "User not found.", data: null };

  const channel = await ConversationsModel.findOneAndDelete({
    name: args,
  });
  if (!channel)
    return { status: "error", message: "Channel not found.", data: null };

  const channelCollection = await mongoose.connection.db.dropCollection(
    `channel-${channel._id}`
  );
  if (!channelCollection)
    return { status: "error", message: "An error occurred.", data: null };

  user.conversationsId = user.conversationsId.filter(
    (conversation) => conversation.conversationId != channel._id
  );

  await user.save();

  return {
    status: "success",
    message: "Channel successfully deleted!",
    data: channel,
  };
};

module.exports.params = {
  authRequired: true,
};

export default delete2;
