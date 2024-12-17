"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";
import styles from "./ChatWindow.module.css";

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

  return (
    <div className={styles.chatBox}>
      {/* Chat History */}
      <div className={styles.chatHistory}>
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`${styles.chatMessage} ${chat.sender === "user" ? styles.userMessage : styles.botMessage}`}
          >
            <div className={styles.messageContent}>{chat.content}</div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.inputField}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} className={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
