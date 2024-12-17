"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import "./page.css";

const ChatPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [chats, setChats] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch the latest chats
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const response = await apiRequest("chatbot/latest-chats?x=5", {
          method: "GET",
        });
        setChats(response.latest_chats || []);
        setLoadingChats(false);
      } catch (error) {
        console.error("Failed to load chats:", error.message);
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, [user]);

  // Fetch chat history when a chat is selected
  useEffect(() => {
    const chatId = searchParams.get("chat_id");
    if (chatId) {
      setSelectedChatId(chatId);
      fetchChatHistory(chatId);
    }
  }, [searchParams]);

  const fetchChatHistory = async (chatId) => {
    setLoadingHistory(true);
    try {
      const response = await apiRequest(`chatbot/chat-history?chat_id=${chatId}`, {
        method: "GET",
      });
      setChatHistory(response.chat_history || []);
    } catch (error) {
      console.error("Failed to load chat history:", error.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewChat = () => {
    const newChatId = "new";
    setChatHistory([]);
    setSelectedChatId(newChatId);
    router.push(`/chat?chat_id=${newChatId}`);
  };

  const handleChatSelect = (chatId) => {
    setChatHistory([]);
    setSelectedChatId(chatId);
    router.push(`/chat?chat_id=${chatId}`);
  };

  const handleSendMessage = async () => {
    console.log("hgfdsfghjnbvc ,",message)
    // if (!message.trim() || !selectedChatId) return;

    try {
      const response = await apiRequest("chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: selectedChatId, message }),
      });

      setChatHistory((prev) => [
        ...prev,
        { sender: "user", content: message, timestamp: new Date().toISOString() },
        { sender: "bot", content: response.response, timestamp: new Date().toISOString() },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error.message);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Recent Chats</h2>
        {loadingChats ? (
          <p>Loading chats...</p>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat.chat_id}
              className={`chat-item ${selectedChatId === chat.chat_id ? "active" : ""}`}
              onClick={() => handleChatSelect(chat.chat_id)}
            >
              {chat.name}
            </div>
          ))
        ) : (
          <p>No recent chats</p>
        )}
        <button className="new-chat" onClick={handleNewChat}>
          + New Chat
        </button>
      </div>

      {/* Chat History and Message Input */}
      <div className="chat-content">
        {loadingHistory ? (
          <p>Loading chat history...</p>
        ) : (
          <div className="chat-history">
            {chatHistory.length > 0 ? (
              chatHistory.map((entry, index) => (
                <div
                  key={index}
                  className={`chat-message ${entry.sender === "user" ? "user" : "bot"}`}
                >
                  <p>{entry.content}</p>
                  <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            ) : (
              <p>No messages yet. Start the conversation!</p>
            )}
          </div>
        )}
        <div className="message-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
