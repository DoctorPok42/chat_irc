import User from "../models/user";
import jwt, { JwtPayload } from "jsonwebtoken";
import Channel from "../models/channels";
import Message from "../models/message";

const join = async (data: any, callback: any) => {
  try {
    const { token, args } = data;
    const channel = args;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    const user = await User.findOne({ _id: decoded.id });
    if (user?.channels.includes(channel)) {
      console.log(`${decoded.username} already in channel`);
      return;
    }
    const Chan = (await Channel.findOneAndUpdate(
      { name: channel },
      { $push: { users: decoded.id } }
    )) as any;
    if (!Chan)
      return callback({ success: false, message: "Channel does not exist" });

    console.log(`${decoded.username} joined channel ${channel}`);
    if (user != null) {
      user.channels.push(Chan._id);
      await user.save();
    }
    callback({ success: true, messages: await Message.find({ channel }) });
  } catch (error) {
    console.error(error);
  }
};

export default join;
