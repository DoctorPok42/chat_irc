import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  text: string;
  sender: string;
  timestamp: Date;
  channel: string;
  conversationsId: string;
  img?: string;
  type?: "user" | "server";
}

const MessageSchema: Schema = new Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, required: true },
  channel: { type: String, required: true },
  conversationsId: { type: String, required: true },
  img: { type: String },
  type: { type: String, enum: ["user", "server"], default: "user" },
});

export default mongoose.model<IMessage>("Message", MessageSchema);
