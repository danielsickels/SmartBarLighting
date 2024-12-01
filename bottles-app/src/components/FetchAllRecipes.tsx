import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import SearchBar from './SearchBar';
import RecipeDetails from './RecipeDetails'; // New RecipeDetails component
import { fetchAllRecipes, deleteRecipe } from '../services/recipeService'; // Recipe service

interface Recipe {
  id: number;
  name: string;
  instructions: string;
  ingredients: string;
}

const FetchAllRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllRecipes();
        setRecipes(data);
        setFilteredRecipes(data);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError('Failed to fetch recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    const regex = new RegExp(searchQuery, 'i');
    const filtered = recipes.filter((recipe) => regex.test(recipe.name));
    setFilteredRecipes(filtered);
  }, [searchQuery, recipes]);

  const handleDelete = async (id: number) => {
    try {
      await deleteRecipe(id);
      // Remove the deleted recipe from state
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
      setFilteredRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Failed to delete recipe');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">All Recipes</h2>

      <div className="w-full mb-4">
        <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeDetails
              key={recipe.id}
              id={recipe.id}
              name={recipe.name}
              instructions={recipe.instructions}
              ingredients={recipe.ingredients}
              onDelete={() => handleDelete(recipe.id)} // Pass delete handler
            />
          ))
        ) : (
          <p className="text-center col-span-full">No recipes found.</p>
        )}
      </div>
    </div>
  );
};

export default FetchAllRecipes;
