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

  // Calculate stagger delay for each item
  const getItemStyle = (index: number) => ({
    transform: isOpen 
      ? "translateY(0) translateX(0) scale(1)" 
      : "translateY(-20px) translateX(-10px) scale(0.8)",
    opacity: isOpen ? 1 : 0,
    transition: `all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? index * 0.04 : (navItems.length - index) * 0.02}s`,
    pointerEvents: isOpen ? "auto" as const : "none" as const,
  });

  return (
    <div ref={menuRef} className={`fixed top-4 left-4 z-[80] ${disabled ? "pointer-events-none" : ""}`}>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 bg-gray-900/95 rounded-lg shadow-[0_0_15px_3px_rgba(153,102,0,0.6)] hover:shadow-[0_0_20px_4px_rgba(153,102,0,0.8)] transition-all flex flex-col items-center justify-center gap-1.5"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <span
          className={`block w-6 h-0.5 bg-amber-500 transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-amber-500 transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-amber-500 transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* Navigation Menu */}
      <div className="absolute top-14 left-0 w-56">
        <div className="space-y-3">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={getItemStyle(index)}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                activeContent === item.id
                  ? "bg-amber-600 text-gray-900 shadow-[0_0_18px_4px_rgba(217,119,6,0.7)]"
                  : "bg-gray-900/95 text-amber-500 shadow-[0_0_10px_2px_rgba(153,102,0,0.5)] hover:shadow-[0_0_15px_3px_rgba(153,102,0,0.7)]"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div 
            className="pt-2"
            style={getItemStyle(navItems.length)}
          >
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
