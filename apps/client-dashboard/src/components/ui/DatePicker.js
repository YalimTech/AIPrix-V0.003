import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
const DatePicker = ({ value, onChange, placeholder, label, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const calendarRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current &&
                !containerRef.current.contains(event.target) &&
                calendarRef.current &&
                !calendarRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            // Calculate calendar position
            if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                const calendarWidth = 320; // w-80 = 320px
                const calendarHeight = 400; // altura aproximada del calendario
                let top = rect.bottom + 8;
                let left = rect.left;
                // Ajustar si se sale por la derecha
                if (left + calendarWidth > window.innerWidth) {
                    left = window.innerWidth - calendarWidth - 16;
                }
                // Ajustar si se sale por abajo
                if (top + calendarHeight > window.innerHeight) {
                    top = rect.top - calendarHeight - 8;
                }
                // Ajustar si se sale por arriba
                if (top < 0) {
                    top = 8;
                }
                // Ajustar si se sale por la izquierda
                if (left < 0) {
                    left = 8;
                }
                setCalendarPosition({
                    top,
                    left,
                });
            }
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);
    const parseDateValue = (dateStr) => {
        if (!dateStr)
            return null;
        // Try ISO format first (YYYY-MM-DD)
        if (dateStr.includes("-")) {
            const parts = dateStr.split("-");
            if (parts.length === 3) {
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
        }
        // Fallback to MM/DD/YYYY format
        const parts = dateStr.split("/");
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
        return null;
    };
    const selectedDate = parseDateValue(value);
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        const days = [];
        // Add empty cells for days before the first day of month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        return days;
    };
    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };
    const handleDayClick = (day) => {
        const month = (currentMonth.getMonth() + 1).toString().padStart(2, "0");
        const dayStr = day.toString().padStart(2, "0");
        const year = currentMonth.getFullYear();
        onChange(`${year}-${month}-${dayStr}`); // ISO format: YYYY-MM-DD
        setIsOpen(false);
    };
    const isSelectedDay = (day) => {
        if (!selectedDate)
            return false;
        return (day === selectedDate.getDate() &&
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear());
    };
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const days = getDaysInMonth(currentMonth);
    return (_jsxs("div", { ref: containerRef, className: "relative", children: [label && (_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-2", children: label })), _jsxs("div", { className: "relative", children: [_jsx("input", { ref: inputRef, type: "text", value: value, onChange: (e) => onChange(e.target.value), onClick: (e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }, placeholder: placeholder, className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer bg-white", readOnly: true }), _jsx(CalendarIcon, { className: "absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" })] }), isOpen && (_jsxs("div", { ref: calendarRef, className: "fixed z-[100] bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80", style: {
                    top: `${calendarPosition.top}px`,
                    left: `${calendarPosition.left}px`,
                }, children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("button", { onClick: handlePrevMonth, className: "p-1 hover:bg-gray-100 rounded transition-colors", children: _jsx(ChevronLeftIcon, { className: "w-5 h-5 text-gray-600" }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-base font-semibold text-gray-900", children: [monthNames[currentMonth.getMonth()], " ", currentMonth.getFullYear()] }), _jsx("button", { className: "p-1", children: _jsx("svg", { className: "w-4 h-4 text-gray-600", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", clipRule: "evenodd" }) }) })] }), _jsx("button", { onClick: handleNextMonth, className: "p-1 hover:bg-gray-100 rounded transition-colors", children: _jsx(ChevronRightIcon, { className: "w-5 h-5 text-gray-600" }) })] }), _jsx("div", { className: "grid grid-cols-7 mb-2", children: ["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (_jsx("div", { className: "text-center text-sm font-medium text-gray-600 py-2", children: day }, index))) }), _jsx("div", { className: "grid grid-cols-7 gap-1", children: days.map((day, index) => (_jsx("div", { className: "aspect-square", children: day ? (_jsx("button", { onClick: () => handleDayClick(day), className: `w-full h-full flex items-center justify-center rounded-full text-sm transition-colors ${isSelectedDay(day)
                                    ? "bg-blue-600 text-white font-semibold"
                                    : "text-gray-700 hover:bg-gray-100"}`, children: day })) : (_jsx("div", {})) }, index))) })] }))] }));
};
export default DatePicker;
