import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import SearchBar from './SearchBar';
import RecipeDetails from './RecipeDetails';
import { fetchAllRecipes, deleteRecipe } from '../services/recipeService';
import { fetchAllSpiritTypes, SpiritType } from '../services/spiritTypeService';
import { fetchAllBottles } from '../services/bottleService';

interface Recipe {
  id: number;
  name: string;
  instructions: string;
  ingredients: string;
  spirit_types: { id: number; name: string }[];
}

interface Bottle {
  id: number;
  spirit_type_id: number; // Link between bottles and spirit types
}

interface Props {
  showAllRecipes: boolean;
}

const FetchAllRecipes = ({ showAllRecipes }: Props) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecipesAndData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [recipesData, bottlesData] = await Promise.all([
          fetchAllRecipes(),
          fetchAllBottles(),
        ]);

        setRecipes(recipesData);
        setBottles(bottlesData);
        setFilteredRecipes(recipesData); // Show all recipes by default
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch recipes or bottles');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipesAndData();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredRecipes(recipes); // Show all recipes when search query is empty
    } else {
      const regex = new RegExp(searchQuery, 'i');
      const filtered = recipes.filter(
        (recipe) =>
          regex.test(recipe.name) ||
          recipe.spirit_types.some((spirit) => regex.test(spirit.name)) // Filter by spirit type
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  const handleDeleteRecipe = async (id: number) => {
    try {
      await deleteRecipe(id);
      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== id));
      setFilteredRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError('Failed to delete recipe');
    }
  };

  const getCardClassName = (recipe: Recipe) => {
    // Check if any bottles are associated with the recipe's spirit types
    const allAvailable = (recipe.spirit_types || []).every((spirit) =>
      bottles.some((bottle) => bottle.spirit_type_id === spirit.id)
    );

    return allAvailable ? 'border-green-600' : 'border-red-600';
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
            <div
              key={recipe.id}
              className={`border-4 p-4 rounded-lg ${getCardClassName(recipe)}`}
            >
              <RecipeDetails
                id={recipe.id}
                name={recipe.name}
                instructions={recipe.instructions}
                ingredients={recipe.ingredients}
                spirit_types={recipe.spirit_types}
                onDelete={() => handleDeleteRecipe(recipe.id)}
              />
            </div>
          ))
        ) : (
          <p className="text-center col-span-full">No recipes found.</p>
        )}
      </div>
    </div>
  );
};

export default FetchAllRecipes;
