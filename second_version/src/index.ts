import http from 'http';
import { Server, Socket } from 'socket.io';
import bcrypt from 'bcryptjs';
import connectDB from './db';
import User from './models/user';
import Message from './models/message';
import jwt from 'jsonwebtoken';
import Channel from './models/channels';
import re from './Events/register';
import lo from './Events/login';
import startSocket from './socket';
import me from './Events/message';
import je from './Events/join';
import ni from './Events/nick';
import li from './Events/listUsers';
import de from './Events/delete';
import cr from './Events/create';
import le from './Events/leave';

const JWT_SECRET = 'secret';

connectDB();

const server = http.createServer();

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const events = {
    register : re,
    login : lo,
    message: me,
    join : je,
    nick : ni,
    list : li,
    delete : de,
    create : cr,
    leave : le,
};

startSocket(io, events);
/*
io.on('connection', (socket: Socket) => {
    console.log('a user connected');

    socket.on('register', async (data: any, callback: any) => {
        const { username, password } = data;
        try {
            const existingUser = await User.findOne({ username});
            if(existingUser) {
                callback({ success: false, error: 'User already exists' });
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ username, password: hashedPassword, channels: ['home'] });
            await newUser.save();
            callback({ success: true });
        } catch (error) {
            callback({ success: false, message: 'server error' });
        }
    });

    socket.on('login',async (data: any, callback: any)=>{
        const { username, password } = data;
        console.log(`login attempt for ${username}`);

        try{
            const user = await User.findOne({ username });
            if (!user) {
                callback({success: false, message: "User not found"});
                return;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                callback({success: false, message: "Invalid password"});
                return;
            }

            const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
                expiresIn: "24h",
            });
            callback({success: true, message: "User logged in", token});
        }catch (error) {
            console.error(error);
            callback({success: false, message: "Server error"});
        }
    });

    socket.on('message', async (data) => {
        try {
            const mess = new Message({
                text: data.text,
                sender: data.sender,
                timestamp: new Date(),
                channel: data.channel
            });
            await mess.save();
            console.log("Message saved to db", mess);
            socket.broadcast.to(mess.channel).emit(`message`,data);
        }catch (error) {
            console.error(error);
        }

    });

    socket.on('joinChannel', async (data, callback) => {
        try {
            const { channel, username } = data;
            const user = await User.findOne({username});
            if (user?.channels.includes(channel)) {
                console.log(`${username} already in channel`);
                return;
            }
            socket.join(channel);
            await Channel.findOneAndUpdate({name: channel}, {$push: {users: username}});
            console.log(`${username} joined channel ${channel}`);
            if (user != null) {
                user.channels.push(channel);
                await user.save();
            }
            callback({ success: true, messages: await Message.find({ channel })});
            socket.to(channel).emit('message', { text: `${username} join ${channel}`, sender: 'server', timestamp: new Date(), channel: channel });
        } catch (error) {
            console.error(error);
        }
        });

    socket.on('leaveChannel', async (data, callback) => {
        try{
            const { channel, username } = data;
            const user = await User.findOne({username});
            if(!user?.channels.includes(channel)){
                callback({success: false, message: 'User not in channel'});
                return;
            }
            socket.leave(channel);
            await Channel.findOneAndUpdate({name: channel}, {$pull: {users: username}});
            await User.findOneAndUpdate({username}, {$pull: {channels: channel}});
            callback({success: true, message: 'Channel left'});
            console.log(`${username} left channel ${channel}`);
            socket.to(channel).emit('message', { text: `${username} left ${channel}`, sender: 'server', timestamp: new Date(), channel });
        } catch (error) {
            console.error(error);
        }
    });

    socket.on("listUsers", async (data, callback) => {
        const { channel } = data;
        try {
            const users = await User.find({channels: channel});
            callback(users.map((user) => user.username));
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('changeNickname', async (data, callback) => {
        const { username, newUsername } = data;
        try {
            const user = await User.findOneAndUpdate({ username }, { username: newUsername }, { new: true });
            if (user) {
                callback({ success: true, message: 'Nickname changed' });
            } else {
                callback({ success: false, message: 'User not found' });
            }
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('listChannels', async (data, callback) => {
        const {username} = data;
        try {
            const user = await User.findOne({username});
            if (user){
                callback({success: true, channels : user.channels});
            }
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('createChannel', async (data, callback) => {
        const { channel } = data;
        try {
            const existingChannel = await Message.findOne({ channel });
            if (existingChannel) {
                callback({ success: false, message: 'Channel already exists' });
                return;
            }
            const newChannel = new Channel({ name: channel, users: [] });
            await newChannel.save();
            callback({ success: true, message: 'Channel created' });
        } catch (error) {
            console.error(error);
        };
    });

    socket.on('deleteChannel', async (data, callback) => {
        const { channel } = data;
        try {
            const existingChannel = await Channel.findOne({ name: channel });
            if(!existingChannel) {
                callback({ success: false, message: 'Channel does not exist' });
                return;
            }
            for (const user of existingChannel.users) {
                await User.findOneAndUpdate({ username: user }, { $pull: { channels: channel } });
            }
            await Channel.deleteOne({ name: channel });
            callback({ success: true, message: 'Channel deleted' });
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('privateMessage', async (data, callback) => {
        const { sender, receiver, text } = data;
        try {
            const receiverUser = await User.findOne({ username: receiver });
            if (!receiverUser) {
                callback({ success: false, message: 'Receiver not found' });
                return;
            }
            const existingChannel = await Channel.findOne({
                $or: [
                    { name: `${sender}-${receiver}` },
                    { name: `${receiver}-${sender}` },
                ],
            });
            let channelName: string;
            if (!existingChannel) {
                channelName = `${sender}-${receiver}`;
                const newChannel = new Channel({ name: channelName, users: [sender, receiver] });
                await newChannel.save();
            } else {
                channelName = existingChannel.name;
            }
            const message = new Message({ text: text, sender: sender, timestamp: new Date(), channel: channelName });
            await message.save();
            socket.broadcast.to(channelName).emit('message', { text, sender, timestamp: new Date(), channel: channelName });
            callback({ success: true, message: 'Message sent' });
        } catch (error) {
            console.error(error);
            callback({ success: false, message: 'Server error' });
        }
    });


    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
*/
server.listen(8000, () => {
    console.log(`Server running on port ${8000}`);
});

