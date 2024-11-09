// bottles-app/src/app/page.tsx

"use client";

import { useState } from 'react';
import FetchBottleButton from '../components/FetchBottleButton';
import AddBottleForm from '../components/AddBottleForm';
import FetchAllBottles from '../components/FetchAllBottles'; // Updated import

export default function Home() {
  const [activeContent, setActiveContent] = useState<string | null>(null);

  const renderMainContent = () => {
    switch (activeContent) {
      case "fetchAll":
        return <FetchAllBottles />; // Render bottles list directly
      case "fetchSingle":
        return <FetchBottleButton />;
      case "add":
        return <AddBottleForm />;
      default:
        return <p className="text-center">Select an action to display its content here.</p>;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar for buttons */}
      <div className="w-1/4 bg-gray-100 p-8 space-y-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Actions</h1>

        <button
          onClick={() => setActiveContent("fetchSingle")}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-2"
        >
          Fetch Single Bottle
        </button>

        <button
          onClick={() => setActiveContent("fetchAll")}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-2"
        >
          Fetch All Bottles
        </button>

        <button
          onClick={() => setActiveContent("add")}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Add Bottle
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-grow p-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Bottle Management</h1>
        {renderMainContent()}
      </div>
    </div>
  );
}
