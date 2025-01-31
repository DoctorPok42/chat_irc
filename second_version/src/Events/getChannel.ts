import jwt, { JwtPayload } from 'jsonwebtoken';
import Channel from '../models/channels';

const JWT_SECRET ='secret';

const getChannel = async ( data: any, callback: any) => {
    const { token } = data;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const channel: any = await Channel.find({ users: decoded.id });
    callback({ channel });
}
export default getChannel;