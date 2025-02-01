import jwt, { JwtPayload } from "jsonwebtoken";
import Message from "../models/message";

const getMessages = async (data: any, callback: any) => {
  const { token, conversationId } = data;
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JwtPayload;
  const messages = await Message.find({ channel: conversationId });
  callback({ messages });
};

export default getMessages;
