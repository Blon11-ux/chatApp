import { io } from "socket.io-client";

// Set autoConnect to false so it does not connect on the server during SSR
export const socket = io({
  autoConnect: false,
});