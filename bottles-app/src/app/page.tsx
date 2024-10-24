"use client"; 

import FetchBottleButton from '../components/FetchBottleButton';
import AddBottleButton from '../components/AddBottleButton';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8">Bottle Management</h1>
      
      {/* Fetch Bottle Section */}
      <div className="mb-8 text-center">
        <FetchBottleButton />
      </div>

      {/* Add Bottle Section */}
      <div className="text-center">
        <AddBottleButton />
      </div>
    </div>
  );
}
