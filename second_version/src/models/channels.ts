import mongoose, { Schema, Document } from "mongoose";

export interface IChannel extends Document {
  name: string;
  users: string[];
}

const ChannelSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    users: { type: [String], required: true },
    createTime: { type: Date, default: Date.now },
    lastMessage: { type: String, default: "" },
    lastMessageDate: { type: Date, default: Date.now },
    lastMessageAuthorId: { type: String, default: "" },
    lastMessageId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IChannel>("Channel", ChannelSchema);
