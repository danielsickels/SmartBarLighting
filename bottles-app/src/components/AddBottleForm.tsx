import { useState } from "react";
import toast from "react-hot-toast";
import { addBottle } from "../services/bottleService";
import SpiritTypeSelect from "./SpiritTypeSelect";
import { SpiritType } from "../services/spiritTypeService";

const AddBottleForm = () => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [flavorProfile, setFlavorProfile] = useState("");
  const [spiritType, setSpiritType] = useState<SpiritType | null>(null);
  const [capacity, setCapacity] = useState<number | "">("");

  const handleAddBottle = async () => {
    if (!name || !spiritType || !capacity) {
      toast.error("Please fill all required fields");
      return;
    }

    const newBottle = {
      name,
      brand: brand || "",
      flavor_profile: flavorProfile || "",
      spirit_type_id: spiritType.id,
      capacity_ml: Number(capacity),
    };

    const toastId = toast.loading("Adding bottle...");

    try {
      await addBottle(newBottle);
      toast.success("Bottle added successfully! 🍾", { id: toastId });
      setName("");
      setBrand("");
      setFlavorProfile("");
      setSpiritType(null);
      setCapacity("");
    } catch (error) {
      console.error("Error adding bottle:", error);
      toast.error("Failed to add bottle", { id: toastId });
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
