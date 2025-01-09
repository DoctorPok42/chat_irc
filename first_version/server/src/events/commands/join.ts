import ConversationsModel from "../../schemas/conversations";
import UserModel from "../../schemas/users";
import { DecodedToken } from "../../types";

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
