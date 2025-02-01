import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";

const nick = async (data: any, callback: any) => {
  try {
    const { token, args } = data;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (args.length < 3)
      return callback({
        success: false,
        message: "Nick must be at least 3 characters",
      });

    const user = await User.findOneAndUpdate(
      { _id: decoded.id },
      { username: args },
      { new: true }
    );
    if (user) {
      callback({ success: true, message: "Nick changed" });
    } else {
      callback({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
  }
};

export default nick;
