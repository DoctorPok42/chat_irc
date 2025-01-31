import user from "../models/user";
import bcrypt from "bcryptjs";


const register = async (data: any, callback: any) => {
    const { username, password } = data;
    try {
        const existingUser = await user.findOne({ username });
        if (existingUser) {
            callback({ success: false, error: 'User already exists' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new user({ username, password: hashedPassword, channels: [] });
        await newUser.save();
        callback({ success: true });
    } catch (error) {
        callback({ success: false, message: 'server error' });
    }
};

export default register;
