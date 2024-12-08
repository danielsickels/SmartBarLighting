import { Bottle } from '../services/bottleService';
import { useState } from 'react';

interface BottleDetailsProps extends Omit<Bottle, 'spirit_type' | 'spirit_type_id'> {
  spirit_type: string;
  onDelete: () => Promise<void>;
}

const BottleDetails = ({
  id,
  name,
  brand,
  flavor_profile,
  capacity_ml,
  spirit_type, // Added for display
  onDelete,
}: BottleDetailsProps) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onDelete();
    } catch {
      setError('Failed to delete bottle');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-md flex flex-col items-start w-full max-w-md mb-4">
      <div className="flex-grow">
        <p>
          <strong>Name:</strong> {name}
        </p>
        <p>
          <strong>Brand:</strong> {brand || 'N/A'}
        </p>
        <p>
          <strong>Flavor Profile:</strong> {flavor_profile || 'N/A'}
        </p>
        <p>
          <strong>Spirit Type:</strong> {spirit_type || 'Unknown'}
        </p>
        <p>
          <strong>Capacity:</strong> {capacity_ml} ml
        </p>
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700 mt-4 w-full"
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
};

export default BottleDetails;
