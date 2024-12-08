import { useState, useEffect } from 'react';
import { fetchAllSpiritTypes, addSpiritType, SpiritType } from '../services/spiritTypeService';
import AddSpiritModal from './AddSpiritModal';

interface SpiritTypeSelectProps {
  selectedSpiritType: SpiritType | null;
  onSpiritTypeChange: (spiritType: SpiritType | null) => void;
}

const SpiritTypeSelect = ({ selectedSpiritType, onSpiritTypeChange }: SpiritTypeSelectProps) => {
  const [spiritTypes, setSpiritTypes] = useState<SpiritType[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch spirit types on component mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await fetchAllSpiritTypes();
        setSpiritTypes(types);
      } catch (error) {
        console.error('Error fetching spirit types:', error);
      }
    };
    fetchTypes();
  }, []);

  const handleAddSpiritType = async (name: string) => {
    try {
      const newSpiritType = await addSpiritType({ name });
      setSpiritTypes((prev) => [...prev, newSpiritType]);
      onSpiritTypeChange(newSpiritType); // Automatically select the newly added spirit
    } catch (error) {
      console.error('Error adding spirit type:', error);
    }
  };

  return (
    <>
      <select
        value={selectedSpiritType?.id || ''}
        onChange={(e) => {
          if (e.target.value === 'add') {
            setShowModal(true);
          } else {
            const selectedType = e.target.value
              ? { id: Number(e.target.value), name: e.target.options[e.target.selectedIndex].text }
              : null;
            onSpiritTypeChange(selectedType);
          }
        }}
        className="border border-gray-300 rounded-lg px-3 py-1 my-2 w-64"
      >
        <option value="">Select Spirit Type</option>
        {spiritTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
        <option value="add">+ Add Spirit</option>
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
