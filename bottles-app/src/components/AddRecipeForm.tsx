import { useState, useEffect } from 'react';
import { addRecipe } from '../services/recipeService';
import { fetchAllBottles, Bottle } from '../services/bottleService';

const AddRecipeForm = () => {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<{ bottle: Bottle; measurement: string }[]>([]); // Bottles with measurements
  const [customIngredients, setCustomIngredients] = useState<{ name: string; measurement: string }[]>([]); // Custom ingredients with measurements
  const [newCustomIngredient, setNewCustomIngredient] = useState(''); // Input for new custom ingredient
  const [allBottles, setAllBottles] = useState<Bottle[]>([]); // All available bottles
  const [filteredBottles, setFilteredBottles] = useState<Bottle[]>([]); // Filtered bottles for search
  const [searchQuery, setSearchQuery] = useState(''); // Search query for bottles
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBottles = async () => {
      try {
        const bottles = await fetchAllBottles();
        setAllBottles(bottles);
        setFilteredBottles(bottles); // Initialize filtered bottles
      } catch (error) {
        console.error('Error fetching bottles:', error);
        setErrorMessage('Error fetching bottles.');
      }
    };

    fetchBottles();
  }, []);

  // Filter bottles when the search query changes
  useEffect(() => {
    const regex = new RegExp(searchQuery, 'i');
    const filtered = allBottles.filter((bottle) => regex.test(bottle.name));
    setFilteredBottles(filtered);
  }, [searchQuery, allBottles]);

  const handleAddCustomIngredient = () => {
    if (newCustomIngredient.trim()) {
      setCustomIngredients((prev) => [...prev, { name: newCustomIngredient.trim(), measurement: '' }]);
      setNewCustomIngredient('');
    }
  };

  const handleRemoveCustomIngredient = (ingredientName: string) => {
    setCustomIngredients((prev) => prev.filter((item) => item.name !== ingredientName));
  };

  const handleAddRecipe = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name || !instructions || (ingredients.length === 0 && customIngredients.length === 0)) {
      setErrorMessage('Please fill all fields and add at least one ingredient.');
      return;
    }

    // Combine selected bottles and custom ingredients into a single ingredients string
    const ingredientStrings = [
      ...ingredients.map((item) => `${item.bottle.name} - ${item.measurement}`),
      ...customIngredients.map((item) => `${item.name} - ${item.measurement}`),
    ];

    const payload = {
      name,
      instructions,
      ingredients: ingredientStrings.join(', '),
      bottle_ids: ingredients.map((item) => item.bottle.id), // Only send IDs of selected bottles
    };

    console.log('Data being sent:', payload);

    try {
      const response = await addRecipe(payload);
      console.log('Response from server:', response);
      setSuccessMessage('Recipe added successfully!');
      setName('');
      setInstructions('');
      setIngredients([]);
      setCustomIngredients([]);
    } catch (error) {
      console.error('Error adding recipe:', error);
      setErrorMessage('Error adding recipe. Please try again');
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

      {/* Bottle selection */}
      <div className="w-64 border border-gray-300 rounded-lg px-3 py-1 my-2">
        <p className="font-bold">Select Bottles:</p>
        <input
          type="text"
          placeholder="Search bottles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1 my-2 w-full"
        />
        <div className="max-h-48 overflow-y-auto">
          {filteredBottles.map((bottle) => {
            const isSelected = ingredients.some((item) => item.bottle.id === bottle.id);
            return (
              <div key={bottle.id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  value={bottle.id}
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setIngredients((prev) => [...prev, { bottle, measurement: '' }]);
                    } else {
                      setIngredients((prev) =>
                        prev.filter((item) => item.bottle.id !== bottle.id)
                      );
                    }
                  }}
                />
                <label className="ml-2 flex-grow">{bottle.name}</label>
                {isSelected && (
                  <input
                    type="text"
                    placeholder="Measurement"
                    className="border border-gray-300 rounded-lg px-2 py-1 ml-2 w-24"
                    value={ingredients.find((item) => item.bottle.id === bottle.id)?.measurement || ''}
                    onChange={(e) =>
                      setIngredients((prev) =>
                        prev.map((item) =>
                          item.bottle.id === bottle.id
                            ? { ...item, measurement: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
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
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-blue-700"
      >
        Add Recipe
      </button>
    </div>
  );
};

export default AddRecipeForm;
