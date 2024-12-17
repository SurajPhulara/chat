"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

const ChatWindow = ({ user, chatId, onChatIdChange }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (chatId && user) {
      const fetchChatHistory = async () => {
        try {
          const response = await apiRequest(`chatbot/chat-history?chat_id=${chatId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          });
          setChatHistory(response.chat_history || []);
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      };

      fetchChatHistory();
    } else {
      setChatHistory([]);
    }
  }, [chatId, user]);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    try {
      let newChatId = chatId;
      if (!chatId) {
        newChatId = uuidv4();
      }

      const response = await apiRequest("chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: newChatId,
          message,
        }),
      });

      if (!chatId) {
        onChatIdChange(newChatId);
        router.push(`/chat?id=${newChatId}`);
      }

      setChatHistory([
        ...chatHistory,
        { sender: "user", content: message },
        { sender: "bot", content: response.response },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-full p-4 bg-gray-50 rounded-xl shadow-md">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 bg-white rounded-xl shadow-inner">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"
              } mb-2`}
          >
            <div
              className={`max-w-xs p-3 rounded-xl text-sm ${chat.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-gray-200 text-gray-900 rounded-bl-sm"
                }`}
            >
              {chat.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center mt-4 p-2 bg-white rounded-full shadow-md">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-2 text-gray-700 bg-transparent focus:outline-none rounded-full"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="p-3 ml-2 text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
        >
          <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45" />
        </button>

      </div>
    </div>
  );
};

export default ChatWindow;
