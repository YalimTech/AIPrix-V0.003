import React, { useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface InfoTooltipProps {
  content: string;
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    // Calculate position
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const tooltipWidth = 320; // w-80 = 320px
      const tooltipHeight = 120; // altura aproximada

      // Position above the icon, centered
      let top = rect.top - tooltipHeight - 10;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      // Adjust if goes off screen
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }
      if (top < 10) {
        // If not enough space above, show below
        top = rect.bottom + 10;
      }

      setPosition({ top, left });
    }

    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsVisible(false);
    }, 100) as unknown as number;
    setTimeoutId(id);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center cursor-help"
      >
        <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
      </div>

      {isVisible && (
        <div
          className="fixed pointer-events-none"
          style={{
            zIndex: 10001,
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="relative">
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div
                className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800"
                style={{
                  borderLeftWidth: "6px",
                  borderRightWidth: "6px",
                  borderTopWidth: "6px",
                }}
              ></div>
            </div>

            {/* Tooltip Content */}
            <div className="bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl w-80 leading-relaxed whitespace-normal break-words">
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
