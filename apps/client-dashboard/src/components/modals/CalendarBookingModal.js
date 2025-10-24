import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { QuestionMarkCircleIcon, XMarkIcon, } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import calLogo from "../../assets/images/cal-logo-word-black.svg";
import ghlLogo from "../../assets/images/gohighlevel-logo.svg";
import { apiClient } from "../../lib/api";
import SearchableSelect from "../ui/SearchableSelect";
const CalendarBookingModal = ({ isOpen, onClose, onSave, currentConfig, }) => {
    const [selectedProvider, setSelectedProvider] = useState("GHL");
    // GHL states
    const [calendarId, setCalendarId] = useState("");
    const [timezone, setTimezone] = useState("");
    const [calendars, setCalendars] = useState([]);
    const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
    const [ghlConfigured, setGhlConfigured] = useState(false);
    const [ghlManualMode, setGhlManualMode] = useState(false);
    const [ghlTriedFetch, setGhlTriedFetch] = useState(false);
    // Cal.com states
    const [username, setUsername] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [eventId, setEventId] = useState("");
    const [location, setLocation] = useState("Cal Video");
    const [enableRescheduling, setEnableRescheduling] = useState(false);
    const initializedRef = useRef(false);
    const previousConfigRef = useRef(undefined);
    // Reset initialized flag when modal opens or currentConfig changes
    useEffect(() => {
        if (isOpen && currentConfig !== previousConfigRef.current) {
            initializedRef.current = false;
            previousConfigRef.current = currentConfig;
        }
    }, [isOpen, currentConfig]);
    useEffect(() => {
        if (currentConfig && !initializedRef.current && isOpen) {
            if (currentConfig.provider !== selectedProvider) {
                setSelectedProvider(currentConfig.provider);
            }
            if (currentConfig.provider === "GHL") {
                setCalendarId(currentConfig.calendarId || "");
                setTimezone(currentConfig.timezone || "");
            }
            else if (currentConfig.provider === "Cal.com") {
                setUsername(currentConfig.username || "");
                setApiKey(currentConfig.apiKey || "");
                setEventId(currentConfig.eventId || "");
                setLocation(currentConfig.location || "Cal Video");
                setEnableRescheduling(currentConfig.enableRescheduling || false);
            }
            initializedRef.current = true;
        }
    }, [currentConfig, selectedProvider, isOpen]);
    useEffect(() => {
        const checkConfig = async () => {
            if (selectedProvider === "GHL" && isOpen) {
                setIsLoadingCalendars(true);
                try {
                    await apiClient.get("/integrations/ghl/config");
                    setGhlConfigured(true);
                    setGhlManualMode(false);
                }
                catch (_configError) {
                    setCalendars([]);
                    setGhlConfigured(false);
                    setGhlManualMode(true);
                }
                finally {
                    setIsLoadingCalendars(false);
                }
            }
        };
        checkConfig();
    }, [isOpen, selectedProvider]);
    const handleFetchGhlCalendars = async () => {
        setIsLoadingCalendars(true);
        setGhlTriedFetch(true);
        try {
            const response = await apiClient.get("/integrations/ghl/calendars");
            setCalendars(response.calendars || []);
            if (!response.calendars || response.calendars.length === 0) {
                setGhlManualMode(true);
            }
        }
        catch (_error) {
            // Si falla (p.ej. Invalid JWT), activar modo manual sin ruido
            setCalendars([]);
            setGhlManualMode(true);
        }
        finally {
            setIsLoadingCalendars(false);
        }
    };
    const timezones = [
        "Africa/Algiers",
        "Africa/Cairo",
        "Africa/Casablanca",
        "Africa/Harare",
        "Africa/Lagos",
        "Africa/Nairobi",
        "America/Argentina/Buenos_Aires",
        "America/Bahia_Banderas",
        "America/Belize",
        "America/Bogota",
        "America/Boise",
        "America/Cancun",
        "America/Caracas",
        "America/Chihuahua",
        "America/Chicago",
        "America/Denver",
        "America/Dawson",
        "America/Detroit",
        "America/Edmonton",
        "America/Glace_Bay",
        "America/Godthab",
        "America/Guatemala",
        "America/Indiana/Indianapolis",
        "America/Juneau",
        "America/Louisville",
        "America/Los_Angeles",
        "America/Manaus",
        "America/Managua",
        "America/Mexico_City",
        "America/Montevideo",
        "America/New_York",
        "America/Noronha",
        "America/Phoenix",
        "America/Regina",
        "America/Santiago",
        "America/Santo_Domingo",
        "America/Sao_Paulo",
        "America/St_Johns",
        "America/Tijuana",
        "America/Toronto",
        "America/Vancouver",
        "Asia/Almaty",
        "Asia/Amman",
        "Asia/Baghdad",
        "Asia/Baku",
        "Asia/Bangkok",
        "Asia/Calcutta",
        "Asia/Colombo",
        "Asia/Dhaka",
        "Asia/Dubai",
        "Asia/Irkutsk",
        "Asia/Jerusalem",
        "Asia/Kabul",
        "Asia/Karachi",
        "Asia/Kathmandu",
        "Asia/Kolkata",
        "Asia/Krasnoyarsk",
        "Asia/Kuala_Lumpur",
        "Asia/Kuwait",
        "Asia/Magadan",
        "Asia/Qatar",
        "Asia/Rangoon",
        "Asia/Seoul",
        "Asia/Shanghai",
        "Asia/Taipei",
        "Asia/Tehran",
        "Asia/Tokyo",
        "Asia/Vladivostok",
        "Asia/Yakutsk",
        "Asia/Yekaterinburg",
        "Atlantic/Azores",
        "Atlantic/Canary",
        "Atlantic/Cape_Verde",
        "Australia/Adelaide",
        "Australia/Brisbane",
        "Australia/Canberra",
        "Australia/Darwin",
        "Australia/Hobart",
        "Australia/Perth",
        "Australia/Sydney",
        "Canada/Atlantic",
        "Canada/Newfoundland",
        "Canada/Saskatchewan",
        "Etc/GMT+2",
        "Europe/Amsterdam",
        "Europe/Athens",
        "Europe/Belgrade",
        "Europe/Brussels",
        "Europe/Bucharest",
        "Europe/Helsinki",
        "Europe/London",
        "Europe/Madrid",
        "Europe/Moscow",
        "Europe/Oslo",
        "Europe/Paris",
        "Europe/Sarajevo",
        "Pacific/Auckland",
        "Pacific/Fiji",
        "Pacific/Guam",
        "Pacific/Honolulu",
        "Pacific/Midway",
        "Pacific/Tongatapu",
        "Turkey",
        "US/Alaska",
        "US/Arizona",
        "US/Central",
        "US/East-Indiana",
        "US/Eastern",
        "US/Mountain",
        "UTC",
    ];
    const calLocations = ["Link", "Zoom", "Google Meet", "Cal Video"];
    const handleReset = () => {
        // Reset GHL fields
        setCalendarId("");
        setTimezone("");
        // Reset Cal.com fields
        setUsername("");
        setApiKey("");
        setEventId("");
        setLocation("Cal Video");
        setEnableRescheduling(false);
    };
    const handleSave = () => {
        let config;
        if (selectedProvider === "GHL") {
            config = {
                provider: "GHL",
                calendarId,
                timezone,
            };
        }
        else {
            config = {
                provider: "Cal.com",
                username,
                apiKey,
                eventId,
                location,
                enableRescheduling,
            };
        }
        onSave(config);
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { backgroundColor: "rgba(0, 0, 0, 0.5)" }, onClick: onClose, children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-5 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Calendar Bookings" }), _jsx("button", { onClick: onClose, className: "p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors", children: _jsx(XMarkIcon, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "px-6 py-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsx("button", { onClick: () => setSelectedProvider("GHL"), className: `relative px-6 py-4 border-2 rounded-lg transition-all ${selectedProvider === "GHL"
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-gray-200 bg-white hover:border-gray-300"}`, children: _jsx("div", { className: "flex items-center justify-center", children: _jsx("img", { src: ghlLogo, alt: "GHL", className: "h-6" }) }) }), _jsx("button", { onClick: () => setSelectedProvider("Cal.com"), className: `relative px-6 py-4 border-2 rounded-lg transition-all ${selectedProvider === "Cal.com"
                                        ? "border-indigo-600 bg-indigo-50"
                                        : "border-gray-200 bg-white hover:border-gray-300"}`, children: _jsx("div", { className: "flex items-center justify-center", children: _jsx("img", { src: calLogo, alt: "Cal.com", className: "h-6" }) }) })] }), selectedProvider === "GHL" && (_jsxs(_Fragment, { children: [!ghlConfigured && (_jsx("div", { className: "mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-sm", children: "GoHighLevel no est\u00E1 configurado para esta cuenta. Puedes ingresar manualmente el Calendar ID y la zona horaria." })), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Calendar" }), ghlConfigured && !ghlManualMode && (_jsxs("div", { className: "mb-3 flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: handleFetchGhlCalendars, disabled: isLoadingCalendars, className: "px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded", children: isLoadingCalendars ? "Cargando..." : (ghlTriedFetch ? "Reintentar carga" : "Cargar calendarios") }), ghlTriedFetch && calendars.length === 0 && !isLoadingCalendars && (_jsx("span", { className: "text-xs text-gray-500", children: "No disponible. Usa el modo manual." }))] })), calendars.length > 0 ? (_jsx(SearchableSelect, { options: calendars.map((cal) => ({
                                                value: cal.id,
                                                label: cal.name,
                                            })), value: calendarId, onChange: (value) => setCalendarId(value), placeholder: isLoadingCalendars ? "Loading calendars..." : "Select calendar", disabled: isLoadingCalendars })) : (_jsx("input", { type: "text", value: calendarId, onChange: (e) => setCalendarId(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm", placeholder: "Ingresa el Calendar ID de GoHighLevel" }))] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Timezone" }), _jsx(SearchableSelect, { options: timezones, value: timezone, onChange: (value) => setTimezone(value), placeholder: "Select timezone" })] })] })), selectedProvider === "Cal.com" && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700 mb-1", children: "Username" }), _jsx("input", { type: "text", id: "username", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "apiKey", className: "block text-sm font-medium text-gray-700 mb-1", children: "API Key" }), _jsx("input", { type: "password", id: "apiKey", value: apiKey, onChange: (e) => setApiKey(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "eventId", className: "block text-sm font-medium text-gray-700 mb-1", children: "Event ID" }), _jsx("input", { type: "text", id: "eventId", value: eventId, onChange: (e) => setEventId(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "location", className: "block text-sm font-medium text-gray-700 mb-1", children: "Location" }), _jsx("select", { id: "location", value: location, onChange: (e) => setLocation(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm", children: calLocations.map((loc) => (_jsx("option", { value: loc, children: loc }, loc))) })] }), _jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsxs("span", { className: "flex items-center text-sm font-medium text-gray-700", children: ["Enable Appointment Rescheduling", _jsx(QuestionMarkCircleIcon, { className: "w-4 h-4 ml-1.5 text-gray-400" })] }), _jsxs("label", { htmlFor: "rescheduling-toggle", className: "inline-flex relative items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", id: "rescheduling-toggle", className: "sr-only peer", checked: enableRescheduling, onChange: () => setEnableRescheduling(!enableRescheduling) }), _jsx("div", { className: "w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" })] })] })] }))] }), _jsxs("div", { className: "flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200", children: [_jsx("button", { onClick: handleReset, className: "px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", children: "Reset" }), _jsx("button", { onClick: handleSave, className: "px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", children: "Save" })] })] }) }));
};
export default CalendarBookingModal;
