import mongoose, {Schema, Document} from "mongoose";

export interface IChannel extends Document {
    name: string;
    users: string[];
}

const ChannelSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    users: { type: [String], required: true }
});

export default mongoose.model<IChannel>("Channel", ChannelSchema);
