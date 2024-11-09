// bottles-app/src/app/page.tsx

"use client";

import { useState } from 'react';
import FetchBottleButton from '../components/FetchBottleButton';
import AddBottleForm from '../components/AddBottleForm';
import FetchAllBottles from '../components/FetchAllBottles';

export default function Home() {
  const [activeContent, setActiveContent] = useState<string | null>(null);

  const toggleContent = (contentType: string) => {
    setActiveContent((prevContent) => (prevContent === contentType ? null : contentType));
  };

  const renderMainContent = () => {
    switch (activeContent) {
      case "fetchAll":
        return <FetchAllBottles />;
      case "fetchSingle":
        return <FetchBottleButton />;
      case "add":
        return <AddBottleForm />;
      default:
        return <p className="text-center">Select an action to display its content here.</p>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for actions, fixed on the left */}
      <div className="w-1/4 bg-gray-100 p-8 space-y-4 fixed top-20 bottom-12 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Actions</h1>

        <button
          onClick={() => toggleContent("fetchSingle")}
          className={`w-full px-4 py-2 rounded-lg mb-2 ${
            activeContent === "fetchSingle" ? "bg-blue-700 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Fetch Single Bottle
        </button>

        <button
          onClick={() => toggleContent("fetchAll")}
          className={`w-full px-4 py-2 rounded-lg mb-2 ${
            activeContent === "fetchAll" ? "bg-green-700 text-white" : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Fetch All Bottles
        </button>

        <button
          onClick={() => toggleContent("add")}
          className={`w-full px-4 py-2 rounded-lg ${
            activeContent === "add" ? "bg-gray-700 text-white" : "bg-gray-600 text-white hover:bg-gray-700"
          }`}
        >
          Add Bottle
        </button>
      </div>

      {/* Main content area, adjusted to accommodate the sidebar width */}
      <div className="flex-grow p-8 ml-[25%] overflow-y-auto pt-20 pb-12">
        <h1 className="text-2xl font-bold mb-8 text-center">Bottle Management</h1>
        {renderMainContent()}
      </div>
    </div>
  );
}
