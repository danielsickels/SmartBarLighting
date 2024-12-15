"use client";

import { useState } from "react";
import Login from "../../components/Login";
import RegisterModal from "../../components/RegisterModal";

const LoginPage = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{
        backgroundImage: "url('/manybarrels2.webp')", // Path to your background image
        backgroundRepeat: "repeat", // Makes the background repeat
        backgroundSize: "autp%", // Shrinks the size of the tiles
      }}
    >
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Smart Bar Login</h1>
        <Login onShowRegister={() => setShowRegisterModal(true)} />
      </div>
      {showRegisterModal && (
        <RegisterModal onClose={() => setShowRegisterModal(false)} />
      )}
    </div>
  );
};

export default LoginPage;
