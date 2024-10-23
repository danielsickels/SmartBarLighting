"use client"; 

import { useState, useEffect } from 'react';
import BottleDetails from '../components/BottleDetails';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchBottle, Bottle } from '../services/bottleService';

export default function Home() {
  const [bottle, setBottle] = useState<Bottle | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // Track whether the component has mounted

  useEffect(() => {
    setMounted(true); // Set mounted to true when the component mounts
    
    const getBottle = async () => {
      const bottleData = await fetchBottle(1); // Fetch bottle with ID 1
      setBottle(bottleData);
      setLoading(false);
    };

    getBottle();
  }, []);

  if (!mounted || loading) {
    // Render the loading spinner until the component has mounted and finished loading
    return <LoadingSpinner />;
  }

  if (!bottle) {
    return <div className="text-center text-red-500">Error: Bottle not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-8">Bottle Details</h1>
      <BottleDetails 
        name={bottle.name}
        material={bottle.material}
        capacity_ml={bottle.capacity_ml}
      />
    </div>
  );
}
