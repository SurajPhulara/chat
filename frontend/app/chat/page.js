"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext"; // Importing useAuth for user context
import UserAvatar from "../../components/UserAvatar/UserAvatar";
import Sidebar from "../../components/Sidebar/Sidebar"; // Importing Sidebar component
import ChatWindow from "../../components/ChatWindow/ChatWindow"; // Import the new ChatWindow component
import styles from "./page.module.css";
import { v4 as uuidv4 } from "uuid";

const ChatPage = () => {
  const { user, logout } = useAuth(); // Using the Auth context to get user and logout functions
  const router = useRouter();

  const [chatId, setChatId] = useState(null); // Centralized chatId state

  // Function to update chatId
  const handleChatIdChange = (newChatId) => {
    setChatId(newChatId);
  };

  // Redirect to auth page if user is not logged in
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user]);

  return (
    <div className={styles.container}>
      {/* Sidebar Component */}
      <Sidebar user={user} chatId={chatId} onChatIdChange={handleChatIdChange}/>

      {/* Main Chat Section */}
      <div className={styles.mainContent}>
        {user && (
          <div className={styles.header}>
            <UserAvatar userName={user.username} logout={logout} />
            <h2>Welcome, {user.username}</h2>
          </div>
        )}

        {/* Chat Window Component */}
        <ChatWindow user={user} chatId={chatId} onChatIdChange={handleChatIdChange}/>
      </div>
    </div>
  );
};

export default ChatPage;
