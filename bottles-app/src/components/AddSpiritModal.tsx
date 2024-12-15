import { useState } from "react";

interface AddSpiritModalProps {
  onClose: () => void;
  onAdd: (newSpiritName: string) => void; // Accept only the name of the spirit
}

const AddSpiritModal = ({ onClose, onAdd }: AddSpiritModalProps) => {
  const [spiritName, setSpiritName] = useState("");

  const handleAdd = () => {
    if (spiritName.trim()) {
      onAdd(spiritName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-[0_0_15px_rgba(255,191,0,0.5)]">
        <h2 className="text-lg font-bold text-amber-500 mb-4 text-center">
          Add New Spirit
        </h2>
        <input
          type="text"
          value={spiritName}
          onChange={(e) => setSpiritName(e.target.value)}
          placeholder="Enter Spirit Name"
          className="border border-amber-500 rounded-lg px-3 py-2 w-full bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
        />
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)] w-24"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_7px_2px_rgba(52,211,153,0.8)] w-24"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSpiritModal;
