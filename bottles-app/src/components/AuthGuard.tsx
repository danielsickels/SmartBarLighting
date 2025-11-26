"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for routing
import { getValidAccessToken, clearTokens } from "@/lib/tokenManager";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getValidAccessToken();
      if (!token) {
        clearTokens();
        setShowModal(true);
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, []);

  if (!isAuthenticated && !showModal) {
    return null;
  }

  if (showModal) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
        <div className="bg-gradient-to-br from-gray-100 to-white p-6 rounded-xl shadow-xl w-96 relative">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-3 text-center">
            Login Required
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6 text-center">
            <span className="text-gray-900 font-semibold">
              Welcome to Smart Bar!
            </span>
            <br />
            This app is designed to help you manage your collection of alcoholic
            spirits and discover creative recipes to make with them. Add your
            bottles to unlock a world of cocktail possibilities.
            <br />
            <br />
            <strong>Enjoy responsibly!</strong>
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            Go to Login
          </button>
          <div className="absolute -top-5 right-[-20px] w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-md">
            <Image
              src="/cool_ape-no-bg.png"
              alt="Icon"
              width={256}
              height={256}
              className="rounded-full shadow-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
