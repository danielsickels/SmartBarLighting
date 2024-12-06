import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import SearchBar from './SearchBar';
import RecipeDetails from './RecipeDetails';
import { fetchAllRecipes, deleteRecipe } from '../services/recipeService';
import { Bottle, fetchAllBottles } from '../services/bottleService';

interface Recipe {
  id: number;
  name: string;
  instructions: string;
  ingredients: string;
  bottles: Bottle[];
}

interface Props {
  showAllRecipes: boolean;
}

const FetchAllRecipes = ({ showAllRecipes }: Props) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [availableBottleIds, setAvailableBottleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecipesAndBottles = async () => {
      setLoading(true);
      setError(null);
      try {
        const [recipesData, bottlesData] = await Promise.all([fetchAllRecipes(), fetchAllBottles()]);

        // const transformedRecipes: Recipe[] = recipesData.map((recipe) => ({
        //   ...recipe,
        //   bottles: recipe.bottles || [],
        // }));
        const transformedRecipes: Recipe[] = recipesData

        console.log('Transformed Recipes:', transformedRecipes);
        console.log('Fetched Bottles:', bottlesData);

        setRecipes(transformedRecipes);
        setAvailableBottleIds(bottlesData.map((bottle) => bottle.id));
        setFilteredRecipes(transformedRecipes); // Show all recipes by default
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch recipes or bottles');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipesAndBottles();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredRecipes(recipes); // Show all recipes when search query is empty
    } else {
      const regex = new RegExp(searchQuery, 'i');
      const filtered = recipes.filter((recipe) => regex.test(recipe.name));
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
    console.log(availableBottleIds);
    
    // Check if the bottles array is empty
    if (recipe.bottles.length === 0) {
        console.log('Bottles array is empty');
        return 'border-red-600';
    }
    
    // Check if all bottle IDs are available
    const allAvailable = recipe.bottles.every((bottle) => {
        console.log(bottle.id); // Log the ID
        return bottle.id && availableBottleIds.includes(bottle.id); // Ensure bottle.id exists and is included
    });

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
