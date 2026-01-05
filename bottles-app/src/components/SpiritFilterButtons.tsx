import { SpiritType } from "../services/spiritTypeService";

interface SpiritFilterButtonsProps {
  spiritTypes: SpiritType[];
  selectedSpiritIds: number[];
  onToggleSpirit: (spiritId: number) => void;
}

const SpiritFilterButtons = ({
  spiritTypes,
  selectedSpiritIds,
  onToggleSpirit,
}: SpiritFilterButtonsProps) => {
  if (spiritTypes.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-4">
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {spiritTypes.map((spirit) => {
          const isSelected = selectedSpiritIds.includes(spirit.id);
          
          return (
            <button
              key={spirit.id}
              onClick={() => onToggleSpirit(spirit.id)}
              className={`spirit-filter-btn ${isSelected ? "spirit-filter-btn-selected" : "spirit-filter-btn-default"}`}
            >
              {spirit.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SpiritFilterButtons;

