import Channel from '../models/channels';


const create = async ( data: any, callback: any) => {
    const { args } = data;
    const channel = args;
    try {
        const existingChannel = await Channel.findOne({ channel });
        if (existingChannel) {
            callback({ success: false, message: 'Channel already exists' });
            return;
        }
        const newChannel = new Channel({ name: channel, users: [], time: new Date(), type: 'group' });
        await newChannel.save();
        callback({ success: true, message: 'Channel created' });
    } catch (error) {
        console.error(error);
    }
}

export default create;