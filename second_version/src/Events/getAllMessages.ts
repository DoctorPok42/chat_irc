import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import Message from "../models/message";

const getAllMessages = async (data: any, callback: any) => {
  const { token } = data;
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JwtPayload;

  const user = await User.findOne({ _id: decoded.id });
  if (!user) return callback({ messages: "User does not exist." });

  const allConversation = {} as any;

  await Promise.all(
    user.channels.map(async (channelId) => {
      const messages = await Message.find({
        conversationsId: channelId,
      });
      allConversation[channelId] = messages;
    })
  );

  callback({ messages: "All messages sent.", data: allConversation });
};
export default getAllMessages;
