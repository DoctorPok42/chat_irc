import Channel from '../models/channels';
import User from '../models/user';

const deleteChannel = async (data: any, callback: any) => {
    const { args } = data;
    const channel = args;
    try {
        const existingChannel = await Channel.findOne({ name: channel });
        if (!existingChannel) {
            callback({ success: false, message: 'Channel does not exist' });
            return;
        }
        for (const user of existingChannel.users) {
            await User.findOneAndUpdate({ _id: user }, { $pull: { channels: channel } });
        }
        await Channel.deleteOne({ name: channel });
        callback({ success: true, message: 'Channel deleted' });
    } catch (error) {
        console.error(error);
    }
}

export default deleteChannel;