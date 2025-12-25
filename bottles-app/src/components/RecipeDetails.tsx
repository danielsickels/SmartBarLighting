import ActionButton from "./ActionButton";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface RecipeDetailsProps {
  id: number;
  name: string;
  instructions: string;
  ingredients: Ingredient[] | null;
  spirit_types: { id: number; name: string }[];
  availabilityClassName?: string;
  onDelete: () => void;
  onEdit: () => void;
}

const RecipeDetails = ({
  name,
  instructions,
  ingredients,
  spirit_types,
  availabilityClassName = "",
  onDelete,
  onEdit,
}: RecipeDetailsProps) => {
  const ingredientsList = ingredients || [];

  const spiritsWithMeasurements = spirit_types.map((spirit) => {
    const spiritIngredient = ingredientsList.find(
      (ingredient) => ingredient.name.toLowerCase() === spirit.name.toLowerCase()
    );

    if (spiritIngredient) {
      return `${spiritIngredient.name} - ${spiritIngredient.quantity} ${spiritIngredient.unit}`;
    }
    return spirit.name;
  });

  const customIngredients = ingredientsList
    .filter((ingredient) => {
      const isSpirit = spirit_types.some(
        (spirit) => spirit.name.toLowerCase() === ingredient.name.toLowerCase()
      );
      return !isSpirit;
    })
    .map((ingredient) => `${ingredient.name} - ${ingredient.quantity} ${ingredient.unit}`);

  const truncatedName = name.length > 64 ? name.substring(0, 64) + "..." : name;

  return (
    <div
      className={`border-4 p-4 rounded-lg bg-gray-900 shadow-md flex flex-col h-full ${availabilityClassName}`}
    >
      <div className="flex-1 text-white w-full">
        <div className="flex justify-center mb-3">
          <h3 className="font-bold text-lg text-amber-300 text-center break-all px-2">
            {truncatedName}
          </h3>
        </div>

        <div className="mb-3">
          <strong className="text-amber-600 block mb-2">Spirits:</strong>
          <div className="flex flex-wrap gap-1">
            {spirit_types.length > 0 ? (
              spiritsWithMeasurements.map((spirit, index) => (
                <span
                  key={index}
                  className="bg-emerald-800 text-emerald-100 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {spirit}
                </span>
              ))
            ) : (
              <span className="text-amber-300 text-sm italic">No spirits used</span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <strong className="text-amber-600 block mb-2">Ingredients:</strong>
          <div className="flex flex-wrap gap-1">
            {customIngredients.length > 0 ? (
              customIngredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="bg-amber-800 text-amber-100 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {ingredient}
                </span>
              ))
            ) : (
              <span className="text-amber-300 text-sm italic">No extra ingredients</span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <strong className="text-amber-600 block mb-2">Instructions:</strong>
          <div className="text-amber-300 text-sm whitespace-pre-line leading-relaxed">
            {instructions}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-2 w-full">
        <ActionButton onClick={onEdit} variant="edit">
          Edit
        </ActionButton>
        <ActionButton onClick={onDelete} variant="delete">
          Delete
        </ActionButton>
      </div>
    </div>
  );
};

export default RecipeDetails;
