import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import {
  addBottle,
  updateBottle,
  importBottleFromImage,
  Bottle,
  BottleImportResult,
} from "../services/bottleService";
import SpiritTypeSelect from "./SpiritTypeSelect";
import {
  fetchAllSpiritTypes,
  addSpiritType,
  SpiritType,
} from "../services/spiritTypeService";

interface AddBottleFormProps {
  editBottle?: Bottle | null;
  onEditComplete?: () => void;
}

type ImportState = "idle" | "analyzing" | "complete" | "error";

const AddBottleForm = ({ editBottle, onEditComplete }: AddBottleFormProps) => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [flavorProfile, setFlavorProfile] = useState("");
  const [spiritType, setSpiritType] = useState<SpiritType | null>(null);
  const [capacity, setCapacity] = useState<number | "">("");

  // Import state
  const [importState, setImportState] = useState<ImportState>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BottleImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!editBottle;

  // Pre-fill form when editing
  useEffect(() => {
    if (editBottle) {
      setName(editBottle.name);
      setBrand(editBottle.brand || "");
      setFlavorProfile(editBottle.flavor_profile || "");
      setCapacity(editBottle.capacity_ml);
      if (editBottle.spirit_type) {
        setSpiritType({
          id: editBottle.spirit_type.id,
          name: editBottle.spirit_type.name,
        });
      }
    }
  }, [editBottle]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }

      // Read and convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];

        setImagePreview(base64);
        setImportState("analyzing");
        setImportResult(null);

        const toastId = toast.loading("🔍 AI is analyzing your bottle...");

        try {
          const result = await importBottleFromImage(base64Data);
          setImportResult(result);

          if (result.success) {
            // Pre-fill form with results
            setName(result.name || "");
            setBrand(result.brand || "");
            setFlavorProfile(result.flavor_profile || "");
            setCapacity(result.capacity_ml || "");

            // Try to match spirit type
            if (result.spirit_type) {
              const spiritTypes = await fetchAllSpiritTypes();
              const matchedType = spiritTypes.find(
                (st) =>
                  st.name.toLowerCase() === result.spirit_type!.toLowerCase()
              );

              if (matchedType) {
                setSpiritType(matchedType);
              } else {
                // Create new spirit type if not found
                try {
                  const newType = await addSpiritType({
                    name: result.spirit_type,
                  });
                  setSpiritType(newType);
                  toast.success(
                    `Created new spirit type: ${result.spirit_type}`
                  );
                } catch {
                  toast.error(
                    `Spirit type "${result.spirit_type}" not found. Please select manually.`
                  );
                }
              }
            }

            toast.success("✨ Bottle analyzed! Review and save below.", {
              id: toastId,
            });
            setImportState("complete");
          } else {
            // Analysis failed - show error state with LLM response
            toast.error(result.error || "Failed to analyze bottle", {
              id: toastId,
            });
            setImportState("error");
          }
        } catch (error) {
          console.error("Error analyzing bottle:", error);
          setImportResult({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to analyze bottle image",
          });
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to analyze bottle image",
            { id: toastId }
          );
          setImportState("error");
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file && fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({
          target: { files: dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    []
  );

  const clearImport = () => {
    setImportState("idle");
    setImagePreview(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!name || !spiritType || !capacity) {
      toast.error("Please fill all required fields");
      return;
    }

    const bottleData = {
      name,
      brand: brand || "",
      flavor_profile: flavorProfile || "",
      spirit_type_id: spiritType.id,
      capacity_ml: Number(capacity),
    };

    const toastId = toast.loading(
      isEditMode ? "Updating bottle..." : "Adding bottle..."
    );

    try {
      if (isEditMode && editBottle) {
        await updateBottle(editBottle.id, bottleData);
        toast.success("Bottle updated successfully! 🍾", { id: toastId });
        onEditComplete?.();
      } else {
        await addBottle(bottleData);
        toast.success("Bottle added successfully! 🍾", { id: toastId });
        // Reset form
        setName("");
        setBrand("");
        setFlavorProfile("");
        setSpiritType(null);
        setCapacity("");
        clearImport();
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} bottle:`,
        error
      );
      toast.error(`Failed to ${isEditMode ? "update" : "add"} bottle`, {
        id: toastId,
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold mt-3 mb-4 text-center text-amber-500">
        <span className="glow-charcoal">
          {isEditMode ? "Edit Bottle" : "Add New Bottle"}
        </span>
      </h2>

      {/* Import from Photo Section - only show when not editing */}
      {!isEditMode && (
        <div className="w-full mb-6">
          {importState === "idle" && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-500/50 rounded-xl p-6 text-center hover:border-amber-500 hover:bg-amber-500/5 transition-all cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-4xl mb-2">📸</div>
              <p className="text-amber-400 font-medium">Import from Photo</p>
              <p className="text-gray-500 text-sm mt-1">
                Drop an image or click to browse • AI will extract bottle info
              </p>
            </div>
          )}

          {importState === "analyzing" && (
            <div className="border border-amber-500/30 rounded-xl p-6 text-center bg-gray-800/50">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Bottle preview"
                  className="max-h-32 mx-auto rounded-lg mb-4 border border-amber-500/30"
                />
              )}
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3" />
              <p className="text-amber-400">Analyzing bottle...</p>
            </div>
          )}

          {importState === "complete" && imagePreview && (
            <div className="border border-emerald-500/30 rounded-xl p-4 bg-emerald-900/20">
              <div className="flex items-start gap-4">
                <img
                  src={imagePreview}
                  alt="Bottle preview"
                  className="h-20 w-20 object-cover rounded-lg border border-emerald-500/30 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-400 font-medium flex items-center gap-2">
                    <span>✨</span> AI Analysis Complete
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Review the form below and make any adjustments
                  </p>
                  {/* Show LLM response if available */}
                  {importResult?.llm_response && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                        View AI response
                      </summary>
                      <p className="mt-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2 whitespace-pre-wrap">
                        {importResult.llm_response}
                      </p>
                    </details>
                  )}
                </div>
                <button
                  onClick={clearImport}
                  className="text-gray-400 hover:text-white p-2 transition-colors flex-shrink-0"
                  title="Clear and try another image"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {importState === "error" && (
            <div className="border border-red-500/30 rounded-xl p-4 bg-red-900/20">
              <div className="flex items-start gap-4">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Bottle preview"
                    className="h-20 w-20 object-cover rounded-lg border border-red-500/30 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-red-400 font-medium flex items-center gap-2">
                    <span>❌</span> Analysis Failed
                  </p>
                  {importResult?.error && (
                    <p className="text-red-300 text-sm mt-1">
                      {importResult.error}
                    </p>
                  )}
                  {/* Show LLM response for debugging */}
                  {importResult?.llm_response && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">AI Response:</p>
                      <p className="text-xs text-gray-400 bg-gray-800/50 rounded p-2 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {importResult.llm_response}
                      </p>
                    </div>
                  )}
                  <p className="text-gray-500 text-xs mt-3">
                    Try a clearer image or enter the details manually below
                  </p>
                </div>
                <button
                  onClick={clearImport}
                  className="text-gray-400 hover:text-white p-2 transition-colors flex-shrink-0"
                  title="Try again"
                >
                  🔄
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Divider - only show when not editing and import section is idle */}
      {!isEditMode && importState === "idle" && (
        <div className="w-full flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-500 text-sm">or enter manually</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
      )}

      {/* Form Fields */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter Bottle Name"
        maxLength={64}
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

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="text-2xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 mt-4 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_20px_3px_rgba(0,0,0,1)]"
        >
          {isEditMode ? "Update" : "Confirm"}
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

export default AddBottleForm;
