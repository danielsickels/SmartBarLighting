interface RecipeDetailsProps {
  id: number;
  name: string;
  instructions: string;
  ingredients: string;
  onDelete: () => void; // Callback for delete functionality
}

const RecipeDetails = ({ id, name, instructions, ingredients, onDelete }: RecipeDetailsProps) => {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-lg">{name}</h3>
      <p><strong>Instructions:</strong> {instructions}</p>
      <p><strong>Ingredients:</strong> {ingredients}</p>
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
