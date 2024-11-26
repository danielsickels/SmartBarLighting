// bottles-app/src/components/BottleDetails.tsx

import { Bottle } from '../services/bottleService';
import { useState } from 'react';

interface BottleDetailsProps extends Omit<Bottle, 'spirit_type'> { // Omit spirit_type from BottleDetailsProps
  onDelete: () => Promise<void>; // Ensure onDelete returns a Promise
}

const BottleDetails = ({ id, name, brand, flavor_profile, capacity_ml, onDelete }: BottleDetailsProps) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null); // Track delete errors

  const handleDelete = async () => {
    setDeleting(true);
    setError(null); // Clear any previous errors
    try {
      await onDelete(); // Await onDelete to complete
    } catch {
      setError('Failed to delete bottle'); // Show error only if deletion actually fails
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-md flex flex-col items-start w-full max-w-md mb-4">
      {/* Bottle Information */}
      <div className="flex-grow">
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Brand:</strong> {brand}</p>
        <p><strong>Flavor Profile:</strong> {flavor_profile}</p>
        <p><strong>Capacity:</strong> {capacity_ml} ml</p>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 mt-2">{error}</div>}

      {/* Delete Button at the Bottom */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700 mt-4 w-full"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
};

export default BottleDetails;
