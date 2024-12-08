import { useState } from 'react';
import { addBottle } from '../services/bottleService';
import SpiritTypeSelect from './SpiritTypeSelect';
import { SpiritType } from '../services/spiritTypeService';

const AddBottleForm = () => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [flavorProfile, setFlavorProfile] = useState('');
  const [spiritType, setSpiritType] = useState<SpiritType | null>(null);
  const [capacity, setCapacity] = useState<number | ''>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddBottle = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name || !spiritType || !capacity) {
      setErrorMessage('Please fill all required fields');
      return;
    }

    const newBottle = {
      name,
      brand: brand || '',
      flavor_profile: flavorProfile || '',
      spirit_type_id: spiritType.id,
      capacity_ml: Number(capacity),
    };

    try {
      await addBottle(newBottle);
      setSuccessMessage('Bottle added successfully');
      setName('');
      setBrand('');
      setFlavorProfile('');
      setSpiritType(null);
      setCapacity('');
    } catch (error) {
      console.error('Error adding bottle:', error);
      setErrorMessage('Failed to add bottle');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-10 text-center">Add New Bottle</h2>
      {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}
      {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter Bottle Name"
        className="border border-gray-300 rounded-lg px-4 py-2 my-2 w-full"
      />
      <input
        type="text"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="Enter Brand"
        className="border border-gray-300 rounded-lg px-4 py-2 my-2 w-full"
      />
      <input
        type="text"
        value={flavorProfile}
        onChange={(e) => setFlavorProfile(e.target.value)}
        placeholder="Enter Flavor Profile"
        className="border border-gray-300 rounded-lg px-4 py-2 my-2 w-full"
      />
      <SpiritTypeSelect
        selectedSpiritType={spiritType}
        onSpiritTypeChange={setSpiritType}
      />
      <input
        type="number"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : '')}
        placeholder="Enter Capacity (ml)"
        className="border border-gray-300 rounded-lg px-4 py-2 my-2 w-full"
      />
      <button
        onClick={handleAddBottle}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-blue-700"
      >
        Confirm
      </button>
    </div>
  );
};

export default AddBottleForm;
