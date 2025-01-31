import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user';
import Channel from '../models/channels';
import Message from '../models/message';
import { Socket } from 'socket.io';

const JWT_SECRET = 'secret';

const privateMessage = async (data : any , callback: any, socket: Socket) => {
    const { token , args } = data;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const receiver = args.split(',')[0];
    const message = args.split(',')[1];
    const Receiver = await User.findOne({ username: receiver });
    if (!Receiver) {
        callback({ success: false, message: 'User does not exist' });
        return;
    }
    var chan = await Channel.findOne({ users: { $all: [decoded.id, Receiver.id] }, type : 'private' });
    if (!chan) {
        const newChannel = new Channel({ name: `${decoded.username}-${Receiver.username}`, users: [decoded.id, Receiver.id], type: 'private' });
        await newChannel.save();
        chan = newChannel;
    }
    const newMessage = new Message({ channel: chan, sender: decoded.id, text: message, timestamp: new Date() });
    await newMessage.save();
    callback({ success: true, message: 'Message sent' });
    socket.emit('message', { text: message, sender: decoded.id, timestamp: new Date(), conversationId: chan.id });
}

export default privateMessage;
