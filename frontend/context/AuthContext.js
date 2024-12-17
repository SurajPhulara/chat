"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for initial user check
  const router = useRouter();

  const login = async (email, password) => {
    try {
      const data = await apiRequest("auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("user", JSON.stringify(data.user)); // Store user in local storage
      setUser(data.user);
      router.push("/chat");
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error; // Propagate the error to the calling function
    }
  };

  const register = async (email, password, username) => {
    try {
      const data = await apiRequest("auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      return data; // Return data to inform successful registration
    } catch (error) {
      console.error("Registration failed:", error.message);
      throw error; // Propagate the error to the calling function
    }
  };

  const googleLogin = () => {
    // Redirect user to Google OAuth login URL
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google_login`;
  };
  

  const logout = async () => {
    try {
      await apiRequest("auth/logout", { method: "POST" }); // Clear server-side session if necessary
      localStorage.removeItem("user"); // Remove user data from local storage
      setUser(null);
      router.push("/auth"); // Redirect to the authentication page
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  // const checkUser = async () => {
  //   try {
  //     const storedUser = localStorage.getItem("user");
  //     if (storedUser) {
  //       setUser(JSON.parse(storedUser)); // Parse only if storedUser exists
  //     }
  //   } catch (error) {
  //     console.error("Error checking user:", error.message);
  //   } finally {
  //     setLoading(false); // Ensure loading stops after execution
  //   }
  // };

  const checkUser = async () => {
    try {
      // First, try to get user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Parse only if storedUser exists
        router.push("/chat");
      } else {
        // If no user in localStorage, check with the backend for the current user
        const response = await apiRequest("auth/current", { method: "GET" });
        if (response.user) {
          setUser(response.user); // Set the user if the backend returns user data
          localStorage.setItem("user", JSON.stringify(response.user)); // Store in localStorage for future sessions
          router.push("/chat");
        }
      }
    } catch (error) {
      console.error("Error checking user:", error.message);
    } finally {
      setLoading(false); // Ensure loading stops after execution
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading state until user is checked
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
