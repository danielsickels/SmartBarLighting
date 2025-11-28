interface RecipeDetailsProps {
  id: number;
  name: string;
  instructions: string;
  ingredients: string;
  spirit_types: { id: number; name: string }[];
  onDelete: () => void;
  onEdit: () => void;
}

const RecipeDetails = ({
  name,
  instructions,
  ingredients,
  spirit_types,
  onDelete,
  onEdit,
}: RecipeDetailsProps) => {
  // Parse ingredients from comma-separated string into array
  const ingredientsList = ingredients
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Debug logging
  // console.log("Recipe:", name);
  // console.log("Full ingredients list:", ingredientsList);
  // console.log("Spirit types:", spirit_types);

  // Create spirits with measurements and filter out spirit ingredients from the ingredients list
  const spiritsWithMeasurements = spirit_types.map((spirit) => {
    // Find the measurement for this spirit in the ingredients string (case-sensitive)
    const spiritIngredient = ingredientsList.find((ingredient) =>
      ingredient.startsWith(spirit.name + " - ")
    );

    if (spiritIngredient) {
      return spiritIngredient; // This includes the measurement
    } else {
      return spirit.name; // Fallback to just the name if no measurement found
    }
  });

  // Filter out spirit ingredients from the ingredients list to show only custom ingredients
  const customIngredients = ingredientsList.filter((ingredient) => {
    const isSpirit = spirit_types.some((spirit) => {
      const match = ingredient.startsWith(spirit.name + " - ");
      // console.log(
      //   `Checking "${ingredient}" against spirit "${spirit.name}": starts with "${spirit.name} - "? ${match}`
      // );
      return match;
    });
    // console.log(
    //   `Final result - Ingredient "${ingredient}" is spirit:`,
    //   isSpirit
    // );
    return !isSpirit;
  });

  // console.log("Custom ingredients found:", customIngredients);
  // console.log("Spirits with measurements:", spiritsWithMeasurements);

  const truncatedName = name.length > 64 ? name.substring(0, 64) + "..." : name;

  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex-grow text-white w-full">
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
              <span className="text-amber-300 text-sm italic">
                No spirits used
              </span>
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
              <span className="text-amber-300 text-sm italic">
                No extra ingredients
              </span>
            )}
          </div>
          {/* Debug info */}
          {/* <div className="text-xs text-gray-400 mt-1">
            Debug: Total ingredients: {ingredientsList.length}, Custom:{" "}
            {customIngredients.length}
          </div> */}
        </div>

        <div className="mb-3">
          <strong className="text-amber-600 block mb-2">Instructions:</strong>
          <div className="text-amber-300 text-sm whitespace-pre-line leading-relaxed">
            {instructions}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-2 w-full">
        <button
          onClick={onEdit}
          className="flex-1 text-amber-500 px-3 py-1 text-sm font-bold rounded border border-amber-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.08))',
            boxShadow: '0 0 8px 1px rgba(153, 102, 0, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 15px 2px rgba(153, 102, 0, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 8px 1px rgba(153, 102, 0, 0.2)';
          }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 text-rose-400 px-3 py-1 text-sm font-bold rounded border border-rose-400/30 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.05), rgba(225, 29, 72, 0.08))',
            boxShadow: '0 0 8px 1px rgba(225, 29, 72, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 15px 2px rgba(225, 29, 72, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 8px 1px rgba(225, 29, 72, 0.2)';
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default RecipeDetails;
