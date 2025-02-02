import http from "http";
import { Server, Socket } from "socket.io";
import connectDB from "./db";
import re from "./Events/register";
import lo from "./Events/login";
import startSocket from "./socket";
import me from "./Events/message";
import je from "./Events/join";
import ni from "./Events/nick";
import li from "./Events/listUsers";
import de from "./Events/delete";
import cr from "./Events/create";
import le from "./Events/leave";
import veto from "./Events/verifyToken";
import gech from "./Events/getChannel";
import getAllMess from "./Events/getAllMessages";
import getMess from "./Events/getMessages";
import priMess from "./Events/privateMessage";
import user_connected from "./Events/user_connected";
import listChannels from "./Events/listChannels";
import { config } from "dotenv";

config();

connectDB();

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const events = {
  register: re,
  login: lo,
  sendMessage: me,
  join: je,
  nick: ni,
  users: li,
  list: listChannels,
  delete: de,
  create: cr,
  quit: le,
  verifyToken: veto,
  getConversations: gech,
  getAllMessages: getAllMess,
  getMessages: getMess,
  msg: priMess,
  user_connected,
};

startSocket(io, events);

server.listen(8000, () => {
  console.log(`Server running on port ${8000}`);
});
