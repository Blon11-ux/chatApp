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
      id: data.id,
      text: data.text,
      timestamp: new Date(data.timestamp),
      isOwn: data.userId === socket.id,
      userName: data.userName,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const messageData = {
      text: inputValue,
      userId: socket.id,
      timestamp: new Date(),
    };

    socket.emit("message", messageData);
    setInputValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
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
        socket.emit("login", { name: decodedJwt.payload.name });
      } catch {
        router.push("/user/login");
      }
    };
    checkToken();
  }, [router]);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
    };
  }, []);

  // チャット画面
  if (!isLoggedIn) {
    return <div></div>;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* ヘッダー */}
      <header className="border-b bg-white px-6 py-4 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">チャット</h1>
            <p className="text-sm font-bold text-gray-600">ユーザー: {userName}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className={`text-sm font-bold ${isConnected ? "text-green-600" : "text-red-600"}`}>
              {isConnected ? "✓ 接続中" : "✗ 接続中..."}
            </p>
            <button
              onClick={handleLogout}
              className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">
              メッセージはまだありません
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    msg.isOwn
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 shadow"
                  }`}
                >
                  <p className={`text-xs font-bold mb-1 ${
                    msg.isOwn ? "text-blue-100" : "text-gray-600"
                  }`}>
                    {msg.userName}
                  </p>
                  <p className="break-words font-bold">{msg.text}</p>
                  <p
                    className={`text-xs ${
                      msg.isOwn ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 入力フォーム */}
      <footer className="border-t bg-white px-6 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
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
  );
};

export default Home;
