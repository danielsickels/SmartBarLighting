"use client"; 

import FetchBottleButton from '../components/FetchBottleButton';

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-8">Bottle Management</h1>
      <div className="text-center">
        <FetchBottleButton />
      </div>
    </div>
  );
}
