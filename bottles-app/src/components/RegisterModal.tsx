// "use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/lib/config";

interface RegisterModalProps {
  onClose: () => void;
  onRegisterSuccess?: (username: string) => void;
}

const RegisterModal = ({ onClose, onRegisterSuccess }: RegisterModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // Attempt to parse JSON error message from the backend
        try {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Error registering user");
        } catch {
          throw new Error("Error registering user");
        }
      }

      setSuccessMessage("Registration successful! Please log in.");
      const registeredUsername = username;
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      
      // Close modal and pass username back after a short delay
      setTimeout(() => {
        onClose();
        if (onRegisterSuccess) {
          onRegisterSuccess(registeredUsername);
        }
      }, 1000);
    } catch {
      setErrorMessage("Error registering user");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-6 lg:p-9 rounded-xl border-4 border-double border-amber-500 shadow-lg max-w-md w-full">
        <h2 className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4 text-center text-amber-900">Register</h2>
        {successMessage && (
          <p className="text-green-600 mb-4">{successMessage}</p>
        )}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
        <div className="mb-4">
          <label className="block text-amber-900 font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-amber-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-amber-900 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-amber-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-amber-900 font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-amber-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="bg-amber-200 text-amber-900 px-4 py-2 rounded-lg hover:bg-amber-300 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleRegister}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
