"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Login from "../components/Login/Login"; // Adjust the path as per your project structure
import Signup from "../components/Signup/Signup"; // Adjust the path as per your project structure

export default function LandingPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = (e) => {
    e.preventDefault();
    setIsLoginMode((prevMode) => !prevMode);
  };

  return (
    <div className={styles.container}>
      {/* Left Half: Image */}
      <div className={styles.left}>
        {/* <img
          src="/home.png" // Ensure the image is in the public folder
          alt="Welcome"
          className={styles.image}
        /> */}
      </div>

      {/* Right Half: Login/Signup */}
      <div className={styles.right}>
        <div className={styles.content}>
          {isLoginMode ? <Login toggleMode={toggleMode} /> : <Signup toggleMode={toggleMode} />}
        </div>
      </div>
    </div>
  );
}
