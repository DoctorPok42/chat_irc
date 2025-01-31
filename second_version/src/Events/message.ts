import Message from '../models/message';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import Channel from '../models/channels';
import User from '../models/user';

const JWT_SECRET = 'secret';

const message = async (data: any, callback: any, socket : Socket ) => {
    const { token ,conversationId, content, files } = data;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const channel = await Channel.findOne({ _id: conversationId });
    const user = await User.findOne({ _id: decoded.id });
    try {
        if (!channel) {
            callback({ success: false, message: 'Channel does not exist' });
            return;
        }
        const newMessage = new Message({ channel: channel, sender: decoded.id, text: data.content, timestamp: new Date() });
        await newMessage.save();
        callback({ success: true, message: 'Message sent' });
        socket.emit('message', { text: content, sender: user?.username, timestamp: new Date(), conversationId: conversationId });
    } catch (error) {
        console.error(error);
    }
}

export default message;