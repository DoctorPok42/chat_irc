import http from 'http';
import { Server, Socket } from 'socket.io';
import bcrypt from 'bcryptjs';
import connectDB from './db';
import User from './models/user';
import Message from './models/message';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'secret';

connectDB();

const server = http.createServer();

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

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

    socket.on('joinChannel', async (data) => {
        try {
            const { channel, username } = data;
            const user = await User.findOne({username});
            if (user?.channels.includes(channel)) {
                console.log('User already in channel');
                return;
            }
            socket.join(channel);
            console.log(`User joined channel ${channel}`);
            if (user != null) {
                user.channels.push(channel);
                await user.save();
            }
            socket.to(channel).emit('message', { text: `${username} join ${channel}`, sender: 'server', timestamp: new Date(), channel: channel });
        } catch (error) {
            console.error(error);
        }
        });
    socket.on('leaveChannel', (data) => {
        const { channel, username } = data;
        socket.leave(channel);
        console.log(`User left channel ${channel}`);
        socket.to(channel).emit('message', { text: `${username} left ${channel}`, sender: 'server', timestamp: new Date(), channel });
    });


    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(8000, () => {
    console.log(`Server running on port ${8000}`);
});

