import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import BottleDetails from "./BottleDetails";
import LoadingSpinner from "./LoadingSpinner";
import SearchBar from "./SearchBar";
import ConfirmDialog from "./ConfirmDialog";
import SpiritFilterButtons from "./SpiritFilterButtons";
import {
  fetchAllBottles,
  deleteBottle,
  Bottle,
} from "../services/bottleService";

interface FetchAllBottlesProps {
  onEdit?: (bottle: Bottle) => void;
}

const FetchAllBottles = ({ onEdit }: FetchAllBottlesProps) => {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [filteredBottles, setFilteredBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpiritIds, setSelectedSpiritIds] = useState<number[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bottleId: number | null;
    bottleName: string;
  }>({
    isOpen: false,
    bottleId: null,
    bottleName: "",
  });

  // Extract unique spirit types from bottles
  const availableSpiritTypes = useMemo(() => {
    const spiritMap = new Map();
    bottles.forEach((bottle) => {
      if (bottle.spirit_type) {
        spiritMap.set(bottle.spirit_type.id, bottle.spirit_type);
      }
    });
    return Array.from(spiritMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [bottles]);

  useEffect(() => {
    const fetchBottles = async () => {
      setLoading(true);
      setError(null);

      try {
        const allBottles = await fetchAllBottles();
        setBottles(allBottles);
        setFilteredBottles(allBottles);
      } catch {
        setError("Failed to fetch bottles");
      } finally {
        setLoading(false);
      }
    };

    fetchBottles();
  }, []);

  useEffect(() => {
    const regex = new RegExp(searchQuery, "i");
    const filtered = bottles.filter((bottle) => {
      // Search filter
      const matchesSearch =
        regex.test(bottle.name) ||
        regex.test(bottle.brand || "") ||
        regex.test(bottle.flavor_profile || "") ||
        regex.test(bottle.spirit_type?.name || "");

      // Spirit type filter
      const matchesSpirit =
        selectedSpiritIds.length === 0 ||
        (bottle.spirit_type && selectedSpiritIds.includes(bottle.spirit_type.id));

      return matchesSearch && matchesSpirit;
    });
    setFilteredBottles(filtered);
  }, [searchQuery, bottles, selectedSpiritIds]);

  const handleToggleSpirit = (spiritId: number) => {
    setSelectedSpiritIds((prev) =>
      prev.includes(spiritId)
        ? prev.filter((id) => id !== spiritId)
        : [...prev, spiritId]
    );
  };

  // Show confirmation dialog before deleting
  const handleDeleteClick = (id: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      bottleId: id,
      bottleName: name,
    });
  };

  // Delete a specific bottle and update the displayed lists
  const handleDeleteConfirm = async () => {
    const bottleId = confirmDialog.bottleId;
    if (!bottleId) return;

    setConfirmDialog({ isOpen: false, bottleId: null, bottleName: "" });
    const toastId = toast.loading("Deleting bottle...");

    try {
      await deleteBottle(bottleId);
      setBottles((prevBottles) =>
        prevBottles.filter((bottle) => bottle.id !== bottleId)
      );
      setFilteredBottles((prevFiltered) =>
        prevFiltered.filter((bottle) => bottle.id !== bottleId)
      );
      toast.success("Bottle deleted successfully", { id: toastId });
    } catch {
      toast.error("Failed to delete the bottle", { id: toastId });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, bottleId: null, bottleName: "" });
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold mt-6 mb-8 text-center text-amber-500">
        <span className="glow-charcoal">All Bottles</span>
      </h2>

      {/* Search Bar for filtering bottles */}
      <div className="w-full mb-4">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search bottles..."
        />
      </div>

      {/* Spirit Type Filter Buttons */}
      <SpiritFilterButtons
        spiritTypes={availableSpiritTypes}
        selectedSpiritIds={selectedSpiritIds}
        onToggleSpirit={handleToggleSpirit}
      />

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
              brand={bottle.brand || "N/A"} // Display 'N/A' if brand is missing
              flavor_profile={bottle.flavor_profile || "N/A"} // Display 'N/A' if flavor profile is missing
              spirit_type={bottle.spirit_type?.name || "Unknown"} // Display spirit type name or 'Unknown'
              capacity_ml={bottle.capacity_ml}
              onEdit={() => onEdit?.(bottle)}
              onDelete={() => handleDeleteClick(bottle.id, bottle.name)}
            />
          ))
        ) : (
          <p className="text-2xl font-bold text-center col-span-full text-amber-600">
            <span className="glow-charcoal">No Bottles Found</span>
          </p>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Bottle?"
        message={`Are you sure you want to delete "${confirmDialog.bottleName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default FetchAllBottles;
