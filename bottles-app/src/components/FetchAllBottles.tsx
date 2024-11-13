// bottles-app/src/components/FetchAllBottles.tsx

import { useState, useEffect } from 'react';
import BottleDetails from './BottleDetails';
import LoadingSpinner from './LoadingSpinner';
import SearchBar from './SearchBar';
import { fetchAllBottles, deleteBottle, Bottle } from '../services/bottleService';

const FetchAllBottles = () => {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [filteredBottles, setFilteredBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch bottles on component mount
  useEffect(() => {
    const fetchBottles = async () => {
      setLoading(true);
      setError(null);

      try {
        const allBottles = await fetchAllBottles();
        setBottles(allBottles);
        setFilteredBottles(allBottles);
      } catch (err) {
        setError('Failed to fetch bottles');
      } finally {
        setLoading(false);
      }
    };

    fetchBottles();
  }, []);

  // Filter bottles based on search query
  useEffect(() => {
    const regex = new RegExp(searchQuery, 'i');
    const filtered = bottles.filter((bottle) => regex.test(bottle.name) || regex.test(bottle.brand || '') || regex.test(bottle.flavor_profile || ''));
    setFilteredBottles(filtered);
  }, [searchQuery, bottles]);

  // Delete a specific bottle and update the displayed lists
  const handleDelete = async (id: number) => {
    try {
      await deleteBottle(id);
      setBottles((prevBottles) => prevBottles.filter((bottle) => bottle.id !== id));
      setFilteredBottles((prevFiltered) => prevFiltered.filter((bottle) => bottle.id !== id));
    } catch {
      setError('Failed to delete the bottle');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">All Bottles</h2>

      {/* Search Bar for filtering bottles */}
      <div className="w-full mb-4">
        <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="text-red-500 mt-4">{error}</div>}

      {/* Display list of filtered bottles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
        {filteredBottles.length > 0 ? (
          filteredBottles.map((bottle) => (
            <BottleDetails
              key={bottle.id}
              id={bottle.id}
              name={bottle.name}
              brand={bottle.brand}  // Added brand
              flavor_profile={bottle.flavor_profile}  // Added flavor profile
              capacity_ml={bottle.capacity_ml}
              onDelete={() => handleDelete(bottle.id)}
            />
          ))
        ) : (
          <p className="text-center col-span-full">No bottles found.</p>
        )}
      </div>
    </div>
  );
};

export default FetchAllBottles;