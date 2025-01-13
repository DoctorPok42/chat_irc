<img src="./first_version/public/favicon.ico" width="100" height="100" align="right" />

# What's Up

[![CI/CD Pipeline](https://github.com/DoctorPok42/chat_irc/actions/workflows/cicd.yml/badge.svg)](https://github.com/DoctorPok42/chat_irc/actions/workflows/cicd.yml)

This is a WhatsApp clone built using React.js, MongoDB, and Socket.io. It is a simple chat application that allows users to send and receive encrypted messages in real-time.

## Features

- Real-time messaging
- End-to-end encryption
- User authentication
- Command-line interface (CLI)
- Message history
- User dashboard
- File sharing
- User profile

## Technologies

- React.js
- TS
- Node.js
- MongoDB
- Socket.io
- Twilio
- JWT

## Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

```bash
cd server && npm install
```

3. Rename `.env.example` to `.env` and fill in the required environment variables (for both client and server)

4. Start the server

```bash
cd server && npm run build && npm start
```

5. Start the client

```bash
npm run dev
```

6. Open `http://localhost:3000` in your browser
