import { Bottle } from "../services/bottleService";
import { useState } from "react";

interface BottleDetailsProps
  extends Omit<Bottle, "spirit_type" | "spirit_type_id"> {
  spirit_type: string;
  onDelete: () => Promise<void>;
}

const BottleDetails = ({
  name,
  brand,
  flavor_profile,
  capacity_ml,
  spirit_type,
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
      setError("Failed to delete bottle");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border border-amber-500 p-4 rounded-lg bg-gray-900 flex flex-col items-start w-full max-w-md mb-4 shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]">
      <div className="flex-grow text-white">
        <p>
          <strong className="text-amber-600">Name:</strong>{" "}
          <span className="text-amber-300">{name}</span>
        </p>
        <p>
          <strong className="text-amber-600">Brand:</strong>{" "}
          <span className="text-amber-300">{brand || "N/A"}</span>
        </p>
        <p>
          <strong className="text-amber-600">Flavor Profile:</strong>{" "}
          <span className="text-amber-300">{flavor_profile || "N/A"}</span>
        </p>
        <p>
          <strong className="text-amber-600">Spirit Type:</strong>{" "}
          <span className="text-amber-300">{spirit_type || "Unknown"}</span>
        </p>
        <p>
          <strong className="text-amber-600">Capacity:</strong>{" "}
          <span className="text-amber-300">{capacity_ml} ml</span>
        </p>
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="mt-2 bg-rose-700 text-white px-3 py-1 text-sm rounded hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
};

export default BottleDetails;
