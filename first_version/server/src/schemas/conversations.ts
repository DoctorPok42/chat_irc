import { Schema, model } from "mongoose";
import { Conversations, ConversationsLinks } from "../types";

const conversationsSchema = new Schema<Conversations>(
  {
    conversationType: { type: String, required: true },
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    links: { type: Array<ConversationsLinks>(), default: [] },
    files: { type: Array<ConversationsLinks>(), default: [] },
    membersId: { type: [], required: true },
    lastMessage: { type: String, default: "" },
    lastMessageDate: { type: Date, default: Date.now },
    lastMessageAuthorId: { type: String, default: "" },
    lastMessageId: { type: String, default: "" },
  },
  { timestamps: true }
);

const ConversationsModel = model<Conversations>(
  "conversations",
  conversationsSchema
);

export default ConversationsModel;
