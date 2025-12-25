import { useState, useEffect } from "react";
import {
  fetchAllSpiritTypes,
  addSpiritType,
  SpiritType,
} from "../services/spiritTypeService";
import AddSpiritModal from "./AddSpiritModal";

interface SpiritTypeSelectProps {
  selectedSpiritType: SpiritType | null;
  onSpiritTypeChange: (spiritType: SpiritType | null) => void;
}

const SpiritTypeSelect = ({
  selectedSpiritType,
  onSpiritTypeChange,
}: SpiritTypeSelectProps) => {
  const [spiritTypes, setSpiritTypes] = useState<SpiritType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await fetchAllSpiritTypes();
        setSpiritTypes(types);
      } catch (error) {
        console.error("Error fetching spirit types:", error);
      }
    };
    fetchTypes();
  }, []);

  const handleAddSpiritType = async (name: string) => {
    try {
      setErrorMessage(null); // Clear previous errors
      const newSpiritType = await addSpiritType({ name });
      setSpiritTypes((prev) => [...prev, newSpiritType]);
      onSpiritTypeChange(newSpiritType);
      setShowModal(false); // Close modal on success
    } catch (error) {
      console.error("Error adding spirit type:", error);
      setErrorMessage(`Failed to add spirit type. "${name}" already exists.`);
      // Don't close modal so user can try again
    }
  };

  return (
    <>
      <select
        value={selectedSpiritType?.id || ""}
        onChange={(e) => {
          if (e.target.value === "add") {
            setShowModal(true);
            setErrorMessage(null);
          } else {
            const selectedType = e.target.value
              ? {
                  id: Number(e.target.value),
                  name: e.target.options[e.target.selectedIndex].text,
                }
              : null;
            onSpiritTypeChange(selectedType);
          }
        }}
        className="input-amber-select"
      >
        <option value="" className="text-gray-400">
          Select Spirit Type
        </option>
        {spiritTypes.map((type) => (
          <option
            key={type.id}
            value={type.id}
            className="text-white bg-gray-900"
          >
            {type.name}
          </option>
        ))}
        <option value="add" className="text-emerald-500 bg-gray-900">
          + Add Spirit
        </option>
      </select>

      {showModal && (
        <AddSpiritModal
          onClose={() => {
            setShowModal(false);
            setErrorMessage(null);
          }}
          onAdd={handleAddSpiritType}
          errorMessage={errorMessage}
        />
      )}
    </>
  );
};

export default SpiritTypeSelect;
