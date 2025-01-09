import UserModel from "../../schemas/users";
import { DecodedToken } from "../../types";
import ConversationsModel from "../../schemas/conversations";

const users = async (
  {
    args,
    id,
  }: {
    args: string[];
    id: string;
  },
  decoded: DecodedToken,
  socketId: string
) => {
  const channel = await ConversationsModel.findById(id);
  if (!channel) {
    return {
      status: "error",
      message: "Channel not found.",
    };
  }

  const users = await UserModel.find({
    _id: { $in: channel.membersId },
  });

  return {
    status: "success",
    message: "All users.",
    data: users,
  };
};

module.exports.params = {
  authRequired: true,
};

export default users;
