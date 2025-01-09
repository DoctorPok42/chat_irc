import { Schema, model } from "mongoose";
import { User } from "../types";

const userSchema = new Schema<User>(
  {
    phone: { type: String, required: true, unique: true },
    username: { type: String, minlength: 3 },
    conversationsId: {
      type: [
        {
          conversationId: { type: String },
          lastMessageSeen: { type: String },
        },
      ],
      default: [],
    },
    options: {
      darkMode: { type: Boolean, default: false },
      online: { type: Boolean, default: true },
      lastSeen: { type: Date, default: Date.now },
    },
    socketId: { type: String },
    verifCode: { type: String },
  },
  { timestamps: true }
);

const UserModel = model<User>("user", userSchema);

export default UserModel;
