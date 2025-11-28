import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addRecipe, updateRecipe } from "../services/recipeService";
import { fetchAllSpiritTypes, SpiritType } from "../services/spiritTypeService";

interface Recipe {
  id: number;
  name: string;
  instructions: string;
  ingredients: string;
  spirit_types: { id: number; name: string }[];
}

interface AddRecipeFormProps {
  editRecipe?: Recipe | null;
  onEditComplete?: () => void;
}

const AddRecipeForm = ({ editRecipe, onEditComplete }: AddRecipeFormProps) => {
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
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!editRecipe;

  useEffect(() => {
    const fetchSpirits = async () => {
      try {
        const spirits = await fetchAllSpiritTypes();
        setAllSpiritTypes(spirits);
      } catch (error) {
        console.error("Error fetching spirits:", error);
        toast.error("Failed to fetch spirit types");
      }
    };

    fetchSpirits();
  }, []);

  // Pre-fill form when editing
  useEffect(() => {
    if (editRecipe && allSpiritTypes.length > 0) {
      setName(editRecipe.name);
      setInstructions(editRecipe.instructions);
      
      // Parse ingredients back into spirit and custom ingredients
      const ingredientsList = editRecipe.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      // Separate spirit ingredients and custom ingredients
      const spiritIngs: { spirit: SpiritType; measurement: string }[] = [];
      const customIngs: { name: string; measurement: string }[] = [];

      ingredientsList.forEach((ingredient) => {
        // Check if this is a spirit ingredient
        const spiritMatch = editRecipe.spirit_types.find((st) =>
          ingredient.startsWith(st.name + " - ")
        );

        if (spiritMatch) {
          const measurement = ingredient.substring(spiritMatch.name.length + 3); // Remove "Name - "
          const spiritType = allSpiritTypes.find((s) => s.id === spiritMatch.id);
          if (spiritType) {
            spiritIngs.push({ spirit: spiritType, measurement });
          }
        } else {
          // Custom ingredient
          const parts = ingredient.split(" - ");
          const name = parts[0];
          const measurement = parts[1] || "";
          customIngs.push({ name, measurement });
        }
      });

      setSpiritIngredients(spiritIngs);
      setCustomIngredients(customIngs);
    }
  }, [editRecipe, allSpiritTypes]);

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

  const handleSubmit = async () => {
    if (
      !name ||
      !instructions.replace(/^\d+\.\s*$/gm, "").trim() || // Check if instructions has content beyond just numbers
      (spiritIngredients.length === 0 && customIngredients.length === 0)
    ) {
      toast.error("Please fill all fields and add at least one ingredient");
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

    const toastId = toast.loading(isEditMode ? "Updating recipe..." : "Adding recipe...");

    try {
      if (isEditMode && editRecipe) {
        await updateRecipe(editRecipe.id, payload);
        toast.success("Recipe updated successfully! 🍸", { id: toastId });
        onEditComplete?.();
      } else {
        await addRecipe(payload);
        toast.success("Recipe added successfully! 🍸", { id: toastId });
        setName("");
        setInstructions("1. ");
        setSpiritIngredients([]);
        setCustomIngredients([]);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "adding"} recipe:`, error);
      toast.error(`Error ${isEditMode ? "updating" : "adding"} recipe. Please try again.`, { id: toastId });
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
        <span className="glow-charcoal">{isEditMode ? "Edit Recipe" : "Add New Recipe"}</span>
      </h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter Recipe Name"
        maxLength={64}
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

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className={`text-2xl bg-emerald-700 text-white px-4 py-2 mt-4 rounded-lg ${
            submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-800"
          } focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_20px_3px_rgba(0,0,0,1)]`}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : isEditMode ? "Update Recipe" : "Add Recipe"}
        </button>
        {isEditMode && onEditComplete && (
          <button
            onClick={onEditComplete}
            className="text-2xl bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 mt-4 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_20px_3px_rgba(0,0,0,1)]"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AddRecipeForm;
