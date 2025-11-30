// "use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/config";
import { setTokens } from "@/lib/tokenManager";
import toast from "react-hot-toast";

interface LoginProps {
  onShowRegister: () => void;
  initialUsername?: string;
}

const Login = ({ onShowRegister, initialUsername }: LoginProps) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState(initialUsername || "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Update username when initialUsername changes (after registration)
  useEffect(() => {
    if (initialUsername) {
      setUsernameOrEmail(initialUsername);
    }
  }, [initialUsername]);

  const handleLogin = async () => {
    // Basic validation
    if (!usernameOrEmail.trim()) {
      toast.error("Please enter your username or email");
      return;
    }
    
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading("Logging you in...");
    
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username_or_email: usernameOrEmail, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Show the backend error message
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      setTokens(data.access_token, data.refresh_token);
      toast.success("Welcome back! 🍸", { id: toastId });
      
      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error: unknown) {
      const errorMsg = (error as Error).message || "Something went wrong";
      toast.error(errorMsg, { id: toastId });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Username or Email</label>
        <input
          type="text"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter your username or email"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>
      <button
        onClick={handleLogin}
        disabled={isSubmitting}
        className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
      <p className="text-center mt-4">
        Don&apos;t have an account?{" "}
        <button
          onClick={onShowRegister}
          className="font-bold text-blue-600 hover:underline"
        >
          Register
        </button>
      </p>
    </div>
  );
};

export default Login;
