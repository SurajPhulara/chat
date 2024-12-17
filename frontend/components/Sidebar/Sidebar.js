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
  }, [user]);

  const loadMoreChats = async () => {
    try {
      if (!user) router.push(`/auth`);

      const data = await apiRequest(`chatbot/latest-chats?x=${recentChats.length + 5}`, {
        method: "GET",
      });

      // Append the newly fetched chats to the current list
      setRecentChats((prevChats) => [...prevChats, ...data.latest_chats]);
    } catch (error) {
      console.error("Failed to fetch latest chats:", error.message);
    }
  };

  const handleSelectChat = (selectedChatId) => {
    onChatIdChange(selectedChatId);
    router.push(`/chat?id=${selectedChatId}`);
  };

  const handleNewChat = () => {
    onChatIdChange(null);
    router.push(`/chat`);
  };



  // Re-fetch the chats if the selected chatId is not in recentChats
  useEffect(() => {
    const isChatIdInRecentChats = recentChats.some((chat) => chat.chat_id === chatId);

    if (chatId && !isChatIdInRecentChats) {
      setLoading(true); // Start loading again

      const fetchLatestChats = async () => {
        try {
          if (!user) router.push(`/auth`);

          const data = await apiRequest("chatbot/latest-chats?x=5", {
            method: "GET",
          });

          // Filter out any chat that is already in the recentChats state
          const newChats = data.latest_chats.filter((chat) =>
            !recentChats.some(existingChat => existingChat.chat_id === chat.chat_id)
          );

          // Append the new chats to the state
          setRecentChats((prevChats) => [...newChats, ...prevChats]);

        } catch (error) {
          console.error("Failed to fetch latest chats:", error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchLatestChats();
    }
  }, [chatId]); // Trigger when chatId or recentChats change


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
          {loading ? (
            <p>Loading...</p>
          ) : recentChats.length > 0 ? (
            recentChats.map((chat) => (
              <li
                key={chat.chat_id}
                className={`${styles.chatItem} ${chat.chat_id === chatId ? styles.activeChatItem : ""
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
          {
            recentChats.length > 0 ?
            <li className={styles.loadmorechats} onClick={loadMoreChats}>
              Load more chats
            </li>
            :<></>
          }
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
