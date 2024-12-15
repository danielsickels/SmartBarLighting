import { useState } from "react";
import { addBottle } from "../services/bottleService";
import SpiritTypeSelect from "./SpiritTypeSelect";
import { SpiritType } from "../services/spiritTypeService";

const AddBottleForm = () => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [flavorProfile, setFlavorProfile] = useState("");
  const [spiritType, setSpiritType] = useState<SpiritType | null>(null);
  const [capacity, setCapacity] = useState<number | "">("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddBottle = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name || !spiritType || !capacity) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    const newBottle = {
      name,
      brand: brand || "",
      flavor_profile: flavorProfile || "",
      spirit_type_id: spiritType.id,
      capacity_ml: Number(capacity),
    };

    try {
      await addBottle(newBottle);
      setSuccessMessage("Bottle added successfully");
      setName("");
      setBrand("");
      setFlavorProfile("");
      setSpiritType(null);
      setCapacity("");
    } catch (error) {
      console.error("Error adding bottle:", error);
      setErrorMessage("Failed to add bottle");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <h2 className="text-4xl font-bold mt-3 mb-4 text-center text-amber-500">
        <span className="glow-charcoal">Add New Bottle</span>
      </h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter Bottle Name"
        className="border border-amber-500 rounded-lg px-4 py-2 my-2 w-full bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
      />
      <input
        type="text"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="Enter Brand"
        className="border border-amber-500 rounded-lg px-4 py-2 my-2 w-full bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
      />
      <input
        type="text"
        value={flavorProfile}
        onChange={(e) => setFlavorProfile(e.target.value)}
        placeholder="Enter Flavor Profile"
        className="border border-amber-500 rounded-lg px-4 py-2 my-2 w-full bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
      />
      <SpiritTypeSelect
        selectedSpiritType={spiritType}
        onSpiritTypeChange={setSpiritType}
      />
      <input
        type="number"
        value={capacity}
        onChange={(e) =>
          setCapacity(e.target.value ? Number(e.target.value) : "")
        }
        placeholder="Enter Capacity (ml)"
        className="border border-amber-500 rounded-lg px-4 py-2 my-2 w-full bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(255,191,0,0.5)]"
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
        onClick={handleAddBottle}
        className="text-2xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 mt-4 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_20px_3px_rgba(0,0,0,1)]"
      >
        Confirm
      </button>
    </div>
  );
};

export default AddBottleForm;
