interface SpiritType {
  id: number;
  name: string;
}

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
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSelected
                  ? "bg-emerald-700 text-emerald-100 hover:bg-emerald-600 focus:ring-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.4)]"
                  : "bg-amber-700 text-amber-100 hover:bg-amber-600 focus:ring-amber-500 shadow-[0_0_10px_2px_rgba(245,158,11,0.4)]"
              }`}
              onMouseEnter={(e) => {
                if (isSelected) {
                  e.currentTarget.style.boxShadow = '0 0 15px 3px rgba(16, 185, 129, 0.6)';
                } else {
                  e.currentTarget.style.boxShadow = '0 0 15px 3px rgba(245, 158, 11, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (isSelected) {
                  e.currentTarget.style.boxShadow = '0 0 10px 2px rgba(16, 185, 129, 0.4)';
                } else {
                  e.currentTarget.style.boxShadow = '0 0 10px 2px rgba(245, 158, 11, 0.4)';
                }
              }}
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

