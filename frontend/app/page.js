"use client";

import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth");
  };

  return (
    <div className={`${styles.container} ${styles.landing}`}>
      <div className={styles["welcome-container"]}>
        <h1>Welcome to ChatBotAI</h1>
        <p>
          Your intelligent assistant, ready to chat, guide, and simplify your daily tasks. 
          Explore the future of AI-powered conversations.
        </p>
        <button onClick={handleGetStarted}>Get Started</button>
      </div>
    </div>
  );
}
