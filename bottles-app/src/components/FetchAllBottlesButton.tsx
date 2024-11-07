import { useState } from 'react';
import BottleDetails from './BottleDetails';
import LoadingSpinner from './LoadingSpinner';
import { fetchAllBottles, deleteBottle, Bottle } from '../services/bottleService';

const FetchAllBottlesButton = () => {
  const [bottles, setBottles] = useState<Bottle[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false); // Track visibility of the fetched bottles

  const handleFetchAllBottles = async () => {
    if (isVisible) {
      // If already visible, toggle off to close
      setIsVisible(false);
      setBottles(null); // Clear bottles from state
    } else {
      // Fetch bottles and display them
      setLoading(true);
      setError(null);
      setIsVisible(true);

      try {
        const allBottles = await fetchAllBottles();
        setBottles(allBottles);
      } catch (err) {
        setError('Failed to fetch bottles');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBottle(id);
      setBottles((prevBottles) => prevBottles?.filter(bottle => bottle.id !== id) || null);
    } catch (error) {
      setError('Failed to delete the bottle');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleFetchAllBottles}
        className="bg-green-600 text-white px-4 py-2 mb-4 rounded-lg hover:bg-green-700"
      >
        {isVisible ? 'Close' : 'Fetch All Bottles'}
      </button>

      {loading && <LoadingSpinner />}

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {isVisible && bottles && bottles.length > 0 && (
        <div className="mt-8">
          {bottles.map((bottle) => (
            <BottleDetails
              key={bottle.id}
              id={bottle.id}
              name={bottle.name}
              material={bottle.material}
              capacity_ml={bottle.capacity_ml}
              onDelete={() => handleDelete(bottle.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FetchAllBottlesButton;
