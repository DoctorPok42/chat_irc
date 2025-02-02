import User from "../models/user";

const list = async (data: any, callback: any) => {
  const { args } = data;
  try {
    const users = await User.find({
      username: { $regex: args, $options: "i" },
    });
    callback({
      status: "success",
      message: "All users.",
      data: users,
    });
  } catch (error) {
    console.error(error);
  }
};

export default list;
