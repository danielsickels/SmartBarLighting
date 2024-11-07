import { useState, useEffect } from 'react';
import BottleDetails from './BottleDetails';
import LoadingSpinner from './LoadingSpinner';
import SearchBar from './SearchBar';
import { fetchAllBottles, deleteBottle, Bottle } from '../services/bottleService';

const FetchAllBottlesButton = () => {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [filteredBottles, setFilteredBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBottles, setShowBottles] = useState(false);

  // Toggle function to fetch and display bottles or hide them
  const handleToggleBottles = async () => {
    if (showBottles) {
      // If bottles are currently shown, hide them
      setShowBottles(false);
      setBottles([]);
      setFilteredBottles([]);
    } else {
      // Fetch bottles if not currently shown
      setLoading(true);
      setError(null);

      try {
        const allBottles = await fetchAllBottles();
        setBottles(allBottles);
        setFilteredBottles(allBottles); // Set filtered list initially to all bottles
        setShowBottles(true); // Show bottles after fetching
      } catch (err) {
        setError('Failed to fetch bottles');
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete a specific bottle and update the displayed lists
  const handleDelete = async (id: number) => {
    try {
      await deleteBottle(id);
      setBottles((prevBottles) => prevBottles.filter(bottle => bottle.id !== id));
      setFilteredBottles((prevFiltered) => prevFiltered.filter(bottle => bottle.id !== id));
    } catch (error) {
      setError('Failed to delete the bottle');
    }
  };

  // Update the filtered list of bottles based on the search query with regex
  useEffect(() => {
    const regex = new RegExp(searchQuery, 'i'); // Create a case-insensitive regex
    const filtered = bottles.filter((bottle) => regex.test(bottle.name));
    setFilteredBottles(filtered);
  }, [searchQuery, bottles]);

  return (
    <div className="flex flex-col items-center">
      {/* Toggle button for fetching or hiding bottles */}
      <button
        onClick={handleToggleBottles}
        className={`px-4 py-2 mb-4 rounded-lg ${showBottles ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
      >
        {showBottles ? 'Hide Bottles' : 'Fetch All Bottles'}
      </button>

      {/* Search Bar for filtering bottles */}
      {showBottles && (
        <div className="w-full mb-4">
          <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      )}

      {loading && <LoadingSpinner />}

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {/* Display list of filtered bottles */}
      {showBottles && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
          {filteredBottles.length > 0 ? (
            filteredBottles.map((bottle) => (
              <BottleDetails
                key={bottle.id}
                id={bottle.id}
                name={bottle.name}
                material={bottle.material}
                capacity_ml={bottle.capacity_ml}
                onDelete={() => handleDelete(bottle.id)} // Pass delete handler
              />
            ))
          ) : (
            <p className="text-center col-span-full">No bottles found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FetchAllBottlesButton;
