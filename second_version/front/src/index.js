import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { io } from "socket.io-client";
import Cookies from "universal-cookie";

export const socket = io("http://localhost:8000");

const cookies = new Cookies();
export const token = cookies.get("token");

socket.emit("user_connected", { token });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
