// bottles-app/src/app/page.tsx

"use client";

import FetchBottleButton from '../components/FetchBottleButton';
import AddBottleButton from '../components/AddBottleButton';
import FetchAllBottlesButton from '../components/FetchAllBottlesButton';

export default function Home() {
  return (
    <div className="flex h-screen">
      {/* Sidebar for buttons */}
      <div className="w-1/4 bg-gray-100 p-8 space-y-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Actions</h1>
        <FetchBottleButton />
        <FetchAllBottlesButton />
        <AddBottleButton />
      </div>

      {/* Main content area */}
      <div className="flex-grow p-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Bottle Management</h1>
        {/* Any other main content will be displayed here */}
      </div>
    </div>
  );
}
