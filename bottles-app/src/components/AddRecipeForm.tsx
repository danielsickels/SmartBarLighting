import { useState, useEffect } from "react";
import { addRecipe } from "../services/recipeService";
import { fetchAllSpiritTypes, SpiritType } from "../services/spiritTypeService";

const AddRecipeForm = () => {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("1. ");
  const [spiritIngredients, setSpiritIngredients] = useState<
    { spirit: SpiritType; measurement: string }[]
  >([]); // Spirits with measurements
  const [customIngredients, setCustomIngredients] = useState<
    { name: string; measurement: string }[]
  >([]); // Custom ingredients with measurements
  const [newCustomIngredient, setNewCustomIngredient] = useState(""); // For adding new custom ingredients
  const [allSpiritTypes, setAllSpiritTypes] = useState<SpiritType[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSpirits = async () => {
      try {
        const spirits = await fetchAllSpiritTypes();
        setAllSpiritTypes(spirits);
      } catch (error) {
        console.error("Error fetching spirits:", error);
        setErrorMessage("Failed to fetch spirit types.");
      }
    };

    fetchSpirits();
  }, []);

  const handleInstructionsKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentValue = instructions;
      const lines = currentValue.split("\n");
      const lastLine = lines[lines.length - 1];

      // Check if the last line has content after the number
      const numberMatch = lastLine.match(/^(\d+)\.\s*(.*)$/);
      if (numberMatch && numberMatch[2].trim() !== "") {
        // If there's content, add a new numbered line
        const nextNumber = parseInt(numberMatch[1]) + 1;
        setInstructions(currentValue + `\n${nextNumber}. `);
      } else if (numberMatch && numberMatch[2].trim() === "") {
        // If the line is empty (just number and dot), don't add a new number
        setInstructions(currentValue + "\n");
      } else {
        // If no number pattern, just add a new line
        setInstructions(currentValue + "\n");
      }
    }
  };

  const handleInstructionsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInstructions(e.target.value);
  };

  const handleAddRecipe = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (
      !name ||
      !instructions.replace(/^\d+\.\s*$/gm, "").trim() || // Check if instructions has content beyond just numbers
      (spiritIngredients.length === 0 && customIngredients.length === 0)
    ) {
      setErrorMessage(
        "Please fill all fields and add at least one ingredient."
      );
      return;
    }

    setSubmitting(true);

    const spiritStrings = spiritIngredients.map(
      (item) => `${item.spirit.name} - ${item.measurement}`
    );
    const customStrings = customIngredients.map(
      (item) => `${item.name} - ${item.measurement}`
    );
    const payload = {
      name,
      instructions,
      ingredients: [...spiritStrings, ...customStrings].join(", "),
      spirit_type_ids: spiritIngredients.map((item) => item.spirit.id),
    };

    try {
      await addRecipe(payload);
      setSuccessMessage("Recipe added successfully!");
      setName("");
      setInstructions("1. ");
      setSpiritIngredients([]);
      setCustomIngredients([]);
    } catch (error) {
      console.error("Error adding recipe:", error);
      setErrorMessage("Error adding recipe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSpirit = (spirit: SpiritType) => {
    const exists = spiritIngredients.some(
      (item) => item.spirit.id === spirit.id
    );
    if (exists) {
      setSpiritIngredients((prev) =>
        prev.filter((item) => item.spirit.id !== spirit.id)
      );
    } else {
      setSpiritIngredients((prev) => [...prev, { spirit, measurement: "" }]);
    }
  };

  const updateSpiritMeasurement = (spiritId: number, measurement: string) => {
    setSpiritIngredients((prev) =>
      prev.map((item) =>
        item.spirit.id === spiritId ? { ...item, measurement } : item
      )
    );
  };

  const handleAddCustomIngredient = () => {
    if (newCustomIngredient.trim()) {
      setCustomIngredients((prev) => [
        ...prev,
        { name: newCustomIngredient.trim(), measurement: "" },
      ]);
      setNewCustomIngredient("");
    }
  };

  const handleRemoveCustomIngredient = (ingredientName: string) => {
    setCustomIngredients((prev) =>
      prev.filter((item) => item.name !== ingredientName)
    );
  };

  const updateCustomMeasurement = (
    ingredientName: string,
    measurement: string
  ) => {
    setCustomIngredients((prev) =>
      prev.map((item) =>
        item.name === ingredientName ? { ...item, measurement } : item
      )
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <h2 className="text-4xl font-bold mt-3 mb-4 text-center text-amber-500">
        <span className="glow-charcoal">Add New Recipe</span>
      </h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter Recipe Name"
        className="border border-amber-500 rounded-lg px-4 py-2 my-2 w-full bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
      />

      <div className="w-full border border-amber-500 rounded-lg px-4 py-2 my-4 bg-gray-900 text-white shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]">
        <p className="font-bold text-amber-500 mb-1">Select Spirits:</p>
        <div className="max-h-48 overflow-y-auto">
          {allSpiritTypes.map((spirit) => {
            const isSelected = spiritIngredients.some(
              (item) => item.spirit.id === spirit.id
            );
            return (
              <div key={spirit.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSpirit(spirit)}
                  className="accent-amber-500"
                />
                <label className="ml-2 text-amber-500 flex-grow">
                  {spirit.name}
                </label>
                {isSelected && (
                  <input
                    type="text"
                    placeholder="Measurement"
                    className="border border-amber-500 rounded-lg px-2 py-1 ml-2 w-32 bg-gray-900 text-white text-center placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
                    value={
                      spiritIngredients.find(
                        (item) => item.spirit.id === spirit.id
                      )?.measurement || ""
                    }
                    onChange={(e) =>
                      updateSpiritMeasurement(spirit.id, e.target.value)
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full border border-amber-500 rounded-lg px-4 py-2 my-4 bg-gray-900 text-white shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]">
        <p className="font-bold text-amber-500 mb-2">Add Custom Ingredients:</p>
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newCustomIngredient}
            onChange={(e) => setNewCustomIngredient(e.target.value)}
            placeholder="Ingredient Name"
            className="border border-amber-500 rounded-lg px-2 py-1 flex-grow bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_5px_2px_rgba(255,191,0,0.5)]"
          />
          <button
            onClick={handleAddCustomIngredient}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-1 rounded-lg ml-2 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(0,0,0,1)]"
          >
            Add
          </button>
        </div>
        <ul>
          {customIngredients.map((item, index) => (
            <li
              key={`custom-${index}-${item.name}`}
              className="flex items-center mb-2"
            >
              <span className="flex-grow">{item.name}</span>
              <button
                onClick={() => handleRemoveCustomIngredient(item.name)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                Remove
              </button>
              <input
                type="text"
                placeholder="Measurement"
                className="border border-amber-500 rounded-lg px-2 py-1 ml-2 w-32 bg-gray-900 text-white text-center placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
                value={item.measurement}
                onChange={(e) =>
                  updateCustomMeasurement(item.name, e.target.value)
                }
              />
            </li>
          ))}
        </ul>
      </div>

      <textarea
        value={instructions}
        onChange={handleInstructionsChange}
        onKeyDown={handleInstructionsKeyDown}
        placeholder="Enter Instructions"
        className="border border-amber-500 rounded-lg px-4 py-2 my-2 w-full h-24 bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
      />

      {successMessage && (
        <div className="text-2xl text-container-success text-emerald-500">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="text-2xl text-container-error text-red-500">
          {errorMessage}
        </div>
      )}

      <button
        onClick={handleAddRecipe}
        className={`text-2xl bg-emerald-700 text-white px-4 py-2 mt-4 rounded-lg ${
          submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-800"
        } focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_20px_3px_rgba(0,0,0,1)]`}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Add Recipe"}
      </button>
    </div>
  );
};

export default AddRecipeForm;
