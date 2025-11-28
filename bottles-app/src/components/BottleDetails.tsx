import { Bottle } from "../services/bottleService";
import { useState } from "react";

interface BottleDetailsProps
  extends Omit<Bottle, "spirit_type" | "spirit_type_id"> {
  spirit_type: string;
  onDelete: () => void;
  onEdit?: () => void;
}

const BottleDetails = ({
  name,
  brand,
  flavor_profile,
  capacity_ml,
  spirit_type,
  onDelete,
  onEdit,
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

  const truncatedName = name.length > 64 ? name.substring(0, 64) + "..." : name;

  return (
    <div className="border border-amber-500 p-4 rounded-lg bg-gray-900 flex flex-col w-full max-w-md mb-4 shadow-[0_0_10px_2px_rgba(255,191,0,0.5)] h-full">
      <div className="flex-1 text-white w-full">
        <div className="flex justify-center mb-3">
          <h3 className="font-bold text-lg text-amber-300 text-center break-all px-2">
            {truncatedName}
          </h3>
        </div>
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

      <div className="flex gap-2 mt-2 w-full">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 text-amber-500 px-3 py-1 text-sm font-bold rounded border border-amber-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.08))',
              boxShadow: '0 0 8px 1px rgba(153, 102, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 15px 2px rgba(153, 102, 0, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 8px 1px rgba(153, 102, 0, 0.2)';
            }}
          >
            Edit
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 text-rose-400 px-3 py-1 text-sm font-bold rounded border border-rose-400/30 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.05), rgba(225, 29, 72, 0.08))',
            boxShadow: '0 0 8px 1px rgba(225, 29, 72, 0.2)',
          }}
          onMouseEnter={(e) => {
            if (!deleting) {
              e.currentTarget.style.boxShadow = '0 0 15px 2px rgba(225, 29, 72, 0.35)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 8px 1px rgba(225, 29, 72, 0.2)';
          }}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default BottleDetails;
