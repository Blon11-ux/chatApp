"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtVerify } from "jose";
import { socket } from "@/socket";

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const router = useRouter();

  const onConnect = () => {
    setIsConnected(true);
    console.log("サーバーに接続しました");
  };

  const onDisconnect = () => {
    setIsConnected(false);
    console.log("サーバーから切断されました");
  };

  const onMessage = (data) => {
    const newMessage = {
      id: data.id ?? `${data.userName}-${data.timestamp}-${Math.random()}`,
      text: data.text,
      timestamp: new Date(data.timestamp),
      isOwn: data.userName === userName,
      userName: data.userName,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    const messageData = {
      text: inputValue,
      userName,
      timestamp: new Date(),
    };
    socket.emit("message", messageData);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    socket.disconnect();
    router.push("/user/login");
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/user/login");
        return;
      }
      try {
        const secretKey = new TextEncoder().encode("chat-app");
        const decodedJwt = await jwtVerify(token, secretKey);
        setUserName(decodedJwt.payload.name);
        setIsLoggedIn(true);

        if (!socket.connected) {
          socket.connect();
        }
        socket.emit("login", { name: decodedJwt.payload.name });

        const response = await fetch("/api/user/echiran");
        const data = await response.json();
        setUsers(data.users);
      } catch {
        router.push("/user/login");
      }
    };
    checkToken();
  }, [router]);

  useEffect(() => {
    if (socket.connected) onConnect();

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("online_users", (names) => setOnlineUsers(names));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.off("online_users");
    };
  }, [userName]);

  if (!isLoggedIn) return <div></div>;

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-gray-800">ユーザー一覧</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => {
            const isOnline = onlineUsers.includes(user.name);
            return (
              <div key={user._id} className="flex items-center gap-3 p-4 border-b hover:bg-gray-50">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {user.name[0]}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-red-400"}`}></span>
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user.name}</p>
                  <p className={`text-xs font-bold ${isOnline ? "text-green-500" : "text-red-400"}`}>
                    {isOnline ? "オンライン" : "オフライン"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t">
          <p className="text-sm font-bold text-gray-600 mb-2">ユーザー: {userName}</p>
          <button onClick={handleLogout} className="w-full rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600">
            ログアウト
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-100">
        <header className="border-b bg-white px-6 py-4 shadow">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">チャット</h1>
            <p className={`text-sm font-bold ${isConnected ? "text-green-600" : "text-red-600"}`}>
              {isConnected ? "✓ 接続中" : "✗ 接続中..."}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500">メッセージはまだありません</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs rounded-lg px-4 py-2 ${msg.isOwn ? "bg-blue-500 text-white" : "bg-white text-gray-800 shadow"}`}>
                    <p className={`text-xs font-bold mb-1 ${msg.isOwn ? "text-blue-100" : "text-gray-600"}`}>{msg.userName}</p>
                    <p className="break-words font-bold">{msg.text}</p>
                    <p className={`text-xs ${msg.isOwn ? "text-blue-100" : "text-gray-500"}`}>
                      {msg.timestamp.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <footer className="border-t bg-white px-6 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              disabled={!isConnected}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !inputValue.trim()}
              className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
              送信
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;