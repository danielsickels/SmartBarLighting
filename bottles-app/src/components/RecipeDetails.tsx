interface RecipeDetailsProps {
    id: number;
    name: string;
    instructions: string;
    ingredients: string;
  }
  
  const RecipeDetails = ({ id, name, instructions, ingredients }: RecipeDetailsProps) => {
    return (
      <div className="border p-4 rounded-lg shadow-md flex flex-col items-start w-full max-w-md mb-4">
        <h3 className="text-lg font-bold">{name}</h3>
        <p>
          <strong>Instructions:</strong> {instructions}
        </p>
        <p>
          <strong>Ingredients:</strong> {ingredients}
        </p>
      </div>
    );
  };
  
  export default RecipeDetails;
