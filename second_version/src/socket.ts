import { Server, Socket } from 'socket.io';
import { Events } from './types';

const startSocket = (io: Server, events : Events) => {
    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
    
        Object.keys(events).forEach((event) => {
            socket.on(event, (data: any, callback: any) => {
                events[event](data, callback);
            });
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
};

export default startSocket;
