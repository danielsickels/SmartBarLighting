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
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
        <div className="bg-gray-900 border border-amber-500 p-6 lg:p-9 rounded-xl w-96 lg:w-[576px] relative shadow-[0_0_30px_8px_rgba(255,191,0,0.3)]">
          <h2 className="text-2xl lg:text-4xl font-extrabold text-amber-400 mb-3 lg:mb-5 text-center">
            Login Required
          </h2>
          <p className="text-amber-200/90 text-sm lg:text-lg leading-relaxed mb-6 lg:mb-9 text-center">
            <span className="text-amber-300 font-semibold">
              Welcome to Smart Bar!
            </span>
            <br />
            This app is designed to help you manage your collection of alcoholic
            spirits and discover creative recipes to make with them. Add your
            bottles to unlock a world of cocktail possibilities.
            <br />
            <br />
            <strong className="text-amber-400">Enjoy responsibly!</strong>
          </p>
          <button
            onClick={() => router.push("/login")}
            className="text-amber-500 px-6 lg:px-9 py-2 lg:py-3 rounded-lg w-full font-bold text-base lg:text-xl border border-amber-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.08))',
              boxShadow: '0 0 12px 2px rgba(153, 102, 0, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px 3px rgba(153, 102, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 12px 2px rgba(153, 102, 0, 0.4)';
            }}
          >
            Go to Login
          </button>
          <div className="absolute -top-5 lg:-top-8 right-[-20px] lg:right-[-30px] w-20 h-20 lg:w-32 lg:h-32 bg-gray-900 border border-amber-500/50 rounded-full flex items-center justify-center shadow-[0_0_15px_3px_rgba(255,191,0,0.4)]">
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
