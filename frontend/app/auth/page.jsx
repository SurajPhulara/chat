"use client";

import { useState } from "react";
import styles from "./page.module.css"; // Scoped CSS for the login page
import { useAuth } from "../../context/AuthContext";

export default function Auth() {
  // const { login } = useAuth();

  const { login, register, googleLogin } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? "auth/register" : "auth/login";

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      if (!isRegistering) {
        login(formData.email, formData.password); // Trigger login for the logged-in user
      } else {
        alert("Registration successful! Please log in.");
        setIsRegistering(false);
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };

  const handleOAuthLogin = (provider) => {
    // window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google_login`;
    googleLogin();
  };

  return (
    <div className={`${styles.authpage}`}>
      <div className={`${styles.container} ${isRegistering ? styles.active : ""}`}>
        {/* Sign-up form */}
        <div className={`${styles["form-container"]} ${styles["sign-up"]}`}>
          <form onSubmit={handleFormSubmit}>
            <h1>Create Account</h1>
            <div className={styles["social-icons"]}>
              <a type="button" onClick={() => handleOAuthLogin("google")} className={styles.icon}>
                <i className="fab fa-google-plus-g"></i>
              </a>
            </div>
            <span>or use your email for registration</span>
            <input type="text" name="username" placeholder="Name" onChange={handleInputChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleInputChange} required />
            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* Sign-in form */}
        <div className={`${styles["form-container"]} ${styles["sign-in"]}`}>
          <form onSubmit={handleFormSubmit}>
            <h1>Sign In</h1>
            <div className={styles["social-icons"]}>
              <a type="button" onClick={() => handleOAuthLogin("google")} className={styles.icon}>
                <i className="fab fa-google-plus-g"></i>
              </a>
            </div>
            <span>or use your email and password</span>
            <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleInputChange} required />
            <button type="submit">Sign In</button>
          </form>
        </div>

        <div className={styles["toggle-container"]}>
          <div className={styles.toggle}>
            <div className={`${styles["toggle-panel"]} ${styles["toggle-left"]}`}>
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of the site's features</p>
              <button className={styles.hidden} onClick={() => setIsRegistering(false)}>
                Sign In
              </button>
            </div>
            <div className={`${styles["toggle-panel"]} ${styles["toggle-right"]}`}>
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of the site's features</p>
              <button className={styles.hidden} onClick={() => setIsRegistering(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
