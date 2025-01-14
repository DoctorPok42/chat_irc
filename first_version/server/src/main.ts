import { createServer } from "http";
import { Server } from "socket.io";
import { readdirSync } from "fs";
import { join } from "path";
import { config } from "dotenv";
import { Events } from "./types";
import { checkCollections, color } from "./functions";
import startComunication from "./socket";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";
const { availableParallelism } = require("node:os");
const cluster = require("node:cluster");

config();

let events = {} as Events;

// if (cluster.isPrimary) {
//   const numCPUs = availableParallelism();

//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork({
//       PORT: 3000 + i,
//     });
//   }

//   setupPrimary();
// }

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.SERVER_URL,
  },
  connectionStateRecovery: {},
  // adapter: createAdapter(),
});

const initServer = async () => {
  try {
    const handlersDir = join(__dirname, "./handlers");
    readdirSync(handlersDir).forEach(async (handler) => {
      if (!handler.endsWith(".js")) return;
      require(`${handlersDir}/${handler}`)(events);
    });

    const check = Promise.all([
      checkCollections(),
      startComunication(io, events),
    ]);
    await check;

    server.listen(Number(process.env.PORT), () => {
      console.log(
        color(
          "text",
          `🚀 Server is running on ${color(
            "variable",
            Number(process.env.PORT)
          )}`
        )
      );
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

initServer();

export { io };
