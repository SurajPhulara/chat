"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

const ChatWindow = ({ user, chatId, onChatIdChange }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const chatHistoryRef = useRef(null);
  const router = useRouter();

  const suggestedQuestions = [
    "What's the cheapest freezone?",
    "How much does a company cost?",
    "How much does a visa cost?",
  ];

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTo({
          top: chatHistoryRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    if (chatId !== currentChatId) {
      setIsBotTyping(false);
      setChatHistory([]);
      setCurrentChatId(chatId);
    }
  }, [chatId]);

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

  const handleSendMessage = async (inputMessage) => {
    const msg = inputMessage !== undefined ? inputMessage : message;
    if (msg.trim() === "") return;

    try {
      let newChatId = chatId;
      if (!chatId || chatHistory.length === 0) {
        newChatId = uuidv4();
      }

      setChatHistory(prev => [...prev, { sender: "user", content: msg }]);
      setMessage("");

      setIsBotTyping(true);
      setChatHistory(prev => [...prev, { sender: "bot", content: "..." }]);

      const response = await apiRequest("chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: newChatId,
          message: msg,
        }),
      });

      setChatHistory(prev => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1] = {
          sender: "bot",
          content: response.response,
        };
        return updatedHistory;
      });
      setIsBotTyping(false);
      scrollToBottom();

      if (!chatId || chatHistory.length === 0) {
        onChatIdChange(newChatId);
        router.push(`/chat?id=${newChatId}`);
      }
    } catch (error) {
      console.log("Error sending message:", error);
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1] = {
          sender: "bot",
          content: "An error occurred. Please try again.",
        };
        return updatedHistory;
      });
      setIsBotTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="relative flex flex-col justify-end h-full max-h-full">
      <div className="flex-1 overflow-y-auto p-4" ref={chatHistoryRef}>
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"} mb-2`}
          >
            <div
              className={`w-5/6 max-w-full p-3 rounded-xl text-sm ${
                chat.sender === "user"
                  ? "bg-gray-100 text-gray-900 rounded-br-sm"
                  : ""
              }`}
            >
              {chat.content}
            </div>
          </div>
        ))}
  
        {chatHistory.length === 0 && !isBotTyping && (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Heading */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Hi, what can I help you with?</h2>
              <p className="text-sm text-gray-500 mt-2">
                I can help you with questions like...
              </p>
            </div>
  
            {/* Suggested Questions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl p-4">
              {suggestedQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(q)}
                  className="p-4 text-left bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm border border-gray-200 hover:border-gray-300"
                >
                  {q}
                </button>
              ))}
            </div>
  
            {/* Input Box (Only when no chat history) */}
            <div className="w-full max-w-4xl mt-4">
              <div className="w-full flex items-center justify-between p-2 bg-white rounded-full shadow-md">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-w-40 flex-1 flex-shrink-0 px-2 py-2 text-gray-700 bg-transparent focus:outline-none rounded-full"
                  placeholder="Type a message..."
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="p-3 ml-2 text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
                >
                  <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45" />
                </button>
              </div>
            </div>
          </div>
        )}
  
        {isBotTyping && (
          <div className="flex justify-start mb-2">
            <div className="w-5/6 max-w-full p-3 rounded-xl text-sm bg-gray-100 text-gray-900 rounded-br-sm">
              <div className="animate-pulse">
                <div className="h-2.5 bg-gray-300 rounded-full w-1/4 mb-2"></div>
                <div className="h-2.5 bg-gray-300 rounded-full w-2/4 mb-2"></div>
                <div className="h-2.5 bg-gray-300 rounded-full w-3/4 mb-2"></div>
              </div>
            </div>
          </div>
        )}
      </div>
  
      {/* Input Box at Bottom (Only when chat history exists) */}
      {!(chatHistory.length === 0 && !isBotTyping) && (
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
            onClick={() => handleSendMessage()}
            className="p-3 ml-2 text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
          >
            <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45" />
          </button>
        </div>
      )}
    </div>
  );
  
};

export default ChatWindow;
