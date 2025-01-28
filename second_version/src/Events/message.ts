import Message from '../models/message';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = 'secret';

const message = async (data: any, callback: any) => {
    // const { channel, token , message } = data;
    const decoded = jwt.verify(data.token, JWT_SECRET) as JwtPayload;
    console.log(decoded);
    try {
        // const newMessage = new Message({ channel: channel, sender: username, text: message, timestamp: new Date() });
        // await newMessage.save();
        // callback({ success: true, message: 'Message sent' });
        // // socket.broadcast.to(channel).emit('message', { text: message, sender: username, timestamp: new Date(), channel });
    } catch (error) {
        console.error(error);
    }
}

export default message;