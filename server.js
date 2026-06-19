import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);
  const users = new Map();

  const broadcastOnlineUsers = () => {
    const names = Array.from(users.values()).map((u) => u.name);
    io.emit("online_users", names);
  };

  io.on("connection", (socket) => {
    console.log("接続しました:", socket.id);

    socket.on("login", (data) => {
      if (!data?.name) return;
      users.set(socket.id, { name: data.name });
      console.log("ログイン:", data.name, socket.id);
      io.emit("user_joined", { name: data.name });
      broadcastOnlineUsers();
    });

    socket.on("message", (data) => {
      const user = users.get(socket.id);
      if (!user || !data?.text?.trim()) return;

      const messageData = {
        id: Math.random().toString(36).slice(2, 11),
        text: data.text.trim(),
        userName: user.name,
        userId: socket.id,
        timestamp: new Date(),
      };
      console.log("メッセージ受信:", messageData);
      io.emit("message", messageData);
    });

    socket.on("disconnect", () => {
      const user = users.get(socket.id);
      console.log("接続終了:", socket.id);
      users.delete(socket.id);
      if (user) {
        io.emit("user_left", { name: user.name });
      }
      broadcastOnlineUsers();
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});