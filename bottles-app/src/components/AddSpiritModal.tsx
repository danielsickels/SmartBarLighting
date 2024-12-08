import { useState } from 'react';

interface AddSpiritModalProps {
  onClose: () => void;
  onAdd: (newSpiritName: string) => void; // Accept only the name of the spirit
}

const AddSpiritModal = ({ onClose, onAdd }: AddSpiritModalProps) => {
  const [spiritName, setSpiritName] = useState('');

  const handleAdd = () => {
    if (spiritName.trim()) {
      onAdd(spiritName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Add New Spirit</h2>
        <input
          type="text"
          value={spiritName}
          onChange={(e) => setSpiritName(e.target.value)}
          placeholder="Enter Spirit Name"
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSpiritModal;
