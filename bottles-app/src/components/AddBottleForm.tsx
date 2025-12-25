import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import {
  addBottle,
  updateBottle,
  importBottleFromImage,
  Bottle,
  BottleImportResult,
} from "../services/bottleService";
import {
  lookupBarcode,
  registerBarcode,
  BarcodeLookupResponse,
} from "../services/barcodeService";
import SpiritTypeSelect from "./SpiritTypeSelect";
import BarcodeScanner from "./BarcodeScanner";
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
type ScanState = "idle" | "scanning" | "not_found" | "found";

const AddBottleForm = ({ editBottle, onEditComplete }: AddBottleFormProps) => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [flavorProfile, setFlavorProfile] = useState("");
  const [spiritType, setSpiritType] = useState<SpiritType | null>(null);
  const [capacity, setCapacity] = useState<number | "">("");

  // Import state (for photo analysis)
  const [importState, setImportState] = useState<ImportState>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BottleImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Barcode scanner state
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<BarcodeLookupResponse | null>(null);

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

  // Handle barcode scan result
  const handleBarcodeScan = useCallback(async (barcode: string) => {
    setShowScanner(false);
    setScannedBarcode(barcode);
    
    const toastId = toast.loading(`Looking up barcode: ${barcode}...`);
    
    try {
      const result = await lookupBarcode(barcode);
      setBarcodeResult(result);
      
      if (result.found && result.data) {
        // Pre-fill form with barcode data
        setName(result.data.name);
        setBrand(result.data.brand || "");
        setFlavorProfile(result.data.flavor_profile || "");
        setCapacity(result.data.capacity_ml || "");
        
        // Try to match spirit type
        if (result.data.spirit_type_name) {
          const spiritTypes = await fetchAllSpiritTypes();
          const matchedType = spiritTypes.find(
            (st) => st.name.toLowerCase() === result.data!.spirit_type_name!.toLowerCase()
          );
          if (matchedType) {
            setSpiritType(matchedType);
          }
        }
        
        setScanState("found");
        toast.success("✅ Bottle found! Review and save.", { id: toastId });
      } else {
        // Barcode not in registry - prompt for photo
        setScanState("not_found");
        toast.error("Barcode not registered. Take a photo to add it!", { id: toastId });
      }
    } catch (error) {
      console.error("Error looking up barcode:", error);
      toast.error("Failed to lookup barcode", { id: toastId });
      setScanState("idle");
    }
  }, []);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }

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
            setName(result.name || "");
            setBrand(result.brand || "");
            setFlavorProfile(result.flavor_profile || "");
            setCapacity(result.capacity_ml || "");

            if (result.spirit_type) {
              const spiritTypes = await fetchAllSpiritTypes();
              const matchedType = spiritTypes.find(
                (st) => st.name.toLowerCase() === result.spirit_type!.toLowerCase()
              );

              if (matchedType) {
                setSpiritType(matchedType);
              } else {
                try {
                  const newType = await addSpiritType({ name: result.spirit_type });
                  setSpiritType(newType);
                  toast.success(`Created new spirit type: ${result.spirit_type}`);
                } catch {
                  toast.error(`Spirit type "${result.spirit_type}" not found. Please select manually.`);
                }
              }
            }

            toast.success("✨ Bottle analyzed! Review and save below.", { id: toastId });
            setImportState("complete");
          } else {
            toast.error(result.error || "Failed to analyze bottle", { id: toastId });
            setImportState("error");
          }
        } catch (error) {
          console.error("Error analyzing bottle:", error);
          setImportResult({
            success: false,
            error: error instanceof Error ? error.message : "Failed to analyze bottle image",
          });
          toast.error(
            error instanceof Error ? error.message : "Failed to analyze bottle image",
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

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const clearImport = () => {
    setImportState("idle");
    setImagePreview(null);
    setImportResult(null);
    setScanState("idle");
    setScannedBarcode(null);
    setBarcodeResult(null);
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

    const toastId = toast.loading(isEditMode ? "Updating bottle..." : "Adding bottle...");

    try {
      if (isEditMode && editBottle) {
        await updateBottle(editBottle.id, bottleData);
        toast.success("Bottle updated successfully! 🍾", { id: toastId });
        onEditComplete?.();
      } else {
        await addBottle(bottleData);
        
        // If we scanned a barcode, register it with this bottle's info
        if (scannedBarcode && (scanState === "not_found" || scanState === "found")) {
          try {
            await registerBarcode({
              barcode: scannedBarcode,
              name,
              brand: brand || undefined,
              flavor_profile: flavorProfile || undefined,
              capacity_ml: capacity ? Number(capacity) : undefined,
              spirit_type_name: spiritType.name,
            });
            toast.success("Barcode registered for future scans! 📱", { id: toastId });
          } catch (regError) {
            console.error("Error registering barcode:", regError);
            // Don't fail the whole operation if barcode registration fails
            toast.success("Bottle added! (Barcode registration failed)", { id: toastId });
          }
        } else {
          toast.success("Bottle added successfully! 🍾", { id: toastId });
        }
        
        // Reset form
        setName("");
        setBrand("");
        setFlavorProfile("");
        setSpiritType(null);
        setCapacity("");
        clearImport();
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "adding"} bottle:`, error);
      toast.error(`Failed to ${isEditMode ? "update" : "add"} bottle`, { id: toastId });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold mt-3 mb-4 text-center text-amber-500">
        <span className="glow-charcoal">
          {isEditMode ? "Edit Bottle" : "Add New Bottle"}
        </span>
      </h2>

      {/* Import Options - only show when not editing */}
      {!isEditMode && (
        <div className="w-full mb-6 space-y-4">
          {/* Barcode Scanner Section */}
          {scanState === "idle" && importState === "idle" && (
            <button
              onClick={() => setShowScanner(true)}
              className="w-full border-2 border-dashed border-blue-500/50 rounded-xl p-5 text-center hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer"
            >
              <div className="text-3xl mb-2">📱</div>
              <p className="text-blue-400 font-medium">Scan Barcode</p>
              <p className="text-gray-500 text-sm mt-1">
                Quick import if bottle is already registered
              </p>
            </button>
          )}

          {/* Barcode Found */}
          {scanState === "found" && barcodeResult?.data && (
            <div className="border border-emerald-500/30 rounded-xl p-4 bg-emerald-900/20">
              <div className="flex items-start gap-4">
                <div className="text-3xl">✅</div>
                <div className="flex-1">
                  <p className="text-emerald-400 font-medium">
                    Bottle Found in Registry!
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Barcode: <code className="bg-gray-800 px-1 rounded">{scannedBarcode}</code>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Form pre-filled. Review and save.
                  </p>
                </div>
                <button
                  onClick={clearImport}
                  className="text-gray-400 hover:text-white p-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Barcode Not Found - Prompt for Photo */}
          {scanState === "not_found" && (
            <div className="border border-yellow-500/30 rounded-xl p-4 bg-yellow-900/20">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-yellow-400 font-medium">
                    New Barcode Detected
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Barcode: <code className="bg-gray-800 px-1 rounded">{scannedBarcode}</code>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Take a photo of the bottle so AI can extract the info.
                    This barcode will be registered for future scans.
                  </p>
                </div>
                <button
                  onClick={clearImport}
                  className="text-gray-400 hover:text-white p-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Photo Import Section */}
          {(importState === "idle" && (scanState === "idle" || scanState === "not_found")) && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-500/50 rounded-xl p-5 text-center hover:border-amber-500 hover:bg-amber-500/5 transition-all cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-3xl mb-2">📸</div>
              <p className="text-amber-400 font-medium">
                {scanState === "not_found" ? "Take Photo of Bottle" : "Import from Photo"}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {scanState === "not_found" 
                  ? "AI will analyze and register this barcode"
                  : "Drop an image or click to browse"}
              </p>
            </div>
          )}

          {/* Analyzing State */}
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

          {/* Analysis Complete */}
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
                  {scannedBarcode && (
                    <p className="text-gray-400 text-xs mt-1">
                      Will register barcode: <code className="bg-gray-800 px-1 rounded">{scannedBarcode}</code>
                    </p>
                  )}
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
                  className="text-gray-400 hover:text-white p-2 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Analysis Error */}
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
                    <p className="text-red-300 text-sm mt-1">{importResult.error}</p>
                  )}
                  {importResult?.llm_response && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">AI Response:</p>
                      <p className="text-xs text-gray-400 bg-gray-800/50 rounded p-2 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {importResult.llm_response}
                      </p>
                    </div>
                  )}
                  <p className="text-gray-500 text-xs mt-3">
                    Try a clearer image or enter manually below
                  </p>
                </div>
                <button
                  onClick={clearImport}
                  className="text-gray-400 hover:text-white p-2 flex-shrink-0"
                >
                  🔄
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          {importState === "idle" && scanState === "idle" && (
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-500 text-sm">or enter manually</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
          )}
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
        onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : "")}
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
            className="text-2xl bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 mt-4 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-[0_0_10px_2px_rgba(0,0,0,1)]"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onError={(error) => {
            toast.error(error);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default AddBottleForm;
