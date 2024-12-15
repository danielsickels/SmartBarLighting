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
      const newSpiritType = await addSpiritType({ name });
      setSpiritTypes((prev) => [...prev, newSpiritType]);
      onSpiritTypeChange(newSpiritType);
    } catch (error) {
      console.error("Error adding spirit type:", error);
    }
  };

  return (
    <>
      <select
        value={selectedSpiritType?.id || ""}
        onChange={(e) => {
          if (e.target.value === "add") {
            setShowModal(true);
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
        className="border border-amber-500 rounded-lg px-3 py-2 my-2 w-64 bg-gray-900 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
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
          onClose={() => setShowModal(false)}
          onAdd={handleAddSpiritType}
        />
      )}
    </>
  );
};

export default SpiritTypeSelect;
