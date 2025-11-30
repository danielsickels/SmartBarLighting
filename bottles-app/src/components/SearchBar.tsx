// bottles-app/src/components/SearchBar.tsx
import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search bottles..." }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-2 rounded bg-gray-900 text-white border border-amber-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
    />
  );
};

export default SearchBar;
