"use client";

import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-black text-amber-500 font-bold px-4 py-2 rounded-lg shadow-[0_0_5px_1px_rgba(153,102,0,0.3)] transition-all hover:shadow-[0_0_15px_3px_rgba(153,102,0,0.8)]"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
