import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addRecipe, updateRecipe, Recipe, Ingredient } from "../services/recipeService";
import { fetchAllSpiritTypes, SpiritType } from "../services/spiritTypeService";
import PageHeader from "./PageHeader";
import ActionButton from "./ActionButton";

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
      
      // Parse structured ingredients into spirit and custom ingredients
      const spiritIngs: { spirit: SpiritType; measurement: string }[] = [];
      const customIngs: { name: string; measurement: string }[] = [];

      if (editRecipe.ingredients && Array.isArray(editRecipe.ingredients)) {
        editRecipe.ingredients.forEach((ingredient: Ingredient) => {
          // Check if this ingredient matches a spirit type
          const spiritMatch = editRecipe.spirit_types.find((st) =>
            st.name.toLowerCase() === ingredient.name.toLowerCase()
          );

          if (spiritMatch) {
            const spiritType = allSpiritTypes.find((s) => s.id === spiritMatch.id);
            if (spiritType) {
              const measurement = `${ingredient.quantity} ${ingredient.unit}`;
              spiritIngs.push({ spirit: spiritType, measurement });
            }
          } else {
            // Custom ingredient
            const measurement = `${ingredient.quantity} ${ingredient.unit}`;
            customIngs.push({ name: ingredient.name, measurement });
          }
        });
      }

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

    // Helper function to parse measurement into quantity and unit
    const parseMeasurement = (measurement: string): { quantity: string; unit: string } => {
      const trimmed = measurement.trim();
      const parts = trimmed.split(/\s+/); // Split by whitespace
      
      if (parts.length >= 2) {
        return { quantity: parts[0], unit: parts.slice(1).join(" ") };
      } else if (parts.length === 1) {
        // Try to extract number from string
        const match = trimmed.match(/^([\d.\/]+)\s*(.*)$/);
        if (match) {
          return { quantity: match[1], unit: match[2] || "piece" };
        }
        return { quantity: trimmed, unit: "piece" };
      }
      return { quantity: "1", unit: "piece" };
    };

    // Convert to structured ingredients
    const structuredIngredients: Ingredient[] = [
      ...spiritIngredients.map((item) => {
        const { quantity, unit } = parseMeasurement(item.measurement);
        return {
          name: item.spirit.name,
          quantity,
          unit,
        };
      }),
      ...customIngredients.map((item) => {
        const { quantity, unit } = parseMeasurement(item.measurement);
        return {
          name: item.name,
          quantity,
          unit,
        };
      }),
    ];

    const payload = {
      name,
      instructions,
      ingredients: structuredIngredients,
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
    <div className="flex flex-col items-center">
      <PageHeader title={isEditMode ? "Edit Recipe" : "Add New Recipe"} />

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter Recipe Name"
        maxLength={64}
        className="input-amber"
      />

      <div className="card-section">
        <p className="font-bold text-amber-500 mb-1">Select Spirits:</p>
        <div className="max-h-48 overflow-y-auto scrollbar-hide">
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
                    className="input-amber !my-0 !w-32 text-center"
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

      <div className="card-section">
        <p className="font-bold text-amber-500 mb-2">Add Custom Ingredients:</p>
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newCustomIngredient}
            onChange={(e) => setNewCustomIngredient(e.target.value)}
            placeholder="Ingredient Name"
            className="input-amber !my-0 flex-grow"
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
                className="input-amber !my-0 !w-32 text-center"
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
        className="input-amber h-24"
      />

      <div className="flex gap-3 mt-4">
        <ActionButton
          onClick={handleSubmit}
          variant="confirm"
          size="lg"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : isEditMode ? "Update Recipe" : "Add Recipe"}
        </ActionButton>
        {isEditMode && onEditComplete && (
          <ActionButton onClick={onEditComplete} variant="cancel" size="lg">
            Cancel
          </ActionButton>
        )}
      </div>
    </div>
  );
};

export default AddRecipeForm;
