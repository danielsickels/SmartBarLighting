"use client";

import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Clear the token
    router.push("/login"); // Redirect to the login page
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
