import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user';

const JWT_SECRET = 'secret';

const nick = async (data: any, callback: any) => {
    try {
        const { token, args } = data;
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const user = await User.findOneAndUpdate({ _id: decoded.id} , {username : args }, {new: true});
        console.log(user);
        if (user) {
            console.log(`${decoded.username} changed nick to ${args}`);
            callback({ success: true, message: 'Nick changed' });
        } else {
            callback({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
    }
}

export default nick;