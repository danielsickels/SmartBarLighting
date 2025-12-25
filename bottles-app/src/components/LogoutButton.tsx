"use client";

import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/tokenManager";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-black text-amber-500 font-bold px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm md:px-3.5 md:py-2 md:text-sm lg:px-4 lg:py-2 lg:text-base rounded-lg shadow-[0_0_5px_1px_rgba(153,102,0,0.3)] transition-all hover:shadow-[0_0_15px_3px_rgba(153,102,0,0.8)]"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
