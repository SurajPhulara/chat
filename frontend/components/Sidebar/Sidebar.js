import React, { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";
import { apiRequest } from "../../lib/api";
import { useRouter } from "next/navigation";
import { FaComments } from "react-icons/fa";

const Sidebar = ({ user, chatId, onChatIdChange }) => {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLatestChats = async () => {
      try {
        if (!user) router.push(`/auth`);

        const data = await apiRequest("chatbot/latest-chats?x=5", {
          method: "GET",
        });
        setRecentChats(data.latest_chats || []);
      } catch (error) {
        console.error("Failed to fetch latest chats:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestChats();
  }, [user, chatId]);

  const handleSelectChat = (selectedChatId) => {
    onChatIdChange(selectedChatId);
    router.push(`/chat?id=${selectedChatId}`);
  };

  const handleNewChat = () => {
    onChatIdChange(null);
    router.push(`/chat`);
  };

  return (
    <div className={styles.sidebarContainer}>
      {/* Logo Section */}
      <div className={styles.logoContainer}>
        <h1 className={styles.logoText}>MyCompany</h1>
      </div>

      {/* New Chat Button */}
      <button className={styles.newChatButton} onClick={handleNewChat}>
        + New Chat
      </button>

      {/* Recent Chats Section */}
      <div className={styles.chatsContainer}>
        <h3 className={styles.chatsHeading}>Recent Chats</h3>
        <ul className={styles.chatList}>
          {recentChats.length > 0 ? (
            recentChats.map((chat) => (
              <li
                key={chat.chat_id}
                className={`${styles.chatItem} ${
                  chat.chat_id === chatId ? styles.activeChatItem : ""
                }`}
                onClick={() => handleSelectChat(chat.chat_id)}
              >
                <FaComments className={styles.chatIcon} />
                <span className={styles.chatName}>{chat.name}</span>
              </li>
            ))
          ) : (
            <p className={styles.noChats}>No recent chats.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
