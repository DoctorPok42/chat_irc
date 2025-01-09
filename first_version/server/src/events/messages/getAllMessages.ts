import UserModel from "../../schemas/users";
import { DecodedToken } from "../../types";
import mongoose from "mongoose";

const getAllMessages = async (
  {},
  decoded: DecodedToken
): Promise<{ status: string; messages: string; data: any }> => {
  const author = await UserModel.findOne({ _id: decoded.id });
  if (!author)
    return { status: "error", messages: "Author not found.", data: null };

  const firstUserConversations = author.conversationsId.slice(0, 10);

  const allConversation = {} as any;

  await Promise.all(
    firstUserConversations.map(async (conversation: any) => {
      let findConv = (await mongoose.connection.db
        .collection(`channel-${conversation.conversationId}`)
        .find()
        .limit(20)
        .sort({ date: -1 })
        .toArray()) as any;
      if (!findConv) return;

      allConversation[conversation.conversationId] = findConv.reverse();
    })
  );

  return {
    status: "success",
    messages: "All messages sent.",
    data: allConversation,
  };
};

module.exports.params = {
  authRequired: true,
};

export default getAllMessages;
