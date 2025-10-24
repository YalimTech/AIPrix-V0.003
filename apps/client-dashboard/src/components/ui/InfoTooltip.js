import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
const InfoTooltip = ({ content, className = "", }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = React.useRef(null);
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
            if (left < 10)
                left = 10;
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
        }, 100);
        setTimeoutId(id);
    };
    return (_jsxs("div", { className: `relative inline-block ${className}`, children: [_jsx("div", { ref: buttonRef, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, className: "inline-flex items-center cursor-help", children: _jsx(QuestionMarkCircleIcon, { className: "w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" }) }), isVisible && (_jsx("div", { className: "fixed pointer-events-none", style: {
                    zIndex: 10001,
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                }, children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute top-full left-1/2 -translate-x-1/2 -mt-1", children: _jsx("div", { className: "w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800", style: {
                                    borderLeftWidth: "6px",
                                    borderRightWidth: "6px",
                                    borderTopWidth: "6px",
                                } }) }), _jsx("div", { className: "bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl w-80 leading-relaxed whitespace-normal break-words", children: content })] }) }))] }));
};
export default InfoTooltip;
