import { ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: (SearchableSelectOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const getOptionValue = (option: SearchableSelectOption | string) =>
    typeof option === "string" ? option : option.value;
  
  const getOptionLabel = (option: SearchableSelectOption | string) =>
    typeof option === "string" ? option : option.label;

  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelect = (option: SearchableSelectOption | string) => {
    onChange(getOptionValue(option));
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedOption = options.find((opt) => getOptionValue(opt) === value);
  const displayLabel = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className="w-full px-4 py-2.5 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>{displayLabel}</span>
        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
          <div className="p-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="text"
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ul className="overflow-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={getOptionValue(option)}
                  className="px-4 py-2 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelect(option)}
                >
                  {getOptionLabel(option)}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-gray-500">No options found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
