// src/socket.js
import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000'); // update if server is different
export default socket;
