"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for routing

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setShowModal(true);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated && !showModal) {
    return null; // Render nothing while determining authentication status
  }

  if (showModal) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg w-80">
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p className="mb-4">Please log in to access Smart Bar!</p>
          <button
            onClick={() => router.push("/login")} // Use router.push for navigation
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
