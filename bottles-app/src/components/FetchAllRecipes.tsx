import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import SearchBar from "./SearchBar";
import RecipeDetails from "./RecipeDetails";
import ConfirmDialog from "./ConfirmDialog";
import SpiritFilterButtons from "./SpiritFilterButtons";
import { fetchAllRecipes, deleteRecipe, Recipe } from "../services/recipeService";
// import { fetchAllSpiritTypes, SpiritType } from "../services/spiritTypeService";
import { fetchAllBottles } from "../services/bottleService";

interface Bottle {
  id: number;
  spirit_type_id: number; // Link between bottles and spirit types
}

interface FetchAllRecipesProps {
  onEdit?: (recipe: Recipe) => void;
}

const FetchAllRecipes = ({ onEdit }: FetchAllRecipesProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpiritIds, setSelectedSpiritIds] = useState<number[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    recipeId: number | null;
    recipeName: string;
  }>({
    isOpen: false,
    recipeId: null,
    recipeName: "",
  });

  // Extract unique spirit types from recipes
  const availableSpiritTypes = useMemo(() => {
    const spiritMap = new Map();
    recipes.forEach((recipe) => {
      recipe.spirit_types.forEach((spirit) => {
        spiritMap.set(spirit.id, spirit);
      });
    });
    return Array.from(spiritMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [recipes]);

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
        console.error("Error fetching data:", err);
        setError("Failed to fetch recipes or bottles");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipesAndData();
  }, []);

  useEffect(() => {
    const regex = new RegExp(searchQuery, "i");
    const filtered = recipes.filter((recipe) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        regex.test(recipe.name) ||
        recipe.spirit_types.some((spirit) => regex.test(spirit.name));

      // Spirit type filter
      const matchesSpirit =
        selectedSpiritIds.length === 0 ||
        recipe.spirit_types.some((spirit) => selectedSpiritIds.includes(spirit.id));

      return matchesSearch && matchesSpirit;
    });
    setFilteredRecipes(filtered);
  }, [searchQuery, recipes, selectedSpiritIds]);

  const handleToggleSpirit = (spiritId: number) => {
    setSelectedSpiritIds((prev) =>
      prev.includes(spiritId)
        ? prev.filter((id) => id !== spiritId)
        : [...prev, spiritId]
    );
  };

  const handleDeleteClick = (id: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      recipeId: id,
      recipeName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    const recipeId = confirmDialog.recipeId;
    if (!recipeId) return;

    setConfirmDialog({ isOpen: false, recipeId: null, recipeName: "" });
    const toastId = toast.loading("Deleting recipe...");

    try {
      await deleteRecipe(recipeId);
      setRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe.id !== recipeId)
      );
      setFilteredRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe.id !== recipeId)
      );
      toast.success("Recipe deleted successfully", { id: toastId });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe", { id: toastId });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, recipeId: null, recipeName: "" });
  };

  const getCardClassName = (recipe: Recipe) => {
    const allAvailable = (recipe.spirit_types || []).every((spirit) =>
      bottles.some((bottle) => bottle.spirit_type_id === spirit.id)
    );

    return allAvailable
      ? "border-4 border-emerald-500 shadow-[0_0_10px_2px_rgba(52,211,153,0.5)]"
      : "border-4 border-rose-700 shadow-[0_0_10px_2px_rgba(225,29,72,0.5)]";
  };

  return (
    <div className="flex flex-col items-center text-white">
      <h2 className="text-4xl font-bold mt-6 mb-8 text-center text-amber-500">
        <span className="glow-charcoal">All Recipes</span>
      </h2>

      <div className="w-full mb-4">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recipes..."
        />
      </div>

      {/* Spirit Type Filter Buttons */}
      <SpiritFilterButtons
        spiritTypes={availableSpiritTypes}
        selectedSpiritIds={selectedSpiritIds}
        onToggleSpirit={handleToggleSpirit}
      />

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`border-4 p-4 rounded-lg bg-gray-900 shadow-md flex flex-col h-full ${getCardClassName(
                recipe
              )}`}
            >
              <RecipeDetails
                id={recipe.id}
                name={recipe.name}
                ingredients={recipe.ingredients}
                spirit_types={recipe.spirit_types}
                instructions={recipe.instructions}
                onEdit={() => onEdit?.(recipe)}
                onDelete={() => handleDeleteClick(recipe.id, recipe.name)}
              />
            </div>
          ))
        ) : (
          <p className="text-2xl font-bold text-center col-span-full text-amber-600">
            <span className="glow-charcoal">No Recipes Found</span>
          </p>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Recipe?"
        message={`Are you sure you want to delete "${confirmDialog.recipeName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default FetchAllRecipes;
