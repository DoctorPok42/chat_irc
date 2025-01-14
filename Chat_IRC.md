# Chat_IRC

## Description

First step to create a chat with IRC protocol and Socket.io.

## Technologies (MERN)

- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/en/)
- [Socket.io](https://socket.io/)
- [IRC](https://fr.wikipedia.org/wiki/Internet_Relay_Chat)

## Step 1: Installation

### Server

```bash
npm install express socket.io
```

### Client

```bash
npx create-react-app client
```

## Step 2: TS

### Client

```bash
cd client
npm install --save-dev typescript --force
npx tsc --init
npm install socket.io-client @types/socket.io-client --force
```

Modify your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### Server

```bash
cd server
npm install --save-dev typescript @types/node
npx tsc --init
```

Modify your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "CommonJS",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "outDir": "./build",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "useUnknownInCatchVariables": false,
    "skipLibCheck": true
  },
 "include":["./src/**/*", "src/schemas"]
}
```

## Step 3: Create your minimal server

In main file `server/src/index.ts`:

```typescript
import { createServer } from "http";
import { Server } from "socket.io";

const server = createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:8000", // Allow the frontend to connect to the server
  },
});

server.listen(8000, () => {
  // Start the server on port 8000
  console.log("Server is running on http://localhost:8000");
});

io.on("connection", (socket) => {
  // When a client connect to the server
  console.log("A user connected");

  socket.on("disconnect", () => {
    // When a client disconnect from the server
    console.log("A user disconnected");
  });
});
```

Now you can run your server with `npx ts-node src/main.ts`

At this point you have a server that can handle connections and disconnections from multiple clients.

## Step 4: Create your minimal client

In your `index.js` file:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:8000"); // Connect to the server

socket.on("connect", () => {
  console.log("Connected to server"); // Log a message when connected
});

export { socket }; // Export the socket object to be used in other files

```

You should now have a index.js like this:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { io } from "socket.io-client";

const socket = io("http://localhost:8000"); // Connect to the server

socket.on("connect", () => {
  console.log("Connected to server"); // Log a message when connected
});

export { socket }; // Export the socket object to be used in other files

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Now you can run your client with `npm start`

You should see a message in the console saying ***Connected to server*** and in the server console ***A user connected***.

Both client and server should be start in a different terminal.

## Step 5: Create a chat

### Server

In your `server/src/index.ts` file:

```typescript
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("message", (message) => { // Listen to the message event
    console.log("Message received: ", message);
    io.emit("message", message); // Emit the message to all clients
  });
});
```

### Client

Create a file in `client/src/tools/webSocketHandler.ts`:

```typescript
import { socket } from "../index";

const emitEvent = (
  eventName: string,
  data: any,
  callback?: (data: any, error?: any) => void
) => {
  try {
    socket.on(eventName, (data: any) => {
      callback && callback(data); // Call the callback function if it exists
    });

    socket.emit(eventName, data, callback); // Emit the event
  } catch (error) {
    if (callback) {
      callback(undefined, error);
    }
  }
}

export default emitEvent;
```

In your `client/src/App.tsx` file:

```typescript
import React, { useState } from "react";
import emitEvent from "./tools/webSocketHandler";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = () => {
    emitEvent("message", message, (data: any, error: any) => {
      if (error) {
        console.error(error);
      } else {
        setMessages([...messages, message]);
      }
    });
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

Now you can run your client and server and you should be able to send messages from the client to the server and back to the client.

But for nown, messages are saved in the client state, so if you refresh the page, you will lose all messages.

## Step 6: Save messages in the server

We will use MongoDB to save messages.

### Server

First, install the MongoDB driver:

```bash
npm install mongoose
```

Now, we will create a `Message` [schema](https://mongoosejs.com/docs/guide.html) in `server/src/schemas/Message.ts`:

```typescript
import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    message: String,
  },
  { timestamps: true }
);

export default model("Message", messageSchema);
```

Let's create a MongoDB event handler in `server/src/handlers/Mongo.ts`:

```typescript
import mongoose from "mongoose";

module.exports = () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.log("🍃 Mongo URI not found, failed");
    process.exit(1);
  }

  mongoose.set("strictQuery", false);

  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("🍃 MongoDB connection has been established."))
    .catch(() => console.log("🍃 MongoDB connection has been failed."));
};
```

Create a environment file in `server/.env`:

```env
MONGO_URI=<Your MongoDB URI>
```

In your `server/src/index.ts` file:

```typescript
...
import { createServer } from "http";
import { Server } from "socket.io";
import Message from "./schemas/Message";
import { config } from "dotenv";

config();

require("./handlers/Mongo")();

const server = createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:8000", // Allow the frontend to connect to the server
  },
});

server.listen(8000, () => {
  // Start the server on port 8000
  console.log("Server is running on http://localhost:8000");
});

io.on("connection", (socket) => {
  // When a client connect to the server
  console.log("A user connected");

  socket.on("disconnect", () => {
    // When a client disconnect from the server
    console.log("A user disconnected");
  });

  socket.on("message", (message) => {
    // When the server receive a message from the client
    console.log("Message received: ", message);
    io.emit("message", message);

    // Save the message in the database
    const newMessage = new Message({ message });
    newMessage.save();
  });
});
```

Now, when a message is received, it will be saved in the database.

## Step 7: Get messages from the server

### Server

In your `server/src/index.ts` file:

```typescript
...
io.on("connection", async (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("message", async (message) => {
    console.log("Message received: ", message);
    io.emit("message", message);

    const newMessage = new Message({ message });
    newMessage.save();
  });

  const messages = await Message.find(); // Get all messages from the database
  socket.emit("messages", messages); // Send all messages to the client
});
```

### Client

In your `client/src/App.tsx` file:

```typescript
import React, { useEffect, useState } from "react";
import { socket } from "../index";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  // Get all messages from the server when the component is mounted
  useEffect(() => {
    socket.on("messages", (messages: string[]) => { // Listen to the messages event
      setMessages(messages);
    });

    // Remove the event listener when the component is unmounted
    return () => {
      socket.off("messages");
    };
  }, []);

  const sendMessage = () => {
    emitEvent("message", message, (data: any, error: any) => {
      if (error) {
        console.error(error);
      } else {
        setMessages([...messages, message]);
      }
    });
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

Now, when the client is connected to the server, it will receive all messages from the server that were saved in the database.
