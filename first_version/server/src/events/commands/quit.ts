import ConversationsModel from "../../schemas/conversations";
import UserModel from "../../schemas/users";
import { DecodedToken } from "../../types";

const quit = async (
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

  if (!channel.membersId.includes(decoded.id))
    return {
      status: "error",
      message: "You are not in this channel.",
      data: null,
    };

  channel.membersId = channel.membersId.filter(
    (member) => member != decoded.id
  );

  const channelId = channel._id;
  user.conversationsId = user.conversationsId.filter(
    (conversation) => conversation.conversationId != channelId
  );

  await channel.save();
  await user.save();

  return {
    status: "success",
    message: "Channel successfully quitted!",
    data: channel,
  };
};

module.exports.params = {
  authRequired: true,
};

export default quit;
