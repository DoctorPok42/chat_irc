import ConversationsModel from "../../schemas/conversations";
import { DecodedToken } from "../../types";

const list = async (
  { args }: { args: string },
  decoded: DecodedToken,
  socketId: string
) => {
  const allChannels = await ConversationsModel.find({
    name: { $regex: args, $options: "i" },
  });

  return {
    status: "success",
    message: "All channels.",
    data: allChannels,
  };
};

module.exports.params = {
  authRequired: true,
};

export default list;
