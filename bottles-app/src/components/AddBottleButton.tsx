import { useState } from 'react';
import { Bottle } from '../services/bottleService'; // Assuming you already have the Bottle type
import { addBottle } from '../services/bottleService'; // You will define this service function

const AddBottleButton = () => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [material, setMaterial] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');

  const handleAddBottle = async () => {
    if (!name || !material || !capacity) {
      alert('Please fill all fields');
      return;
    }

    const newBottle: Partial<Bottle> = {
      name,
      material,
      capacity_ml: Number(capacity),
    };

    try {
      await addBottle(newBottle); // Call the service function to add the bottle
      alert('Bottle added successfully');
      // Reset fields after adding
      setName('');
      setMaterial('');
      setCapacity('');
      setShowForm(false); // Hide the form after confirming
    } catch (error) {
      alert('Failed to add bottle');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Add Bottle
        </button>
      ) : (
        <div className="flex flex-col items-center">
          {/* Input fields */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Bottle Name"
            className="border border-gray-300 rounded-lg px-3 py-1 my-2 w-64"
          />
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Enter Material"
            className="border border-gray-300 rounded-lg px-3 py-1 my-2 w-64"
          />
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : '')}
            placeholder="Enter Capacity (ml)"
            className="border border-gray-300 rounded-lg px-3 py-1 my-2 w-64"
          />
          <div className="flex space-x-4 mt-4">
            {/* Confirm button */}
            <button
              onClick={handleAddBottle}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Confirm
            </button>
            {/* Cancel button to hide the form */}
            <button
              onClick={() => setShowForm(false)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBottleButton;
