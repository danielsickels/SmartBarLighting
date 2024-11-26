import { useState } from 'react';
import { addRecipe } from '../services/recipeService';

const AddRecipeForm = () => {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [bottleIds, setBottleIds] = useState<string>(''); // Comma-separated IDs for simplicity
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddRecipe = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name || !instructions || !ingredients || !bottleIds) {
      setErrorMessage('Please fill all fields');
      return;
    }

    // Convert comma-separated IDs to an array of numbers
    const bottleIdsArray = bottleIds
      .split(',')
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    console.log('Data being sent:', {
      name,
      instructions,
      ingredients,
      bottle_ids: bottleIdsArray,
    });

    try {
      const response = await addRecipe({
        name,
        instructions,
        ingredients,
        bottle_ids: bottleIdsArray,
      });
      console.log('Response from server:', response);
      setSuccessMessage('Recipe added successfully!');
      setName('');
      setInstructions('');
      setIngredients('');
      setBottleIds('');
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
      <textarea
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Enter Ingredients"
        className="border border-gray-300 rounded-lg px-3 py-1 my-2 w-64 h-24"
      />
      <input
        type="text"
        value={bottleIds}
        onChange={(e) => setBottleIds(e.target.value)}
        placeholder="Enter Bottle IDs (comma-separated)"
        className="border border-gray-300 rounded-lg px-3 py-1 my-2 w-64"
      />
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
