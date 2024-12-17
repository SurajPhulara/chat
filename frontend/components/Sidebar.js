"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Access user from AuthContext
  const router = useRouter();

  useEffect(() => {
    const fetchLatestChats = async () => {
      try {
        if (!user) router.push(`/auth`);; // Ensure user is logged in before making API requests

        const data = await apiRequest("chatbot/latest-chats?x=5", {
          method: "GET",
        });
        setChats(data.latest_chats || []); // Update state with chats
      } catch (error) {
        console.error("Failed to fetch latest chats:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestChats();
  }, [user]);

  const handleChatClick = (chatId) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2>Recent Chats</h2>
      </div>
      <div className={styles.chatList}>
        {loading ? (
          <p>Loading...</p>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat.chat_id}
              className={styles.chatItem}
              onClick={() => handleChatClick(chat.chat_id)}
            >
              {chat.name}
            </div>
          ))
        ) : (
          <p>No recent chats</p>
        )}
      </div>
      <div className={styles.newChat} onClick={() => router.push("/chat/new")}>
        + New Chat
      </div>
    </div>
  );
};

export default Sidebar;
