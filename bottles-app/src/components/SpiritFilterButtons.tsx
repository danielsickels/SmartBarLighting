"use client";

import { useState } from "react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  if (spiritTypes.length === 0) {
    return null;
  }

  const selectedCount = selectedSpiritIds.length;

  // Bouncy cascade animation - twice as fast, expands space as buttons appear
  const getFilterItemStyle = (index: number) => ({
    maxWidth: isExpanded ? "200px" : "0px",
    padding: isExpanded ? undefined : "0px",
    opacity: isExpanded ? 1 : 0,
    overflow: "hidden" as const,
    whiteSpace: "nowrap" as const,
    transform: isExpanded ? "scale(1)" : "scale(0.8)",
    transition: `all 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) ${isExpanded ? index * 0.02 : (spiritTypes.length - index) * 0.01}s`,
    pointerEvents: isExpanded ? ("auto" as const) : ("none" as const),
  });

  return (
    <div className="w-full mb-4">
      <div className="flex flex-wrap gap-2 justify-left items-center">
        {/* Filter toggle button - stacked mini buttons icon */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="spirit-filter-btn spirit-filter-btn-default flex items-center gap-2"
        >
          <span>Filter{selectedCount > 0 ? ` (${selectedCount})` : ""}</span>
        </button>

        {/* Spirit type filter buttons with cascade animation */}
        {spiritTypes.map((spirit, index) => {
          const isSelected = selectedSpiritIds.includes(spirit.id);

          return (
            <button
              key={spirit.id}
              onClick={() => onToggleSpirit(spirit.id)}
              style={getFilterItemStyle(index)}
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
