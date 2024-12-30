"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

const ChatWindow = ({ user, chatId, onChatIdChange }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatHistoryRef = useRef(null);  // Ref to the chat history container
  const router = useRouter();

  // Function to scroll the chat history to the bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTo({
          top: chatHistoryRef.current.scrollHeight,
          behavior: "smooth", // This enables smooth scrolling
        });
      }
    }, 100); // Delay of 1 second
  };

useEffect(()=>{
  scrollToBottom()
},[])

  useEffect(() => {
    if (chatId && user) {
      const fetchChatHistory = async () => {
        try {
          const response = await apiRequest(`chatbot/chat-history?chat_id=${chatId}`, {
            method: "GET",
          });
          setChatHistory(response.chat_history || []);
        } catch (error) {
          console.log("Error fetching chat history:", error);
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
      if (!chatId || chatHistory.length === 0) {
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

      if (!chatId || chatHistory.length === 0) {
        onChatIdChange(newChatId);
        router.push(`/chat?id=${newChatId}`);
      }

      setChatHistory([
        ...chatHistory,
        { sender: "user", content: message },
        { sender: "bot", content: response.response },
      ]);
      setMessage("");

      // Scroll to bottom after message is added
      scrollToBottom();
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };



  return (
    <div className="relative flex flex-col justify-end h-full max-h-full">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4" ref={chatHistoryRef}>
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"} mb-2`}
          >
            <div
              className={`w-5/6 max-w-full p-3 rounded-xl text-sm ${chat.sender === "user"
                ? "bg-gray-100 text-gray-900 rounded-br-sm"
                : ""
                }`}
            >
              {chat.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 w-10/12 max-w-full flex m-auto items-center justify-between mt-auto p-2 bg-white rounded-full shadow-md">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-w-40 flex-1 flex-shrink-0 px-2 py-2 text-gray-700 bg-transparent focus:outline-none rounded-full"
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
