import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.scss';
import App from './App';
import io from 'socket.io-client';

export const socket = io(
  "http://localhost:8080",
  { transports: ["websocket"] });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
