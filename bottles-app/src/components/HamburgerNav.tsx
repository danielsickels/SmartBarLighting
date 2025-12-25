"use client";

import { useState, useRef, useEffect } from "react";
import LogoutButton from "./LogoutButton";

interface NavItem {
  id: string;
  label: string;
}

interface HamburgerNavProps {
  navItems: NavItem[];
  activeContent: string | null;
  onNavClick: (contentType: string) => void;
  disabled?: boolean;
}

export default function HamburgerNav({
  navItems,
  activeContent,
  onNavClick,
  disabled = false,
}: HamburgerNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNavClick = (contentType: string) => {
    onNavClick(contentType);
    setIsOpen(false);
  };

  // Calculate stagger delay for nav items (horizontal animation)
  const getNavItemStyle = (index: number) => ({
    transform: isOpen 
      ? "translateX(0) scale(1)" 
      : "translateX(-20px) scale(0.8)",
    opacity: isOpen ? 1 : 0,
    transition: `all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? index * 0.04 : (navItems.length - index) * 0.02}s`,
    pointerEvents: isOpen ? "auto" as const : "none" as const,
  });

  // Logout button animates down after nav items
  const getLogoutStyle = () => ({
    transform: isOpen 
      ? "translateY(0) scale(1)" 
      : "translateY(-10px) scale(0.8)",
    opacity: isOpen ? 1 : 0,
    transition: `all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? navItems.length * 0.04 + 0.05 : 0}s`,
    pointerEvents: isOpen ? "auto" as const : "none" as const,
  });

  return (
    <div ref={menuRef} className={`fixed top-4 left-4 right-4 sm:right-auto z-[80] ${disabled ? "pointer-events-none" : ""}`}>
      {/* Top row: Hamburger + Nav Items */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2 md:gap-2.5 lg:gap-3">
        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-10 h-10 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gray-900/95 rounded-lg shadow-[0_0_15px_3px_rgba(153,102,0,0.6)] hover:shadow-[0_0_20px_4px_rgba(153,102,0,0.8)] transition-all flex flex-col items-center justify-center gap-1 sm:gap-1 md:gap-1.5 flex-shrink-0"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span
            className={`block w-5 sm:w-5 md:w-5 lg:w-6 h-0.5 bg-amber-500 transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-1.5 sm:translate-y-1.5 md:translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-5 sm:w-5 md:w-5 lg:w-6 h-0.5 bg-amber-500 transition-all duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 sm:w-5 md:w-5 lg:w-6 h-0.5 bg-amber-500 transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-1.5 sm:-translate-y-1.5 md:-translate-y-2" : ""
            }`}
          />
        </button>

        {/* Navigation Items - horizontal with wrap */}
        {navItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            style={getNavItemStyle(index)}
            className={`px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm md:px-3.5 md:py-2 md:text-sm lg:px-4 lg:py-2.5 lg:text-base rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeContent === item.id
                ? "bg-amber-600 text-gray-900 shadow-[0_0_12px_3px_rgba(217,119,6,0.7)] sm:shadow-[0_0_14px_3px_rgba(217,119,6,0.7)] lg:shadow-[0_0_18px_4px_rgba(217,119,6,0.7)]"
                : "bg-gray-900/95 text-amber-500 shadow-[0_0_8px_2px_rgba(153,102,0,0.5)] hover:shadow-[0_0_12px_3px_rgba(153,102,0,0.7)] lg:shadow-[0_0_10px_2px_rgba(153,102,0,0.5)] lg:hover:shadow-[0_0_15px_3px_rgba(153,102,0,0.7)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Logout Button - below hamburger */}
      <div 
        className="mt-2 sm:mt-2 md:mt-2.5 lg:mt-3"
        style={getLogoutStyle()}
      >
        <LogoutButton />
      </div>
    </div>
  );
}
