import { useState, useEffect } from 'react';
import { addRecipe } from '../services/recipeService';
import { fetchAllSpiritTypes, SpiritType } from '../services/spiritTypeService';

const AddRecipeForm = () => {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [spiritIngredients, setSpiritIngredients] = useState<{ spirit: SpiritType; measurement: string }[]>([]); // Spirits with measurements
  const [customIngredients, setCustomIngredients] = useState<{ name: string; measurement: string }[]>([]); // Custom ingredients with measurements
  const [newCustomIngredient, setNewCustomIngredient] = useState(''); // For adding new custom ingredients
  const [allSpiritTypes, setAllSpiritTypes] = useState<SpiritType[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSpirits = async () => {
      try {
        const spirits = await fetchAllSpiritTypes();
        setAllSpiritTypes(spirits);
      } catch (error) {
        console.error('Error fetching spirits:', error);
        setErrorMessage('Failed to fetch spirit types.');
      }
    };

    fetchSpirits();
  }, []);

  const handleAddRecipe = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name || !instructions || (spiritIngredients.length === 0 && customIngredients.length === 0)) {
      setErrorMessage('Please fill all fields and add at least one ingredient.');
      return;
    }

    setSubmitting(true);

    const spiritStrings = spiritIngredients.map((item) => `${item.spirit.name} - ${item.measurement}`);
    const customStrings = customIngredients.map((item) => `${item.name} - ${item.measurement}`);
    const payload = {
      name,
      instructions,
      ingredients: [...spiritStrings, ...customStrings].join(', '),
      spirit_type_ids: spiritIngredients.map((item) => item.spirit.id),
    };

    try {
      await addRecipe(payload);
      setSuccessMessage('Recipe added successfully!');
      setName('');
      setInstructions('');
      setSpiritIngredients([]);
      setCustomIngredients([]);
    } catch (error) {
      console.error('Error adding recipe:', error);
      setErrorMessage('Error adding recipe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSpirit = (spirit: SpiritType) => {
    const exists = spiritIngredients.some((item) => item.spirit.id === spirit.id);
    if (exists) {
      setSpiritIngredients((prev) => prev.filter((item) => item.spirit.id !== spirit.id));
    } else {
      setSpiritIngredients((prev) => [...prev, { spirit, measurement: '' }]);
    }
  };

  const updateSpiritMeasurement = (spiritId: number, measurement: string) => {
    setSpiritIngredients((prev) =>
      prev.map((item) =>
        item.spirit.id === spiritId ? { ...item, measurement } : item
      )
    );
  };

  const handleAddCustomIngredient = () => {
    if (newCustomIngredient.trim()) {
      setCustomIngredients((prev) => [...prev, { name: newCustomIngredient.trim(), measurement: '' }]);
      setNewCustomIngredient('');
    }
  };

  const handleRemoveCustomIngredient = (ingredientName: string) => {
    setCustomIngredients((prev) => prev.filter((item) => item.name !== ingredientName));
  };

  const updateCustomMeasurement = (ingredientName: string, measurement: string) => {
    setCustomIngredients((prev) =>
      prev.map((item) =>
        item.name === ingredientName ? { ...item, measurement } : item
      )
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-10 text-center">Add New Recipe</h2>
      {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}
      {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter Recipe Name"
        className="border border-gray-300 rounded-lg px-4 py-2 my-2 w-full"
      />
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Enter Instructions"
        className="border border-gray-300 rounded-lg px-4 py-2 my-2 w-full h-24"
      />

      <div className="w-full border border-gray-300 rounded-lg px-4 py-2 my-4">
        <p className="font-bold">Select Spirits:</p>
        <div className="max-h-48 overflow-y-auto">
          {allSpiritTypes.map((spirit) => {
            const isSelected = spiritIngredients.some((item) => item.spirit.id === spirit.id);
            return (
              <div key={spirit.id} className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSpirit(spirit)}
                />
                <label className="ml-2 flex-grow">{spirit.name}</label>
                {isSelected && (
                  <input
                    type="text"
                    placeholder="Measurement"
                    className="border border-gray-300 rounded-lg ml-2"
                    value={spiritIngredients.find((item) => item.spirit.id === spirit.id)?.measurement || ''}
                    onChange={(e) => updateSpiritMeasurement(spirit.id, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full border border-gray-300 rounded-lg px-4 py-2 my-4">
        <p className="font-bold">Add Custom Ingredients:</p>
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newCustomIngredient}
            onChange={(e) => setNewCustomIngredient(e.target.value)}
            placeholder="Ingredient Name"
            className="border border-gray-300 rounded-lg px-2 py-1 flex-grow"
          />
          <button
            onClick={handleAddCustomIngredient}
            className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded-lg ml-2"
          >
            Add
          </button>
        </div>
        <ul>
          {customIngredients.map((item) => (
            <li key={item.name} className="flex items-center mb-2">
              <span className="flex-grow">{item.name}</span>
              <input
                type="text"
                placeholder="Measurement"
                className="border border-gray-300 rounded-lg px-2 py-1 ml-2 w-32"
                value={item.measurement}
                onChange={(e) => updateCustomMeasurement(item.name, e.target.value)}
              />
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
    </div>
  );
};

export default AddRecipeForm;
