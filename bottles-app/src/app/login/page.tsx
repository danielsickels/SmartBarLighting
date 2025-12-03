"use client";

import { useState } from "react";
import Login from "../../components/Login";
import RegisterModal from "../../components/RegisterModal";

const LoginPage = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState<string>("");

  const handleRegisterSuccess = (username: string) => {
    setRegisteredUsername(username);
  };

  return (
    <>
      {/* Fixed background layer */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/manybarrels2.webp')", // Path to your background image
          backgroundRepeat: "repeat", // Makes the background repeat
          backgroundSize: "auto", // Shrinks the size of the tiles
        }}
      />
      {/* Content layer - scrollable container */}
      <div className="flex items-center justify-center min-h-screen overflow-y-auto scrollbar-hide py-8">
        <div className="max-w-[95vw] sm:max-w-md lg:max-w-xl w-full bg-gradient-to-br from-amber-50 to-yellow-50 p-6 lg:p-9 rounded-xl border-4 border-double border-amber-700 shadow-lg">
        <h1 className="text-2xl lg:text-4xl font-bold text-center mb-4 lg:mb-6 text-amber-900">Smart Bar Login</h1>
        <Login 
          onShowRegister={() => setShowRegisterModal(true)} 
          initialUsername={registeredUsername}
        />
      </div>
      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)} 
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
      </div>
    </>
  );
};

export default LoginPage;
