import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

export { socket };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
