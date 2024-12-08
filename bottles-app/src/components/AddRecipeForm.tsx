import { useState, useEffect } from 'react';
import { addRecipe } from '../services/recipeService';
import AddSpiritModal from './AddSpiritModal'; // Import the modal component
import { fetchAllSpiritTypes, SpiritType } from '../services/spiritTypeService';

const AddRecipeForm = () => {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedSpirits, setSelectedSpirits] = useState<SpiritType[]>([]); // Selected spirits for the recipe
  const [customIngredients, setCustomIngredients] = useState<{ name: string; measurement: string }[]>([]);
  const [newCustomIngredient, setNewCustomIngredient] = useState('');
  const [spiritTypes, setSpiritTypes] = useState<SpiritType[]>([]); // All available spirit types
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSpiritModal, setShowSpiritModal] = useState(false); // Modal visibility

  useEffect(() => {
    const fetchSpiritTypes = async () => {
      try {
        const spirits = await fetchAllSpiritTypes();
        setSpiritTypes(spirits);
      } catch (error) {
        console.error('Error fetching spirit types:', error);
        setErrorMessage('Error fetching spirit types.');
      }
    };

    fetchSpiritTypes();
  }, []);

  const handleAddCustomIngredient = () => {
    if (newCustomIngredient.trim()) {
      setCustomIngredients((prev) => [...prev, { name: newCustomIngredient.trim(), measurement: '' }]);
      setNewCustomIngredient('');
    }
  };

  const handleRemoveCustomIngredient = (ingredientName: string) => {
    setCustomIngredients((prev) => prev.filter((item) => item.name !== ingredientName));
  };

  const handleAddSpiritType = (newSpiritName: string) => {
    const newSpirit: SpiritType = { id: Date.now(), name: newSpiritName }; 
    setSpiritTypes((prev) => [...prev, newSpirit]);
    setSelectedSpirits((prev) => [...prev, newSpirit]);
    setShowSpiritModal(false);
  };  

  const handleToggleSpiritSelection = (spirit: SpiritType) => {
    setSelectedSpirits((prev) =>
      prev.some((s) => s.id === spirit.id)
        ? prev.filter((s) => s.id !== spirit.id) 
        : [...prev, spirit] 
    );
  };

  const handleAddRecipe = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name || !instructions || (selectedSpirits.length === 0 && customIngredients.length === 0)) {
      setErrorMessage('Please fill all fields and select at least one spirit type.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      instructions,
      ingredients: customIngredients.map((item) => `${item.name} - ${item.measurement}`).join(', '),
      spirit_type_ids: selectedSpirits.map((spirit) => spirit.id), 
    };

    try {
      const response = await addRecipe(payload);
      console.log('Response from server:', response);
      setSuccessMessage('Recipe added successfully!');
      setName('');
      setInstructions('');
      setSelectedSpirits([]);
      setCustomIngredients([]);
    } catch (error) {
      console.error('Error adding recipe:', error);
      setErrorMessage('Error adding recipe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Add New Recipe</h2>
      {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}
      {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter Recipe Name"
        className="border border-gray-300 rounded-lg px-3 py-1 my-2 w-64"
      />
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Enter Instructions"
        className="border border-gray-300 rounded-lg px-3 py-1 my-2 w-64 h-24"
      />

      {/* Spirit type selection */}
      <div className="w-64 border border-gray-300 rounded-lg px-3 py-1 my-2">
        <p className="font-bold">Select Spirit Types:</p>
        <div className="max-h-48 overflow-y-auto">
          {spiritTypes.map((spirit) => (
            <div key={spirit.id} className="flex items-center mb-1">
              <input
                type="checkbox"
                checked={selectedSpirits.some((s) => s.id === spirit.id)}
                onChange={() => handleToggleSpiritSelection(spirit)}
              />
              <label className="ml-2">{spirit.name}</label>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowSpiritModal(true)}
          className="bg-blue-500 text-white px-2 py-1 rounded-lg mt-2"
        >
          + Add Spirit Type
        </button>
      </div>

      {/* Custom ingredient input */}
      <div className="w-64 border border-gray-300 rounded-lg px-3 py-1 my-2">
        <p className="font-bold">Add Custom Ingredients:</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newCustomIngredient}
            onChange={(e) => setNewCustomIngredient(e.target.value)}
            placeholder="Enter custom ingredient"
            className="border border-gray-300 rounded-lg px-2 py-1 flex-grow"
          />
          <button
            onClick={handleAddCustomIngredient}
            className="bg-green-500 text-white px-2 py-1 rounded-lg"
          >
            Add
          </button>
        </div>
        <ul className="mt-2">
          {customIngredients.map((item, index) => (
            <li key={index} className="flex justify-between items-center">
              <div className="flex items-center flex-grow">
                {item.name}
                <input
                  type="text"
                  placeholder="Measurement"
                  className="border border-gray-300 rounded-lg px-2 py-1 ml-2 w-24"
                  value={item.measurement}
                  onChange={(e) =>
                    setCustomIngredients((prev) =>
                      prev.map((ingredient) =>
                        ingredient.name === item.name
                          ? { ...ingredient, measurement: e.target.value }
                          : ingredient
                      )
                    )
                  }
                />
              </div>
              <button
                onClick={() => handleRemoveCustomIngredient(item.name)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleAddRecipe}
        className={`bg-blue-600 text-white px-4 py-2 mt-4 rounded-lg ${
          submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Add Recipe'}
      </button>

      {showSpiritModal && (
        <AddSpiritModal
          onClose={() => setShowSpiritModal(false)}
          onAdd={handleAddSpiritType}
        />
      )}
    </div>
  );
};

export default AddRecipeForm;
