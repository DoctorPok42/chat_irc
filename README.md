# Chat IRC

[![CI/CD Pipeline](https://github.com/DoctorPok42/chat_irc/actions/workflows/cicd.yml/badge.svg)](https://github.com/DoctorPok42/chat_irc/actions/workflows/cicd.yml)

This is an internet relay chat (IRC) application that allows users to communicate with each other in real-time. It is built with React.js, Node.js, and MongoDB. The application features user authentication, a command-line interface (CLI), message history.

## Technologies

- React.js
- TS
- Node.js
- MongoDB
- Socket.io
- JWT

## Installation

1. Clone the repository
2. Install dependencies

```bash
cd second_version && npm install
```

```bash
cd second_version/front && npm install
```

3. Rename all `.env.example` to `.env` and fill in the required environment variables (for both client and server)

4. Start the server

```bash
cd second_version && npm run dev
```

5. Start the client

```bash
cd second_version/front && npm start
```

6. Open `http://localhost:3000` in your browser

## Commands

- **/nick nickname: define the nickname of the user on the server.**
- **/list [string]: list the available channels from the server. If string is specified, only displays those whose name contains the string.**
- **/create channel: create a channel with the specified name.**
- **/delete channel: delete the channel with the specified name.**
- **/join channel: join the specified channel.**
- **/quit channel: quit the specified channel.**
- **/users: list the users currently in the channel.**
- **/msg nickname message: send a private message to the specified nickname.**

message: send a message to all the users on the channel
