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
import PageHeader from "./PageHeader";
import ActionButton from "./ActionButton";
import {
  fetchAllSpiritTypes,
  addSpiritType,
  SpiritType,
} from "../services/spiritTypeService";

interface AddBottleFormProps {
  editBottle?: Bottle | null;
  onEditComplete?: () => void;
}

type StepKey = "scan" | "photo" | "review";

interface Step {
  key: StepKey;
  label: string;
  icon: string;
  description: string;
}

const STEPS: Step[] = [
  { key: "scan", label: "Scan", icon: "📱", description: "Scan barcode" },
  { key: "photo", label: "Photo", icon: "📸", description: "Capture image" },
  { key: "review", label: "Review", icon: "✅", description: "Review & save" },
];

const AddBottleForm = ({ editBottle, onEditComplete }: AddBottleFormProps) => {
  // Form fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [flavorProfile, setFlavorProfile] = useState("");
  const [spiritType, setSpiritType] = useState<SpiritType | null>(null);
  const [capacity, setCapacity] = useState<number | "">("");

  // Current step (for the slider)
  const [currentStep, setCurrentStep] = useState<StepKey>("scan");
  const [showScanner, setShowScanner] = useState(false);
  
  // Barcode state
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [barcodeFound, setBarcodeFound] = useState(false);
  const [barcodeSkipped, setBarcodeSkipped] = useState(false);

  // Photo import state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BottleImportResult | null>(null);
  const [aiAnalysisSkipped, setAiAnalysisSkipped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputNoAiRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!editBottle;

  // Check completion status for each step
  const isStepComplete = (step: StepKey): boolean => {
    switch (step) {
      case "scan":
        return !!scannedBarcode || barcodeSkipped;
      case "photo":
        // Photo is complete if: AI analyzed successfully OR AI was skipped but we have an image
        return (!!imagePreview && importResult?.success === true) || (!!imagePreview && aiAnalysisSkipped);
      case "review":
        return !!name && !!spiritType && !!capacity;
      default:
        return false;
    }
  };

  // Pre-fill form when editing (bypass the wizard in edit mode)
  useEffect(() => {
    if (editBottle) {
      setName(editBottle.name);
      setBrand(editBottle.brand || "");
      setFlavorProfile(editBottle.flavor_profile || "");
      setCapacity(editBottle.capacity_ml);
      setCurrentStep("review");
      
      // Pre-fill spirit type
      if (editBottle.spirit_type) {
        setSpiritType({
          id: editBottle.spirit_type.id,
          name: editBottle.spirit_type.name,
        });
      }
      
      // Pre-fill image if exists
      if (editBottle.image_url) {
        setImagePreview(editBottle.image_url);
        setImportResult({ success: true }); // Mark as already analyzed
      }
      
      // Pre-fill barcode if exists
      if (editBottle.barcode) {
        setScannedBarcode(editBottle.barcode);
        setBarcodeFound(true); // It was previously registered
      } else {
        setBarcodeSkipped(true); // No barcode means it was skipped
      }
    }
  }, [editBottle]);

  // Handle barcode scan result
  const handleBarcodeScan = useCallback(async (barcode: string) => {
    setShowScanner(false);
    setScannedBarcode(barcode);
    
    const toastId = toast.loading(`Looking up barcode: ${barcode}...`);
    
    try {
      const result: BarcodeLookupResponse = await lookupBarcode(barcode);
      
      if (result.found && result.data) {
        // Barcode found - pre-fill form with data
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
        
        setBarcodeFound(true);
        toast.success("✅ Bottle found in registry! Form pre-filled.", { id: toastId });
        // Auto-advance to review since we have all data
        setCurrentStep("review");
      } else {
        // Barcode not in registry
        setBarcodeFound(false);
        toast.success(`Barcode scanned: ${barcode}`, { id: toastId });
        // Guide to photo step
        setCurrentStep("photo");
      }
    } catch (error) {
      console.error("Error looking up barcode:", error);
      toast.error("Lookup failed, but barcode saved. Continue to photo.", { id: toastId });
      setBarcodeFound(false);
      setCurrentStep("photo");
    }
  }, []);

  // Handle photo file selection
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
        setIsAnalyzing(true);
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

            toast.success("✨ Analysis complete! Review the details.", { id: toastId });
            // Auto-advance to review
            setCurrentStep("review");
          } else {
            toast.error(result.error || "Failed to analyze bottle", { id: toastId });
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
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  // Handle photo file selection WITHOUT AI analysis
  const handleFileSelectNoAi = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setAiAnalysisSkipped(true);
        setImportResult(null);
        toast.success("📸 Photo saved! Fill in the details manually.");
        setCurrentStep("review");
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

  // Reset everything
  const resetFlow = () => {
    setCurrentStep("scan");
    setShowScanner(false);
    setScannedBarcode(null);
    setBarcodeFound(false);
    setBarcodeSkipped(false);
    setIsAnalyzing(false);
    setImagePreview(null);
    setImportResult(null);
    setAiAnalysisSkipped(false);
    setName("");
    setBrand("");
    setFlavorProfile("");
    setSpiritType(null);
    setCapacity("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (fileInputNoAiRef.current) {
      fileInputNoAiRef.current.value = "";
    }
  };

  // Clear just the barcode
  const clearBarcode = () => {
    setScannedBarcode(null);
    setBarcodeFound(false);
    setBarcodeSkipped(false);
  };

  // Skip barcode scanning
  const skipBarcode = () => {
    setBarcodeSkipped(true);
    setScannedBarcode(null);
    goToStep("photo");
  };

  // Clear just the photo
  const clearPhoto = () => {
    setImagePreview(null);
    setImportResult(null);
    setAiAnalysisSkipped(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (fileInputNoAiRef.current) {
      fileInputNoAiRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required elements (barcode is optional if skipped)
    // In edit mode, image is already saved with the bottle
    // Photo is valid if: AI analyzed OR AI skipped with image
    const hasValidPhoto = (imagePreview && importResult?.success) || (imagePreview && aiAnalysisSkipped);
    if (!isEditMode && !hasValidPhoto) {
      toast.error("Please capture a photo of the bottle");
      setCurrentStep("photo");
      return;
    }

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
      image_url: imagePreview || undefined,
      barcode: scannedBarcode || undefined, // Will be undefined if skipped
    };

    const toastId = toast.loading(isEditMode ? "Updating bottle..." : "Adding bottle...");

    try {
      if (isEditMode && editBottle) {
        // Only update form fields in edit mode (image/barcode are preserved from original)
        await updateBottle(editBottle.id, {
          name: bottleData.name,
          brand: bottleData.brand,
          flavor_profile: bottleData.flavor_profile,
          spirit_type_id: bottleData.spirit_type_id,
          capacity_ml: bottleData.capacity_ml,
        });
        toast.success("Bottle updated successfully! 🍾", { id: toastId });
        onEditComplete?.();
      } else {
        await addBottle(bottleData);
        
        // Also register barcode in global registry for other users (only if we have a barcode)
        if (scannedBarcode) {
          try {
            await registerBarcode({
              barcode: scannedBarcode,
              name,
              brand: brand || undefined,
              flavor_profile: flavorProfile || undefined,
              capacity_ml: capacity ? Number(capacity) : undefined,
              spirit_type_name: spiritType.name,
            });
            toast.success("Bottle added & barcode registered! 🍾📱", { id: toastId });
          } catch (regError) {
            console.error("Error registering barcode:", regError);
            toast.success("Bottle added! (Barcode registration failed)", { id: toastId });
          }
        } else {
          toast.success("Bottle added successfully! 🍾", { id: toastId });
        }
        
        // Reset for next bottle
        resetFlow();
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "adding"} bottle:`, error);
      toast.error(`Failed to ${isEditMode ? "update" : "add"} bottle`, { id: toastId });
    }
  };

  // Navigate to a step
  const goToStep = (step: StepKey) => {
    setCurrentStep(step);
  };

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep);

  // Render the step slider/indicator
  const renderStepSlider = () => {
    if (isEditMode) return null;

    return (
      <div className="w-full mb-6">
        {/* Step tabs */}
        <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-1">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.key;
            const isComplete = isStepComplete(step.key);
            
            return (
              <button
                key={step.key}
                onClick={() => goToStep(step.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-amber-500/20 text-amber-400 shadow-lg"
                    : isComplete
                    ? "text-emerald-400 hover:bg-gray-700/50"
                    : "text-gray-400 hover:bg-gray-700/50"
                }`}
              >
                <span className="text-xl">{isComplete && !isActive ? "✓" : step.icon}</span>
                <span className="hidden sm:inline text-sm font-medium">{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "scan":
        return (
          <div className="space-y-4">
            {/* Current barcode status */}
            {scannedBarcode ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                <span className="text-3xl">✅</span>
                <div className="flex-1">
                  <p className="text-emerald-400 font-medium">Barcode Scanned</p>
                  <code className="text-amber-400 font-mono text-lg">{scannedBarcode}</code>
                  {barcodeFound && (
                    <p className="text-emerald-400/70 text-sm mt-1">Found in registry - form pre-filled!</p>
                  )}
                </div>
                <button
                  onClick={clearBarcode}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Scan a different barcode"
                >
                  🔄
                </button>
              </div>
            ) : barcodeSkipped ? (
              <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-600">
                <div className="flex flex-col items-center justify-center w-12">
                  {/* Barcode placeholder icon */}
                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z" opacity="0.3"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 font-medium">No Barcode</p>
                  <p className="text-gray-500 text-sm">Barcode scan was skipped</p>
                </div>
                <button
                  onClick={clearBarcode}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Scan a barcode instead"
                >
                  🔄
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-blue-500/50 rounded-xl p-8 text-center bg-blue-500/5">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">Scan Bottle Barcode</h3>
                <p className="text-gray-400 mb-4">
                  Scan the barcode to check if this bottle is already in our database.
                </p>
                <div className="flex flex-col gap-3 items-center">
                  <ActionButton
                    onClick={() => setShowScanner(true)}
                    variant="confirm"
                    size="lg"
                  >
                    Open Scanner
                  </ActionButton>
                  <button
                    onClick={skipBarcode}
                    className="text-gray-500 hover:text-gray-400 text-sm underline"
                  >
                    Skip - bottle has no barcode
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-end">
              <ActionButton
                onClick={() => goToStep("photo")}
                variant="confirm"
              >
                Next: Photo →
              </ActionButton>
            </div>
          </div>
        );

      case "photo":
        return (
          <div className="space-y-4">
            {/* Show barcode status reminder */}
            {!scannedBarcode && !barcodeSkipped && (
              <div className="flex items-center gap-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                <span className="text-xl">⚠️</span>
                <p className="text-yellow-400 text-sm flex-1">
                  Don&apos;t forget to scan the barcode!
                </p>
                <button
                  onClick={() => goToStep("scan")}
                  className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                >
                  Go back
                </button>
              </div>
            )}
            {barcodeSkipped && (
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z" opacity="0.3"/>
                  </svg>
                  <span className="text-gray-500 text-sm">No barcode</span>
                </div>
                <button
                  onClick={() => goToStep("scan")}
                  className="text-gray-500 hover:text-gray-400 text-sm underline ml-auto"
                >
                  Add one?
                </button>
              </div>
            )}

            {/* Current photo status */}
            {imagePreview && importResult?.success ? (
              <div className="flex items-start gap-4 p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                <img
                  src={imagePreview}
                  alt="Bottle"
                  className="h-24 w-24 object-cover rounded-lg border border-emerald-500/30 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-emerald-400 font-medium flex items-center gap-2">
                    <span>✨</span> Photo Analyzed
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    AI has extracted the bottle details. Review them in the next step.
                  </p>
                  {importResult.llm_response && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                        View AI response
                      </summary>
                      <p className="mt-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {importResult.llm_response}
                      </p>
                    </details>
                  )}
                </div>
                <button
                  onClick={clearPhoto}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Take a different photo"
                >
                  🔄
                </button>
              </div>
            ) : imagePreview && aiAnalysisSkipped ? (
              <div className="flex items-start gap-4 p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
                <img
                  src={imagePreview}
                  alt="Bottle"
                  className="h-24 w-24 object-cover rounded-lg border border-blue-500/30 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-blue-400 font-medium flex items-center gap-2">
                    <span>📸</span> Photo Saved (Manual Entry)
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    AI analysis was skipped. Fill in the bottle details manually in the next step.
                  </p>
                </div>
                <button
                  onClick={clearPhoto}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Take a different photo"
                >
                  🔄
                </button>
              </div>
            ) : isAnalyzing ? (
              <div className="border border-amber-500/30 rounded-xl p-8 text-center bg-gray-800/50">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Bottle preview"
                    className="max-h-40 mx-auto rounded-lg mb-4 border border-amber-500/30"
                  />
                )}
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent mb-4" />
                <p className="text-amber-400 text-lg">AI is analyzing the bottle...</p>
                <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
              </div>
            ) : importResult && !importResult.success ? (
              <div className="border border-red-500/30 rounded-xl p-4 bg-red-900/20">
                <div className="flex items-start gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Bottle preview"
                      className="h-20 w-20 object-cover rounded-lg border border-red-500/30 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-red-400 font-medium">❌ Analysis Failed</p>
                    {importResult.error && (
                      <p className="text-red-300 text-sm mt-1">{importResult.error}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      Try a clearer image, or skip AI and enter details manually
                    </p>
                    <button
                      onClick={() => {
                        setAiAnalysisSkipped(true);
                        setImportResult(null);
                        toast.success("📸 Using photo without AI. Fill in details manually.");
                        setCurrentStep("review");
                      }}
                      className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      Skip AI → Enter manually
                    </button>
                  </div>
                  <button
                    onClick={clearPhoto}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    🔄
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Option 1: Photo with AI Analysis */}
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
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="text-4xl mb-3">✨📸</div>
                  <h3 className="text-lg font-bold text-amber-400 mb-1">Photo + AI Analysis</h3>
                  <p className="text-gray-400 text-sm">
                    AI will extract bottle details automatically
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-700" />
                  <span className="text-gray-500 text-xs">or</span>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>

                {/* Option 2: Photo without AI */}
                <div
                  onClick={() => fileInputNoAiRef.current?.click()}
                  className="border-2 border-dashed border-blue-500/30 rounded-xl p-4 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer"
                >
                  <input
                    ref={fileInputNoAiRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelectNoAi}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📸</span>
                    <div className="text-left">
                      <h3 className="text-sm font-medium text-blue-400">Photo Only (Skip AI)</h3>
                      <p className="text-gray-500 text-xs">Enter details manually</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <ActionButton
                onClick={() => goToStep("scan")}
                variant="cancel"
              >
                ← Back
              </ActionButton>
              <ActionButton
                onClick={() => goToStep("review")}
                variant="confirm"
              >
                Next: Review →
              </ActionButton>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            {/* Image and Barcode Preview Card */}
            {!isEditMode && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex gap-4">
                  {/* Bottle Image */}
                  <div 
                    onClick={() => goToStep("photo")}
                    className="cursor-pointer group"
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Bottle"
                          className={`w-24 h-24 object-cover rounded-lg border-2 transition-colors ${
                            importResult?.success 
                              ? "border-emerald-500/30 group-hover:border-emerald-500"
                              : aiAnalysisSkipped
                                ? "border-blue-500/30 group-hover:border-blue-500"
                                : "border-amber-500/30 group-hover:border-amber-500"
                          }`}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-white text-xs">Change</span>
                        </div>
                        {/* AI status badge */}
                        {aiAnalysisSkipped && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-medium">
                            Manual
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg border-2 border-dashed border-red-500/50 bg-red-900/10 flex items-center justify-center">
                        <span className="text-red-400 text-2xl">📸</span>
                      </div>
                    )}
                  </div>

                  {/* Barcode Info */}
                  <div 
                    onClick={() => goToStep("scan")}
                    className="flex-1 cursor-pointer group"
                  >
                    {scannedBarcode ? (
                      <div className="h-full flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z"/>
                          </svg>
                          <span className="text-emerald-400 text-sm font-medium">Barcode Scanned</span>
                        </div>
                        <code className="text-amber-400 font-mono text-lg group-hover:text-amber-300 transition-colors">
                          {scannedBarcode}
                        </code>
                        {barcodeFound && (
                          <span className="text-emerald-400/70 text-xs mt-1">Found in registry</span>
                        )}
                      </div>
                    ) : barcodeSkipped ? (
                      <div className="h-full flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z" opacity="0.4"/>
                          </svg>
                          <span className="text-gray-500 text-sm font-medium">No Barcode</span>
                        </div>
                        <p className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors">
                          Skipped - tap to add
                        </p>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z" opacity="0.4"/>
                          </svg>
                          <span className="text-red-400 text-sm font-medium">No Barcode</span>
                        </div>
                        <p className="text-red-400/70 text-sm group-hover:text-red-400 transition-colors">
                          Tap to scan or skip
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status indicators */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                  <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                    imagePreview && importResult?.success 
                      ? "bg-emerald-900/30 text-emerald-400" 
                      : imagePreview && aiAnalysisSkipped
                        ? "bg-blue-900/30 text-blue-400"
                        : "bg-red-900/30 text-red-400"
                  }`}>
                    <span>{imagePreview && (importResult?.success || aiAnalysisSkipped) ? "✓" : "✗"}</span>
                    <span>{imagePreview && importResult?.success ? "AI Analyzed" : imagePreview && aiAnalysisSkipped ? "Manual" : "Photo"}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                    scannedBarcode 
                      ? "bg-emerald-900/30 text-emerald-400" 
                      : barcodeSkipped 
                        ? "bg-gray-700 text-gray-400"
                        : "bg-yellow-900/30 text-yellow-400"
                  }`}>
                    <span>{scannedBarcode ? "✓" : barcodeSkipped ? "—" : "?"}</span>
                    <span>{scannedBarcode ? "Barcode" : barcodeSkipped ? "No barcode" : "Barcode needed"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Bottle Name"
                  maxLength={64}
                  className="input-amber"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Enter Brand"
                  className="input-amber"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Flavor Profile</label>
                <input
                  type="text"
                  value={flavorProfile}
                  onChange={(e) => setFlavorProfile(e.target.value)}
                  placeholder="Enter Flavor Profile"
                  className="input-amber"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Spirit Type *</label>
                <SpiritTypeSelect
                  selectedSpiritType={spiritType}
                  onSpiritTypeChange={setSpiritType}
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Capacity (ml) *</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Enter Capacity (ml)"
                  className="input-amber"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {!isEditMode && (
                <ActionButton
                  onClick={() => goToStep("photo")}
                  variant="cancel"
                >
                  ← Back
                </ActionButton>
              )}
              <ActionButton onClick={handleSubmit} variant="confirm" size="lg">
                {isEditMode ? "Update Bottle" : "Save Bottle"}
              </ActionButton>
              {isEditMode && onEditComplete && (
                <ActionButton onClick={onEditComplete} variant="cancel" size="lg">
                  Cancel
                </ActionButton>
              )}
            </div>

            {/* Start over link */}
            {!isEditMode && (
              <button
                onClick={resetFlow}
                className="w-full text-center text-gray-500 hover:text-gray-400 text-sm mt-2"
              >
                Start over
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <PageHeader title={isEditMode ? "Edit Bottle" : "Add New Bottle"} />

      {/* Step Slider */}
      {renderStepSlider()}

      {/* Step Content */}
      <div className="w-full">
        {renderStepContent()}
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
