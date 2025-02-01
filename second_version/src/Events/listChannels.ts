import channels from "../models/channels";

const listChannels = async (data: any, callback: any) => {
  const { args } = data;
  try {
    const allChannels = await channels.find({
      name: { $regex: args, $options: "i" },
    });

    callback({
      status: "success",
      message: "All channels.",
      data: allChannels,
    });
  } catch (error) {
    console.error(error);
  }
};

export default listChannels;
