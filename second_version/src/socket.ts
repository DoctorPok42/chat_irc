import { Server, Socket } from 'socket.io';

const startSocket = (io: Server, events : any) => {
    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
    
        Object.keys(events).forEach((event) => {
            socket.on(event, (data: any, callback: any) => {
                console.log(`received ${event}`);
                if (event == 'sendMessage' || event == 'msg') {
                    events[event](data, callback, socket);
                } else {
                    events[event](data, callback);
                }
            });
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
};

export default startSocket;
