import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user';
import Channel from '../models/channels';

const JWT_SECRET = 'secret';

const leave = async ( data: any, callback: any) => {
    const { token, args } = data;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const channel = args;
    const user = await User.findOne({ _id: decoded.id });
    try {
        const existingChannel = await Channel.findOne({ name: channel });
        if (!existingChannel) {
            callback({ success: false, message: 'Channel does not exist' });
            return;
        }
        if (!user?.channels.includes(channel)) {
            callback({ success: false, message: 'User not in channel' });
            return;
        }
        await Channel.findOneAndUpdate({ name: channel }, { $pull: { users: user.id } });
        await User.findOneAndUpdate({ _id: decoded.id }, { $pull: { channels: channel } });
        console.log(`${user.username} left channel ${channel}`);
        callback({ success: true, message: 'User left channel' });
    } catch (error) {
        console.error(error);
    }
}

export default leave;