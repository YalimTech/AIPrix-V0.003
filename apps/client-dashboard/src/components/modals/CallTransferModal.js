import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useAvailableCountries } from "../../hooks/usePhoneNumbers";
import { getCountryCode } from "../../utils/countryCodes";
import CountryFlag from "../ui/CountryFlag";
import InfoTooltip from "../ui/InfoTooltip";
const CallTransferModal = ({ isOpen, onClose, onSave, }) => {
    const [businessHours, setBusinessHours] = useState(false);
    const [transferType, setTransferType] = useState("keyword");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [newKeyword, setNewKeyword] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("US");
    const [isCountryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const { data: countries = [] } = useAvailableCountries();
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target)) {
                setCountryDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleAddKeyword = () => {
        if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
            setKeywords([...keywords, newKeyword.trim()]);
            setNewKeyword("");
        }
    };
    const handleRemoveKeyword = (keywordToRemove) => {
        setKeywords(keywords.filter((keyword) => keyword !== keywordToRemove));
    };
    const handleReset = () => {
        setBusinessHours(false);
        setTransferType("keyword");
        setPhoneNumber("");
        setKeywords([]);
        setNewKeyword("");
        setSelectedCountry("US");
    };
    const handleSave = () => {
        const countryCode = getCountryCode(selectedCountry);
        const fullNumber = `+${countryCode}${phoneNumber}`;
        onSave({
            businessHours,
            type: transferType,
            phoneNumber: fullNumber,
            keywords,
        });
        onClose();
    };
    if (!isOpen)
        return null;
    const filteredCountries = countries.filter((c) => c.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(countrySearchTerm.toLowerCase()));
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { backgroundColor: "rgba(0, 0, 0, 0.5)" }, onClick: onClose, children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-5 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Call Transfer" }), _jsx("button", { onClick: onClose, className: "p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors", children: _jsx(XMarkIcon, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "px-6 py-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Allow transfer only during business hours" }), _jsx(InfoTooltip, { content: "Enable this to only allow call transfers during configured business hours.", className: "ml-0" })] }), _jsx("button", { onClick: () => setBusinessHours(!businessHours), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${businessHours ? "bg-blue-600" : "bg-gray-300"}`, children: _jsx("span", { className: `inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${businessHours ? "translate-x-6" : "translate-x-0.5"}` }) })] }), _jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Prompt Based" }), _jsx(InfoTooltip, { content: "AI determines transfer based on conversation context.", className: "ml-0" })] }), _jsx("button", { onClick: () => setTransferType(transferType === "prompt" ? "keyword" : "prompt"), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${transferType === "keyword" ? "bg-blue-600" : "bg-gray-300"}`, children: _jsx("span", { className: `inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${transferType === "keyword"
                                            ? "translate-x-6"
                                            : "translate-x-0.5"}` }) }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Keyword Based (More reliable)" }), _jsx(InfoTooltip, { content: "Transfer is triggered by specific keywords spoken during the call.", className: "ml-0" })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "To Phone Number" }), _jsxs("div", { className: "relative flex", children: [_jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { onClick: () => setCountryDropdownOpen(!isCountryDropdownOpen), className: "flex items-center gap-2 pl-3 pr-2 py-2.5 h-full bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg", children: [_jsx(CountryFlag, { countryCode: selectedCountry, className: "w-6 h-auto" }), _jsxs("span", { className: "text-sm text-gray-700 font-medium", children: ["+", getCountryCode(selectedCountry)] }), _jsx("svg", { className: "w-4 h-4 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), isCountryDropdownOpen && (_jsxs("div", { className: "absolute z-10 top-full mt-1 w-72 bg-white rounded-md shadow-lg border max-h-60 overflow-y-auto", children: [_jsx("div", { className: "p-2", children: _jsx("input", { type: "text", placeholder: "Search country...", value: countrySearchTerm, onChange: (e) => setCountrySearchTerm(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm" }) }), _jsx("ul", { children: filteredCountries.map((country) => (_jsxs("li", { onClick: () => {
                                                                    setSelectedCountry(country.code);
                                                                    setCountryDropdownOpen(false);
                                                                    setCountrySearchTerm("");
                                                                }, className: "flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer", children: [_jsx(CountryFlag, { countryCode: country.code, className: "w-6 h-auto" }), _jsx("span", { className: "text-sm font-medium text-gray-800", children: country.name }), _jsxs("span", { className: "text-sm text-gray-500", children: ["(+", getCountryCode(country.code), ")"] })] }, country.code))) })] }))] }), _jsx("input", { type: "tel", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), placeholder: "Enter phone number", className: "flex-1 w-full px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" })] })] }), transferType === "keyword" && (_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Keywords to trigger transfer" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: newKeyword, onChange: (e) => setNewKeyword(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleAddKeyword(), placeholder: "Type a keyword and press Enter", className: "flex-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" }), _jsx("button", { onClick: handleAddKeyword, className: "px-4 py-2.5 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 font-medium text-sm", children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: keywords.map((keyword) => (_jsxs("div", { className: "flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1", children: [_jsx("span", { className: "text-sm text-gray-800", children: keyword }), _jsx("button", { onClick: () => handleRemoveKeyword(keyword), className: "text-gray-500 hover:text-gray-700", children: _jsx(XMarkIcon, { className: "w-3 h-3" }) })] }, keyword))) })] }))] }), _jsxs("div", { className: "flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200", children: [_jsx("button", { onClick: handleReset, className: "px-5 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors", children: "Reset" }), _jsx("button", { onClick: handleSave, className: "px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors", children: "Save" })] })] }) }));
};
export default CallTransferModal;
