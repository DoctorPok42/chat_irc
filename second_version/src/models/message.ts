import mongoose, {Schema, Document} from 'mongoose';

export interface IMessage extends Document {
    text: string;
    sender: string;
    timestamp: Date;
    channel: string;
}

const MessageSchema: Schema = new Schema({
    text: { type: String, required: true },
    sender: { type: String, required: true },
    timestamp: { type: Date, required: true },
    channel: { type: String, required: true }
});

export default mongoose.model<IMessage>('Message', MessageSchema);