import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChartBarIcon, HomeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../components/ui/Button";
import { useAvailableCountries, useAvailablePhoneNumbers, useBuyPhoneNumber, } from "../hooks/usePhoneNumbers";
// Hook para debouncing
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}
// Componente profesional para mostrar banderas usando SVG desde CDN
const CountryFlag = ({ countryCode, className = "", }) => {
    return (_jsx("img", { src: `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`, srcSet: `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png 2x`, width: "24", height: "18", alt: `${countryCode} flag`, className: `inline-block ${className}`, style: { objectFit: "cover", borderRadius: "2px" } }));
};
const BuyPhoneNumber = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [startsWith, setStartsWith] = useState("");
    const [endsWith, setEndsWith] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("US");
    const [selectedNumberType, setSelectedNumberType] = useState("local");
    const [capabilities, setCapabilities] = useState(() => {
        try {
            const savedCapabilities = localStorage.getItem("phoneNumberCapabilities");
            return savedCapabilities
                ? JSON.parse(savedCapabilities)
                : { voice: true, sms: true, mms: false, fax: false, beta: false };
        }
        catch (error) {
            console.error("Error reading capabilities from localStorage", error);
            return { voice: true, sms: true, mms: false, fax: false, beta: false };
        }
    });
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = useState("");
    const dropdownRef = useRef(null);
    // Debounce los términos de búsqueda para evitar llamadas excesivas a la API
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedStartsWith = useDebounce(startsWith, 500);
    const debouncedEndsWith = useDebounce(endsWith, 500);
    // Guardar capabilities en localStorage cada vez que cambien
    useEffect(() => {
        try {
            localStorage.setItem("phoneNumberCapabilities", JSON.stringify(capabilities));
        }
        catch (error) {
            console.error("Error saving capabilities to localStorage", error);
        }
    }, [capabilities]);
    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target)) {
                setIsCountryDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const searchParams = useMemo(() => {
        return {
            country: selectedCountry,
            numberType: selectedNumberType,
            search: debouncedSearchTerm.trim() || undefined,
            startsWith: debouncedStartsWith.trim() || undefined,
            endsWith: debouncedEndsWith.trim() || undefined,
            voiceEnabled: capabilities.voice,
            smsEnabled: capabilities.sms,
            mmsEnabled: capabilities.mms,
            faxEnabled: capabilities.fax,
            beta: capabilities.beta,
        };
    }, [
        debouncedSearchTerm,
        debouncedStartsWith,
        debouncedEndsWith,
        selectedCountry,
        selectedNumberType,
        capabilities,
    ]);
    const { data: availableNumbers, isLoading, error, refetch, } = useAvailablePhoneNumbers(searchParams);
    const handleRefresh = () => {
        refetch({ cancelRefetch: false });
    };
    const buyPhoneNumber = useBuyPhoneNumber();
    const { data: availableCountries, isLoading: countriesLoading, error: countriesError, } = useAvailableCountries();
    // Obtener información específica del país seleccionado
    // const {
    //   data: countryInfo,
    //   isLoading: countryInfoLoading,
    //   error: countryInfoError,
    // } = useCountryInfo(selectedCountry);
    // Obtener precios reales de Twilio para el país seleccionado
    // const {
    //   data: countryPricing,
    //   isLoading: pricingLoading,
    //   error: pricingError,
    // } = useCountryPricing(selectedCountry);
    // Usar países reales de Twilio o lista de fallback
    const countries = availableCountries || [];
    // Función para obtener el nombre del país seleccionado
    const getCountryName = (countryCode) => {
        if (!countries || !Array.isArray(countries)) {
            return "United States"; // Default to United States
        }
        const country = countries.find((c) => c.code === countryCode);
        return country ? country.name : "United States"; // Default to United States
    };
    // Función para obtener el mensaje de error apropiado
    const getErrorMessage = (error) => {
        if (!error)
            return null;
        const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
        // Detectar diferentes tipos de errores de Twilio
        if (errorMessage.includes("TWILIO_CREDENTIALS_NOT_CONFIGURED")) {
            return {
                type: "credentials_not_configured",
                title: "Credenciales de Twilio no configuradas",
                message: "Por favor, configura tus credenciales de Twilio en la sección de Ajustes para poder ver los países disponibles.",
                action: "Ir a Ajustes",
                actionUrl: "/settings",
            };
        }
        if (errorMessage.includes("TWILIO_INVALID_CREDENTIALS")) {
            return {
                type: "invalid_credentials",
                title: "Credenciales de Twilio inválidas",
                message: "Las credenciales de Twilio configuradas son inválidas. Por favor, verifica tus credenciales en la sección de Ajustes.",
                action: "Ir a Ajustes",
                actionUrl: "/settings",
            };
        }
        if (errorMessage.includes("TWILIO_CONNECTION_ERROR")) {
            return {
                type: "connection_error",
                title: "Error de conexión",
                message: "No se pudo conectar con la API de Twilio. Verifica tu conexión a internet.",
                action: null,
                actionUrl: null,
            };
        }
        // Error genérico
        return {
            type: "generic_error",
            title: "Error cargando países",
            message: errorMessage,
            action: null,
            actionUrl: null,
        };
    };
    const errorInfo = getErrorMessage(countriesError);
    const [purchasingNumbers, setPurchasingNumbers] = useState(new Set());
    const handlePurchase = async (phoneNumber) => {
        try {
            // Agregar el número a la lista de números siendo comprados
            setPurchasingNumbers((prev) => new Set(prev).add(phoneNumber));
            await buyPhoneNumber.mutateAsync({
                number: phoneNumber,
                country: selectedCountry || "US",
            });
            // Refrescar la lista de números disponibles después de la compra
            handleRefresh();
            // Mostrar mensaje de éxito
            alert(`✅ ¡Número comprado exitosamente!\n\nNúmero: ${phoneNumber}\n\nPuedes verlo en la sección "Purchased Phone Numbers".`);
            console.log("Número comprado exitosamente:", phoneNumber);
        }
        catch (error) {
            console.error("Error purchasing phone number:", error);
            // Mostrar mensaje específico según el tipo de error
            let errorMessage = "Error al comprar el número";
            if (error.message) {
                if (error.message.includes("Error 21422")) {
                    errorMessage =
                        "Este número mágico de prueba está diseñado para generar un error 'No disponible'. Esto es normal en las pruebas de Twilio.";
                }
                else if (error.message.includes("Error 21421")) {
                    errorMessage =
                        "Este número mágico de prueba está diseñado para generar un error 'Número inválido'. Esto es normal en las pruebas de Twilio.";
                }
                else if (error.message.includes("Error 21612")) {
                    errorMessage =
                        "Este número mágico de prueba está diseñado para generar un error 'No se puede enrutar'. Esto es normal en las pruebas de Twilio.";
                }
                else if (error.message.includes("Error 21408")) {
                    errorMessage =
                        "Este número mágico de prueba está diseñado para generar un error 'Sin permisos internacionales'. Esto es normal en las pruebas de Twilio.";
                }
                else if (error.message.includes("Error 21610")) {
                    errorMessage =
                        "Este número mágico de prueba está diseñado para generar un error 'Número bloqueado'. Esto es normal en las pruebas de Twilio.";
                }
                else {
                    errorMessage = error.message;
                }
            }
            // TODO: Mostrar toast o modal con el mensaje de error
            alert(errorMessage);
        }
        finally {
            // Remover el número de la lista de números siendo comprados
            setPurchasingNumbers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(phoneNumber);
                return newSet;
            });
        }
    };
    // Usar datos reales de la API - NO hay datos hardcodeados
    const numbers = availableNumbers || [];
    // Los filtros de capacidades ya se aplican en el backend, no necesitamos filtrar aquí
    const filteredNumbers = numbers;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("nav", { className: "flex", "aria-label": "Breadcrumb", children: _jsxs("ol", { className: "inline-flex items-center space-x-1 md:space-x-3", children: [_jsx("li", { className: "inline-flex items-center", children: _jsxs("a", { href: "/dashboard", className: "text-gray-700 hover:text-blue-600", children: [_jsx(HomeIcon, { className: "w-4 h-4 mr-2" }), "Dashboard"] }) }), _jsx("li", { children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "w-6 h-6 text-gray-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }), _jsx("span", { className: "ml-1 text-gray-500 md:ml-2", children: "Phone Numbers" })] }) })] }) }), _jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Phone Numbers" }) }), _jsx("div", { className: "border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", children: [_jsxs("a", { href: "/purchased-numbers", className: "whitespace-nowrap py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center", children: [_jsx(ChartBarIcon, { className: "w-4 h-4 mr-1" }), "Purchased Phone Numbers"] }), _jsxs("a", { href: "/buy-number", className: "whitespace-nowrap py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 flex items-center", children: [_jsx(PhoneIcon, { className: "w-4 h-4 mr-1" }), "Buy Phone Numbers"] })] }) }), filteredNumbers.length === 0 && !isLoading && !error && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4 mb-4", children: _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(PhoneIcon, { className: "h-5 w-5 text-blue-400" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-blue-800", children: "No numbers available" }), _jsx("div", { className: "mt-2 text-sm text-blue-700", children: _jsxs("p", { children: ["We couldn't find any numbers that matched your search criteria. You can retry with different search terms or learn more about how to", " ", _jsx("a", { href: "https://twlo.my.salesforce-sites.com/PrivateOffering", target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:text-blue-800 underline", children: "request an exclusive number" }), ". For countries not listed, you can request an exclusive number directly through Twilio. Please be aware that some countries require additional documentation due to local regulations."] }) })] })] }) })), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-end gap-4", children: [_jsx("div", { className: "flex items-center", children: _jsx("label", { className: "text-sm font-medium text-gray-700 whitespace-nowrap", children: "Filter By:" }) }), _jsxs("div", { className: "w-80 relative", children: [_jsx("input", { type: "text", placeholder: "Buscar por c\u00F3digo de \u00E1rea (ej: 212) o estado (ej: New York)", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" }), searchTerm !== debouncedSearchTerm && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: _jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" }) }))] }), _jsxs("div", { className: "w-48 relative", children: [_jsx("input", { type: "text", placeholder: "Prefijo local (ej: 555)", value: startsWith, onChange: (e) => setStartsWith(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" }), startsWith !== debouncedStartsWith && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: _jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" }) }))] }), _jsxs("div", { className: "w-48 relative", children: [_jsx("input", { type: "text", placeholder: "Termina con (ej: 1234)", value: endsWith, onChange: (e) => setEndsWith(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" }), endsWith !== debouncedEndsWith && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: _jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" }) }))] }), _jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { type: "button", onClick: () => setIsCountryDropdownOpen(!isCountryDropdownOpen), className: "w-full lg:w-48 px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(CountryFlag, { countryCode: selectedCountry, className: "mr-2 flex-shrink-0" }), _jsx("span", { className: "text-sm truncate", children: getCountryName(selectedCountry) })] }), _jsx("svg", { className: `w-4 h-4 text-gray-400 transition-transform ${isCountryDropdownOpen ? "rotate-180" : ""}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), isCountryDropdownOpen && (_jsxs("div", { className: "absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col", children: [_jsx("div", { className: "p-2 border-b border-gray-200", children: _jsx("input", { type: "text", placeholder: "Buscar pa\u00EDs...", value: countrySearchTerm, onChange: (e) => setCountrySearchTerm(e.target.value), className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", autoFocus: true }) }), _jsx("div", { className: "overflow-y-auto max-h-52", children: countriesLoading ? (_jsxs("div", { className: "px-3 py-2 text-center text-gray-500", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto" }), _jsx("span", { className: "text-sm ml-2", children: "Cargando pa\u00EDses..." })] })) : countriesError && errorInfo ? (_jsx("div", { className: "px-3 py-3", children: _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-md p-3", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-yellow-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3 flex-1", children: [_jsx("h3", { className: "text-sm font-medium text-yellow-800", children: errorInfo.title }), _jsx("div", { className: "mt-2 text-sm text-yellow-700", children: _jsx("p", { children: errorInfo.message }) }), errorInfo.action && errorInfo.actionUrl && (_jsx("div", { className: "mt-3", children: _jsxs("a", { href: errorInfo.actionUrl, className: "text-sm font-medium text-yellow-800 hover:text-yellow-900 underline", children: [errorInfo.action, " \u2192"] }) }))] })] }) }) })) : countries && Array.isArray(countries) ? ((() => {
                                                    // Filtrar países basándose en el término de búsqueda
                                                    const filteredCountries = countries.filter((country) => {
                                                        const searchLower = countrySearchTerm.toLowerCase();
                                                        return (country.name.toLowerCase().startsWith(searchLower) ||
                                                            country.code.toLowerCase().startsWith(searchLower));
                                                    });
                                                    if (filteredCountries.length === 0) {
                                                        return (_jsx("div", { className: "px-3 py-2 text-center text-gray-500 text-sm", children: "No se encontraron pa\u00EDses" }));
                                                    }
                                                    return filteredCountries.map((country) => (_jsxs("button", { type: "button", onClick: () => {
                                                            setSelectedCountry(country.code);
                                                            setIsCountryDropdownOpen(false);
                                                            setCountrySearchTerm("");
                                                        }, disabled: !country.supported, className: `w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center ${selectedCountry === country.code
                                                            ? "bg-blue-100 text-blue-700"
                                                            : country.supported
                                                                ? "text-gray-900"
                                                                : "text-gray-400 cursor-not-allowed"}`, children: [_jsx(CountryFlag, { countryCode: country.code, className: "mr-2 flex-shrink-0" }), _jsxs("div", { className: "flex-1", children: [_jsx("span", { className: "text-sm", children: country.name }), !country.supported && (_jsx("span", { className: "text-xs text-orange-600 ml-2", children: "(Requiere solicitud especial)" }))] })] }, country.code)));
                                                })()) : (_jsx("div", { className: "px-3 py-2 text-center text-gray-500 text-sm", children: "No hay pa\u00EDses disponibles" })) })] }))] }), _jsx("div", { className: "flex", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { onClick: () => setSelectedNumberType("local"), className: `px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedNumberType === "local"
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "bg-white text-gray-700 hover:bg-gray-50"}`, children: "Local" }), _jsx("button", { onClick: () => setSelectedNumberType("tollFree"), className: `px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedNumberType === "tollFree"
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "bg-white text-gray-700 hover:bg-gray-50"}`, children: "Toll-Free" })] }) }), _jsx("div", { className: "flex", children: _jsxs("button", { onClick: handleRefresh, disabled: isLoading, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap", children: [_jsx("svg", { className: `w-4 h-4 ${isLoading ? "animate-spin" : ""}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }), isLoading ? "Loading..." : "Refresh"] }) })] }), _jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex items-center gap-6", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Options" }), _jsxs("div", { className: "flex items-center space-x-6", children: [_jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: capabilities.voice, onChange: (e) => setCapabilities({
                                                        ...capabilities,
                                                        voice: e.target.checked,
                                                    }), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "text-sm text-gray-700", children: "Voice" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: capabilities.sms, onChange: (e) => setCapabilities({ ...capabilities, sms: e.target.checked }), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "text-sm text-gray-700", children: "SMS" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: capabilities.mms, onChange: (e) => setCapabilities({ ...capabilities, mms: e.target.checked }), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "text-sm text-gray-700", children: "MMS" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: capabilities.fax, onChange: (e) => setCapabilities({ ...capabilities, fax: e.target.checked }), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "text-sm text-gray-700", children: "Fax" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: capabilities.beta, onChange: (e) => setCapabilities((prev) => ({
                                                        ...prev,
                                                        beta: e.target.checked,
                                                    })), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "text-sm text-gray-700", children: "Include Beta Numbers" })] })] })] }) })] }), _jsx("div", { className: "bg-white shadow rounded-lg", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Number" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Type" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Voice" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "SMS" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "MMS" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Fax" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Address Requirement" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Monthly fee" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Purchase numbers" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: isLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 9, className: "px-6 py-12 text-center text-gray-500", children: _jsxs("div", { className: "flex items-center justify-center", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2" }), "Cargando n\u00FAmeros disponibles..."] }) }) })) : filteredNumbers.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 9, className: "px-6 py-12 text-center text-gray-500", children: error ? (_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-red-600 mb-6", children: [_jsx("div", { className: "mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4", children: _jsx(PhoneIcon, { className: "w-8 h-8 text-red-500" }) }), _jsx("p", { className: "text-xl font-semibold mb-2", children: "Error cargando n\u00FAmeros" }), _jsx("p", { className: "text-sm text-gray-600", children: error.message?.includes("TWILIO_CREDENTIALS_NOT_CONFIGURED")
                                                                ? "Por favor, configura tus credenciales de Twilio en la sección de Ajustes para poder buscar números disponibles."
                                                                : error.message })] }), error.message?.includes("Credenciales de Twilio no configuradas") && (_jsx("div", { className: "max-w-2xl mx-auto", children: _jsxs("div", { className: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl shadow-lg overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4", children: _jsx(PhoneIcon, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-white", children: "Conecta tu Cuenta de Twilio" }), _jsx("p", { className: "text-blue-100 text-sm", children: "Configura tus credenciales para acceder a n\u00FAmeros telef\u00F3nicos" })] })] }) }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center", children: _jsx("svg", { className: "w-6 h-6 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-2", children: "\u00BFPor qu\u00E9 necesito conectar Twilio?" }), _jsx("p", { className: "text-gray-700 leading-relaxed", children: "Twilio es la plataforma que nos permite acceder a n\u00FAmeros telef\u00F3nicos reales de todo el mundo. Al conectar tu cuenta, podr\u00E1s ver y comprar n\u00FAmeros disponibles para tus agentes de IA." })] })] }) }), _jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-6 mb-6", children: [_jsxs("h5", { className: "font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx("span", { className: "w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-3", children: "\u2699\uFE0F" }), "C\u00F3mo configurar Twilio en 4 pasos simples:"] }), _jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center", children: "1" }) }), _jsx("div", { className: "flex-1", children: _jsxs("p", { className: "text-gray-700", children: ["Ve a", " ", _jsx("strong", { className: "text-blue-600", children: "Configuraci\u00F3n" }), " ", "en el men\u00FA lateral"] }) })] }), _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center", children: "2" }) }), _jsx("div", { className: "flex-1", children: _jsxs("p", { className: "text-gray-700", children: ["Busca la secci\u00F3n", " ", _jsx("strong", { className: "text-blue-600", children: "\"Integraci\u00F3n Twilio\"" })] }) })] }), _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center", children: "3" }) }), _jsx("div", { className: "flex-1", children: _jsxs("p", { className: "text-gray-700", children: ["Ingresa tu", " ", _jsx("strong", { className: "text-blue-600", children: "Account SID" }), " ", "y", " ", _jsx("strong", { className: "text-blue-600", children: "Auth Token" })] }) })] }), _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "w-8 h-8 bg-green-500 text-white text-sm font-bold rounded-full flex items-center justify-center", children: "\u2713" }) }), _jsx("div", { className: "flex-1", children: _jsx("p", { className: "text-gray-700", children: "Guarda la configuraci\u00F3n y regresa aqu\u00ED para comenzar" }) })] })] })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsx("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "text-amber-500 text-xl", children: "\uD83D\uDCA1" }) }), _jsxs("div", { children: [_jsx("h6", { className: "font-medium text-amber-800 mb-1", children: "\u00BFD\u00F3nde encontrar mis credenciales?" }), _jsxs("p", { className: "text-sm text-amber-700", children: ["Ve al", " ", _jsx("a", { href: "https://console.twilio.com/", target: "_blank", rel: "noopener noreferrer", className: "underline hover:text-amber-900 font-medium", children: "Console de Twilio" }), " ", "y busca tu Account SID y Auth Token."] })] })] }) }), _jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "text-green-500 text-xl", children: "\uD83C\uDF89" }) }), _jsxs("div", { children: [_jsx("h6", { className: "font-medium text-green-800 mb-1", children: "\u00BFNo tienes cuenta de Twilio?" }), _jsxs("p", { className: "text-sm text-green-700", children: [_jsx("a", { href: "https://www.twilio.com/try-twilio", target: "_blank", rel: "noopener noreferrer", className: "underline hover:text-green-900 font-medium", children: "Reg\u00EDstrate gratis" }), " ", "y obt\u00E9n $15 de cr\u00E9dito inicial."] })] })] }) })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("a", { href: "/settings", className: "inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl", children: [_jsxs("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] }), "Ir a Configuraci\u00F3n"] }) })] })] }) })), error.message?.includes("requiere una solicitud especial") && (_jsxs("div", { className: "mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-left", children: [_jsx("h4", { className: "text-sm font-medium text-yellow-800 mb-2", children: "\uD83D\uDCCB Request for an Exclusive Number Required" }), _jsxs("div", { className: "text-sm text-yellow-700 space-y-2", children: [_jsx("p", { children: "Este pa\u00EDs requiere un \"Request for an Exclusive Number\" a Twilio. Los n\u00FAmeros no est\u00E1n disponibles directamente en el listado regular." }), _jsxs("div", { className: "bg-white p-3 rounded border border-yellow-300", children: [_jsxs("p", { className: "font-medium mb-2", children: ["Para solicitar n\u00FAmeros en", " ", getCountryName(selectedCountry), ":"] }), _jsxs("ol", { className: "list-decimal list-inside space-y-1 text-xs", children: [_jsx("li", { children: "Contacta al soporte de Twilio" }), _jsx("li", { children: "Proporciona informaci\u00F3n sobre el uso previsto" }), _jsx("li", { children: "Env\u00EDa documentaci\u00F3n de respaldo" }), _jsx("li", { children: "Espera la aprobaci\u00F3n de Twilio" })] })] }), _jsxs("p", { className: "text-xs", children: [_jsx("strong", { children: "Contacto Twilio:" }), " ", "support@twilio.com o +1 (415) 390-0000"] })] })] })), _jsx("button", { onClick: handleRefresh, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500", children: "Reintentar" })] })) : (_jsxs("div", { children: [_jsx(PhoneIcon, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-900 mb-2", children: "No numbers available" }), _jsx("p", { className: "text-gray-500 mb-4", children: "No numbers were found for the selected criteria." }), _jsxs("div", { className: "text-sm text-gray-400 space-y-1", children: [_jsx("p", { children: "\u2022 Verify that the selected country is supported by Twilio" }), _jsx("p", { children: "\u2022 Try a different area code" }), _jsx("p", { children: "\u2022 Make sure your Twilio credentials are configured" }), _jsx("p", { children: "\u2022 Some countries require \"Request for an Exclusive Number\" to Twilio" })] }), _jsx("div", { className: "mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md", children: _jsxs("p", { className: "text-sm text-blue-700", children: [_jsx("strong", { children: "\uD83D\uDCA1 Tip:" }), " If you don't see available numbers, check your Twilio configuration in the Settings section."] }) })] })) }) })) : Array.isArray(filteredNumbers) ? (filteredNumbers.map((number, index) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CountryFlag, { countryCode: number.country, className: "mr-3 flex-shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: number.number }), _jsx("div", { className: "text-xs text-gray-500", children: number.locality && number.region ? (_jsxs("span", { children: [number.locality, ", ", number.region, ",", " ", number.country] })) : number.region ? (_jsxs("span", { children: [number.region, ", ", number.country] })) : (_jsx("span", { className: "text-gray-400", children: "N/A" })) }), number.friendlyName &&
                                                                number.friendlyName !== number.number && (_jsx("div", { className: "text-xs text-gray-400", children: number.friendlyName }))] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: _jsxs("div", { className: "flex items-center", children: [number.numberType === "local" && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "\uD83D\uDCDE Local" })), number.numberType === "tollFree" && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: "\uD83C\uDD93 Toll Free" })), number.numberType === "mobile" && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800", children: "\uD83D\uDCF1 Mobile" })), !number.numberType && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800", children: "\uD83D\uDCDE Local" }))] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-center", children: number.capabilities.includes("voice") ? (_jsx("svg", { className: "w-4 h-4 mx-auto text-green-600", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" }) })) : (_jsx("span", { className: "text-gray-300", children: "\u2014" })) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-center", children: number.capabilities.includes("sms") ? (_jsx("svg", { className: "w-4 h-4 mx-auto text-blue-600", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z", clipRule: "evenodd" }) })) : (_jsx("span", { className: "text-gray-300", children: "\u2014" })) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-center", children: number.capabilities.includes("mms") ? (_jsx("svg", { className: "w-4 h-4 mx-auto text-purple-600", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z", clipRule: "evenodd" }) })) : (_jsx("span", { className: "text-gray-300", children: "\u2014" })) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-center", children: _jsx("span", { className: "text-gray-300", children: "\u2014" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "None" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: _jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [number.price
                                                                ? `$${number.price.toFixed(2)}/mo`
                                                                : "N/A", number.isMagicNumber && (_jsx("span", { className: "text-xs text-blue-600 ml-1", children: "(Magic Number)" })), number.isTestAccount && !number.isMagicNumber && (_jsx("span", { className: "text-xs text-orange-600 ml-1", children: "(Test Account)" }))] }), number.setupPrice && number.setupPrice > 0 && (_jsxs("div", { className: "text-xs text-gray-400", children: ["+$", number.setupPrice.toFixed(2), " setup"] }))] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-center", children: _jsx(Button, { size: "sm", variant: "outline", onClick: () => handlePurchase(number.number), disabled: purchasingNumbers.has(number.number), className: "border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50", children: purchasingNumbers.has(number.number)
                                                    ? "Purchasing..."
                                                    : "Buy" }) })] }, index)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 10, className: "px-6 py-4 text-center text-gray-500", children: "Error cargando n\u00FAmeros disponibles" }) })) })] }) }) })] }));
};
export default BuyPhoneNumber;
