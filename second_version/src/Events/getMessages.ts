import Message from "../models/message";

const getMessages = async (data: any, callback: any) => {
  const { conversationId } = data.args;
  const messages = await Message.find({ channel: conversationId });
  callback({ messages });
};

export default getMessages;
