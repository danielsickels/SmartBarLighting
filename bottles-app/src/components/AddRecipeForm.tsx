import { useState, useEffect } from 'react';
import { addRecipe } from '../services/recipeService';
import { fetchAllBottles, Bottle } from '../services/bottleService';

const AddRecipeForm = () => {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<Bottle[]>([]); // Selected bottles for ingredients
  const [allBottles, setAllBottles] = useState<Bottle[]>([]); // All available bottles
  const [filteredBottles, setFilteredBottles] = useState<Bottle[]>([]); // Filtered bottles for search
  const [searchQuery, setSearchQuery] = useState(''); // Search query
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBottles = async () => {
      try {
        const bottles = await fetchAllBottles();
        setAllBottles(bottles);
        setFilteredBottles(bottles); // Initialize filtered list
      } catch (error) {
        console.error('Error fetching bottles:', error);
        setErrorMessage('Error fetching bottles.');
      }
    };

    fetchBottles();
  }, []);

  // Filter bottles based on search query
  useEffect(() => {
    const regex = new RegExp(searchQuery, 'i');
    const filtered = allBottles.filter((bottle) => regex.test(bottle.name));
    setFilteredBottles(filtered);
  }, [searchQuery, allBottles]);

  const handleAddRecipe = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name || !instructions || ingredients.length === 0) {
      setErrorMessage('Please fill all fields');
      return;
    }

    // Collect the bottle IDs from the selected bottles
    const bottleIds = ingredients.map((bottle) => bottle.id);

    const payload = {
      name,
      instructions,
      ingredients: ingredients.map((bottle) => bottle.name).join(', '), // Combine names into a single string
      bottle_ids: bottleIds,
    };

    console.log('Data being sent:', payload);

    try {
      const response = await addRecipe(payload);
      console.log('Response from server:', response);
      setSuccessMessage('Recipe added successfully!');
      setName('');
      setInstructions('');
      setIngredients([]);
      setSearchQuery('');
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

      {/* Ingredient selection */}
      <div className="w-64 border border-gray-300 rounded-lg px-3 py-1 my-2">
        <p className="font-bold">Select Bottles:</p>
        {/* Search input for filtering bottles */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Bottles"
          className="border border-gray-300 rounded-lg px-2 py-1 mb-2 w-full"
        />
        {/* Scrollable container for bottles */}
        <div className="max-h-40 overflow-y-auto">
          {filteredBottles.map((bottle) => (
            <div key={bottle.id} className="flex items-center">
              <input
                type="checkbox"
                checked={ingredients.some((selectedBottle) => selectedBottle.id === bottle.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setIngredients((prev) => [...prev, bottle]);
                  } else {
                    setIngredients((prev) =>
                      prev.filter((selectedBottle) => selectedBottle.id !== bottle.id)
                    );
                  }
                }}
              />
              <label className="ml-2">{bottle.name}</label>
            </div>
          ))}
        </div>
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
