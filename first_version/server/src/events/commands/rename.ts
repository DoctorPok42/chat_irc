import ConversationsModel from "../../schemas/conversations";
import { DecodedToken } from "../../types";

const rename = async (
  { conversationId, newName }: { conversationId: string; newName: string },
  decoded: DecodedToken,
  socketId: string
) => {
  const channel = await ConversationsModel.findOne({
    _id: conversationId,
  });
  if (!channel) {
    return {
      status: "error",
      message: "Channel not found.",
    };
  }

  // check if the user is a member of the channel
  const isMember = channel.membersId.find(
    (member) => member.toString() === decoded.id
  );

  if (!isMember) {
    return {
      status: "error",
      message: "You are not a member of this channel.",
    };
  }

  channel.name = newName;

  await channel.save();

  return {
    status: "success",
    message: "Channel renamed.",
    data: {
      conversationId,
      newName,
    },
  };
};

module.exports.params = {
  authRequired: true,
};

export default rename;
