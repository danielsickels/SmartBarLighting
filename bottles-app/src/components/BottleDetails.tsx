import { useState } from "react";
import { Bottle } from "../services/bottleService";
import ActionButton from "./ActionButton";

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
  image_url,
  barcode,
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
  
  // Determine if name is long enough to need smaller text (likely 3+ lines)
  // Heuristic: if word count > 5 or character count > 35, use smaller text
  const wordCount = truncatedName.split(/\s+/).length;
  const isLongName = wordCount > 5 || truncatedName.length > 35;

  return (
    <div className="card-amber flex flex-col w-full max-w-md mb-4 h-full">
      {/* Bottle Image - Centered at top with restricted size */}
      {image_url && (
        <div className="flex justify-center mb-3 -mt-1">
          <div className="w-24 h-24 rounded-lg overflow-hidden border border-amber-500/30 bg-gray-800 flex-shrink-0">
            <img
              src={image_url}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="flex-1 text-white w-full">
        <div className="flex justify-center mb-3">
          <h3 
            className={`font-bold text-amber-300 text-center break-words px-2 ${
              isLongName ? "text-base" : "text-lg"
            }`}
          >
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
        
        {/* Barcode - Below capacity */}
        <p className="flex items-center gap-1.5 mt-1">
          <svg 
            className="w-3.5 h-3.5 text-amber-600" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z"/>
          </svg>
          {barcode ? (
            <span className="text-amber-300/70 font-mono text-sm">{barcode}</span>
          ) : (
            <span className="text-gray-500 italic text-sm">none</span>
          )}
        </p>
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      <div className="flex gap-2 mt-3 w-full">
        {onEdit && (
          <ActionButton onClick={onEdit} variant="edit">
            Edit
          </ActionButton>
        )}
        <ActionButton onClick={handleDelete} disabled={deleting} variant="delete">
          {deleting ? "Deleting..." : "Delete"}
        </ActionButton>
      </div>
    </div>
  );
};

export default BottleDetails;
