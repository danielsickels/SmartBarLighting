// "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/config";
import { setTokens } from "@/lib/tokenManager";

interface LoginProps {
  onShowRegister: () => void;
}

const Login = ({ onShowRegister }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      setTokens(data.access_token, data.refresh_token);
      router.push("/");
    } catch (error: unknown) {
      setErrorMessage((error as Error).message || "Something went wrong");
    }
  };

  return (
    <div>
      {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
        className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700"
      >
        Login
      </button>
      <p className="text-center mt-4">
        Don&apos;t have an account?{" "}
        <button
          onClick={onShowRegister}
          className="text-blue-600 hover:underline"
        >
          Register
        </button>
      </p>
    </div>
  );
};

export default Login;
