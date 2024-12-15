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
    <div className="border border-brown-500 p-4 rounded-lg shadow-md bg-gray-900 flex flex-col items-start w-full max-w-md mb-4">
      <div className="flex-grow text-white">
        <h3 className="font-bold text-center text-lg text-amber-300 mb-2">
          {name}
        </h3>
        <p>
          <strong className="text-amber-600">Instructions:</strong>{" "}
          <span className="text-amber-300">{instructions}</span>
        </p>
        <p>
          <strong className="text-amber-600">Ingredients:</strong>{" "}
          <span className="text-amber-300">{ingredients}</span>
        </p>
        <div>
          <strong className="text-amber-600">Spirit Types:</strong>{" "}
          {spirit_types.length > 0 ? (
            <ul className="list-disc list-inside text-amber-300">
              {spirit_types.map((spirit) => (
                <li key={spirit.id}>{spirit.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-amber-300">No associated spirit types.</p>
          )}
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
