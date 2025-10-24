import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
const SearchableSelect = ({ options, value, onChange, placeholder = "Select an option", disabled = false, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    const getOptionValue = (option) => typeof option === "string" ? option : option.value;
    const getOptionLabel = (option) => typeof option === "string" ? option : option.label;
    const filteredOptions = options.filter((option) => getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase()));
    const handleSelect = (option) => {
        onChange(getOptionValue(option));
        setIsOpen(false);
        setSearchTerm("");
    };
    const selectedOption = options.find((opt) => getOptionValue(opt) === value);
    const displayLabel = selectedOption ? getOptionLabel(selectedOption) : placeholder;
    return (_jsxs("div", { className: "relative", ref: wrapperRef, children: [_jsxs("button", { type: "button", className: "w-full px-4 py-2.5 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed", onClick: () => !disabled && setIsOpen(!isOpen), disabled: disabled, children: [_jsx("span", { className: value ? "text-gray-900" : "text-gray-500", children: displayLabel }), _jsx(ChevronUpDownIcon, { className: "w-5 h-5 text-gray-400" })] }), isOpen && !disabled && (_jsxs("div", { className: "absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60", children: [_jsx("div", { className: "p-2", children: _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute inset-y-0 left-0 flex items-center pl-3", children: _jsx(MagnifyingGlassIcon, { className: "w-5 h-5 text-gray-400" }) }), _jsx("input", { type: "text", className: "w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm", placeholder: "Search...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }) }), _jsx("ul", { className: "overflow-auto max-h-48", children: filteredOptions.length > 0 ? (filteredOptions.map((option) => (_jsx("li", { className: "px-4 py-2 text-sm text-gray-900 cursor-pointer hover:bg-gray-100", onClick: () => handleSelect(option), children: getOptionLabel(option) }, getOptionValue(option))))) : (_jsx("li", { className: "px-4 py-2 text-sm text-gray-500", children: "No options found" })) })] }))] }));
};
export default SearchableSelect;
