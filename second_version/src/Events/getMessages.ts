import jwt, {JwtPayload} from 'jsonwebtoken';
import Message from '../models/message';

const JWT_SECRET= 'secret';

const getMessages = async (data: any, callback: any) => {
    const { token, conversationId } = data;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const messages = await Message.find({ channel:conversationId });
    callback({ messages });
}

export default getMessages;