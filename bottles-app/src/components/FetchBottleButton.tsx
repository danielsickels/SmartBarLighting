import { useState } from 'react';
import BottleDetails from './BottleDetails';
import LoadingSpinner from './LoadingSpinner';
import { fetchBottle, fetchBottleByName, Bottle } from '../services/bottleService'; // Import fetchBottleByName here

const FetchBottleButton = () => {
  const [bottles, setBottles] = useState<Bottle[] | null>(null); // Handle array of bottles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bottleId, setBottleId] = useState<number | null>(null); // For entering bottle ID
  const [bottleName, setBottleName] = useState<string>(''); // For entering bottle name

  const handleFetchBottle = async () => {
    // If both ID and name are missing, show an error
    if (!bottleId && !bottleName) {
      setError('Please enter a Bottle ID or Name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let bottleData: Bottle[] | null = null;

      // Check if we have an ID; fetch by ID if present, otherwise fetch by name
      if (bottleId) {
        const singleBottle = await fetchBottle(bottleId); // Fetch by ID
        bottleData = singleBottle ? [singleBottle] : null; // Wrap in array to keep the same format
      } else if (bottleName) {
        bottleData = await fetchBottleByName(bottleName); // Fetch by name
      }

      if (bottleData && bottleData.length > 0) {
        setBottles(bottleData);
      } else {
        setError('No bottle found with the given information.');
      }
    } catch (err) {
      setError('Failed to fetch the bottle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-4">
        <input
          type="number"
          value={bottleId !== null ? bottleId : ''} // Ensure the field doesn't show "null"
          onChange={(e) => setBottleId(Number(e.target.value))}
          placeholder="Enter Bottle ID"
          className="border border-gray-300 rounded-lg px-3 py-1 mr-4 w-40"
        />

        <span className="mx-4">or</span>

        <input
          type="text"
          value={bottleName}
          onChange={(e) => setBottleName(e.target.value)}
          placeholder="Enter Bottle Name"
          className="border border-gray-300 rounded-lg px-3 py-1 w-40"
        />

        <button
          onClick={handleFetchBottle}
          className="bg-blue-600 text-white px-4 py-2 ml-4 rounded-lg hover:bg-blue-700"
        >
          Fetch Bottle
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {/* If bottles exist, render the first bottle */}
      {bottles && bottles.length > 0 && (
        <div className="mt-8">
          {bottles.map((bottle) => (
            <BottleDetails
              key={bottle.id}
              name={bottle.name}
              material={bottle.material}
              capacity_ml={bottle.capacity_ml}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FetchBottleButton;
