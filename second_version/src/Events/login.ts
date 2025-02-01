import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const login = async (data : any, callback: any) => {
    const { username, password } = data;
    console.log(`login attempt for ${username}`);
    try{
        const user = await User.findOne({username});
        if (!user){
            callback({success: false, message: 'User not found'});
            return;
        }
        const isMatch = await await bcrypt.compare(password, user.password);
        if (!isMatch){
            callback({success: false, message: 'Invalid password'});
            return;
        }
        const token = jwt.sign({id: user._id, username: user.username}, process.env.JWT_SECRET as string, {expiresIn: '24h'});
        callback({success: true, message: 'User logged in', token});
    }catch (error){
        console.error(error);
        callback({success: false, message: 'Server error'});
    }
}

export default login;