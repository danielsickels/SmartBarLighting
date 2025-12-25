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
    <div className="card-amber flex flex-col w-full max-w-md mb-4 h-full">
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
