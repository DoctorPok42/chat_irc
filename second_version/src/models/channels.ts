import mongoose, {Schema, Document} from "mongoose";
import message from "./message";

export interface IChannel extends Document {
    name: string;
    users: string[];
}
