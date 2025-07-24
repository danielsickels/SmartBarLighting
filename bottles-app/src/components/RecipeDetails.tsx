interface RecipeDetailsProps {
  id: number;
  name: string;
  instructions: string;
  ingredients: string;
  spirit_types: { id: number; name: string }[];
  onDelete: () => void;
}

const RecipeDetails = ({
  name,
  instructions,
  ingredients,
  spirit_types,
  onDelete,
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

  return (
    <div className="border border-brown-500 p-4 rounded-lg shadow-md bg-gray-900 flex flex-col items-start w-full max-w-md mb-4">
      <div className="flex-grow text-white">
        <h3 className="font-bold text-center text-lg text-amber-300 mb-3">
          {name}
        </h3>

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
                No custom ingredients
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
          <strong className="text-amber-600 block mb-2">Instructions:</strong>
          <div className="text-amber-300 text-sm whitespace-pre-line leading-relaxed">
            {instructions}
          </div>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="mt-2 bg-rose-700 text-white px-3 py-1 text-sm rounded hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        Delete
      </button>
    </div>
  );
};

export default RecipeDetails;
