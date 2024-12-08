interface RecipeDetailsProps {
  id: number;
  name: string;
  instructions: string;
  ingredients: string;
  spirit_types: { id: number; name: string }[];
  onDelete: () => void;
}

const RecipeDetails = ({
  id,
  name,
  instructions,
  ingredients,
  spirit_types,
  onDelete,
}: RecipeDetailsProps) => {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-lg">{name}</h3>
      <p>
        <strong>Instructions:</strong> {instructions}
      </p>
      <p>
        <strong>Ingredients:</strong> {ingredients}
      </p>
      <div>
        <strong>Spirit Types:</strong>
        {spirit_types.length > 0 ? (
          <ul className="list-disc list-inside">
            {spirit_types.map((spirit) => (
              <li key={spirit.id}>{spirit.name}</li>
            ))}
          </ul>
        ) : (
          <p>No associated spirit types.</p>
        )}
      </div>
      <button
        onClick={onDelete}
        className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  );
};

export default RecipeDetails;
