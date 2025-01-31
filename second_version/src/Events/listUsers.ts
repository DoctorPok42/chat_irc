import User from '../models/user';

const list = async ( Data: any, callback: any) => {
    const { channel } = Data;
    try {
        const users = await User.find({channels: channel});
        callback(users.map((user) => user.username));
    } catch (error) {
        console.error(error);
    }
}

export default list;