import UserModel from "../../schemas/users";
import { DecodedToken } from "../../types";

const nick = async (
  { args }: { args: string },
  decoded: DecodedToken,
  socketId: string
) => {
  const userInfos = await UserModel.findOne({ _id: decoded.id });
  if (!userInfos)
    return { status: "error", message: "User not found.", data: null };

  userInfos.username = args;

  await userInfos.save();

  return {
    status: "success",
    message: "User nickname updated.",
    data: userInfos,
  };
};

module.exports.params = {
  authRequired: true,
};

export default nick;
