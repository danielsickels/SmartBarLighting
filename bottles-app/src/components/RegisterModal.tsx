// "use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/lib/config";
import toast from "react-hot-toast";

interface RegisterModalProps {
  onClose: () => void;
  onRegisterSuccess?: (username: string) => void;
}

const RegisterModal = ({ onClose, onRegisterSuccess }: RegisterModalProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 7) {
      return "Password must be at least 7 characters long";
    }
    if (!/[A-Za-z]/.test(pwd)) {
      return "Password must contain at least one letter";
    }
    if (!/\d/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Frontend validation
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        // Parse backend error messages
        const errorData = await response.json();
        
        // Handle validation errors from Pydantic
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const messages = errorData.detail.map((err: any) => err.msg).join(", ");
          throw new Error(messages);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        } else {
          throw new Error("Error registering user");
        }
      }

      toast.success("Registration successful! Please log in. 🎉", { id: toastId });
      const registeredUsername = username;
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      // Close modal and pass username back after a short delay
      setTimeout(() => {
        onClose();
        if (onRegisterSuccess) {
          onRegisterSuccess(registeredUsername);
        }
      }, 1000);
    } catch (error: unknown) {
      const errorData = error instanceof Error ? error.message : "Error registering user";
      toast.error(errorData, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-2 lg:p-6 lg:p-9 rounded-xl border-4 border-double border-amber-500 shadow-lg max-w-[95vw] sm:max-w-md lg:max-w-xl w-full">
        <h2 className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4 text-center text-amber-900">Register</h2>
        <div className="mb-2 lg:mb-4">
          <label className="block text-amber-900 font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-amber-300 rounded-lg px-3 py-1"
            required
          />
        </div>
        <div className="mb-2 lg:mb-4">
          <label className="block text-amber-900 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-amber-300 rounded-lg px-3 py-1"
            required
          />
        </div>
        <div className="mb-2 lg:mb-4">
          <label className="block text-amber-900 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={password === "" ? "At least 7 characters, include letters and numbers" : ""}
            className="w-full border border-amber-300 rounded-lg px-3 py-1 placeholder:text-amber-600 placeholder:text-sm"
            required
          />
        </div>
        <div className="mb-2 lg:mb-4">
          <label className="block text-amber-900 font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-amber-300 rounded-lg px-3 py-1"
            required
          />
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="bg-amber-200 text-amber-900 px-4 lg:py-2 py-1 rounded-lg hover:bg-amber-300 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleRegister}
            disabled={isSubmitting}
            className="bg-amber-600 text-white px-4 lg:py-2 py-1 rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
