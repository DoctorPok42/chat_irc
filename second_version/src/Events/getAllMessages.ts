import jwt, {JwtPayload} from 'jsonwebtoken';
import Message from '../models/message';

const JWT_SECRET='secret';

const getAllMessages = async (data: any, callback: any) => {
    const { token } = data;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const messages = await Message.find({ sender : decoded.id });
    callback({ messages: "All messages sent.",data: messages });
}
export default getAllMessages;
