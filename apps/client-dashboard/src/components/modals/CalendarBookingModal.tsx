import {
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import calLogo from "../../assets/images/cal-logo-word-black.svg";
import ghlLogo from "../../assets/images/gohighlevel-logo.svg";
import { apiClient } from "../../lib/api";
import SearchableSelect from "../ui/SearchableSelect";

interface Calendar {
  id: string;
  name: string;
}

interface CalendarBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: CalendarConfig) => void;
  currentConfig?: CalendarConfig;
}

interface GHLConfig {
  provider: "GHL";
  calendarId: string;
  timezone: string;
}

interface CalComConfig {
  provider: "Cal.com";
  username: string;
  apiKey: string;
  eventId: string;
  location: string;
  enableRescheduling: boolean;
}

type CalendarConfig = GHLConfig | CalComConfig;

const CalendarBookingModal: React.FC<CalendarBookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<"GHL" | "Cal.com">(
    "GHL",
  );

  // GHL states
  const [calendarId, setCalendarId] = useState("");
  const [timezone, setTimezone] = useState("");
  const [calendars, setCalendars] = useState<Calendar[]>([]);
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
  const previousConfigRef = useRef<CalendarConfig | undefined>(undefined);

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
      } else if (currentConfig.provider === "Cal.com") {
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
        } catch (_configError) {
          setCalendars([]);
          setGhlConfigured(false);
          setGhlManualMode(true);
        } finally {
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
      const response = await apiClient.get<{ calendars: Calendar[] }>("/integrations/ghl/calendars");
      setCalendars(response.calendars || []);
      if (!response.calendars || response.calendars.length === 0) {
        setGhlManualMode(true);
      }
    } catch (_error) {
      // Si falla (p.ej. Invalid JWT), activar modo manual sin ruido
      setCalendars([]);
      setGhlManualMode(true);
    } finally {
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
    let config: CalendarConfig;
    if (selectedProvider === "GHL") {
      config = {
        provider: "GHL",
        calendarId,
        timezone,
      };
    } else {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Calendar Bookings
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Provider Tabs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* GHL Tab */}
            <button
              onClick={() => setSelectedProvider("GHL")}
              className={`relative px-6 py-4 border-2 rounded-lg transition-all ${
                selectedProvider === "GHL"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center">
                <img
                  src={ghlLogo}
                  alt="GHL"
                  className="h-6"
                />
              </div>
            </button>

            {/* Cal.com Tab */}
            <button
              onClick={() => setSelectedProvider("Cal.com")}
              className={`relative px-6 py-4 border-2 rounded-lg transition-all ${
                selectedProvider === "Cal.com"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center">
                <img
                  src={calLogo}
                  alt="Cal.com"
                  className="h-6"
                />
              </div>
            </button>
          </div>

          {selectedProvider === "GHL" && (
            <>
              {/* Aviso de configuración faltante y modo manual */}
              {!ghlConfigured && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
                  GoHighLevel no está configurado para esta cuenta. Puedes ingresar manualmente el Calendar ID y la zona horaria.
                </div>
              )}
              {/* Calendar ID Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calendar
                </label>
                {ghlConfigured && !ghlManualMode && (
                  <div className="mb-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFetchGhlCalendars}
                      disabled={isLoadingCalendars}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      {isLoadingCalendars ? "Cargando..." : (ghlTriedFetch ? "Reintentar carga" : "Cargar calendarios")}
                    </button>
                    {ghlTriedFetch && calendars.length === 0 && !isLoadingCalendars && (
                      <span className="text-xs text-gray-500">No disponible. Usa el modo manual.</span>
                    )}
                  </div>
                )}
                {calendars.length > 0 ? (
                  <SearchableSelect
                    options={calendars.map((cal) => ({
                      value: cal.id,
                      label: cal.name,
                    }))}
                    value={calendarId}
                    onChange={(value) => setCalendarId(value)}
                    placeholder={
                      isLoadingCalendars ? "Loading calendars..." : "Select calendar"
                    }
                    disabled={isLoadingCalendars}
                  />
                ) : (
                  <input
                    type="text"
                    value={calendarId}
                    onChange={(e) => setCalendarId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ingresa el Calendar ID de GoHighLevel"
                  />
                )}
              </div>

              {/* Timezone Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <SearchableSelect
                  options={timezones}
                  value={timezone}
                  onChange={(value) => setTimezone(value)}
                  placeholder="Select timezone"
                />
              </div>
            </>
          )}

          {selectedProvider === "Cal.com" && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="eventId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event ID
                </label>
                <input
                  type="text"
                  id="eventId"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {calLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="flex items-center text-sm font-medium text-gray-700">
                  Enable Appointment Rescheduling
                  <QuestionMarkCircleIcon className="w-4 h-4 ml-1.5 text-gray-400" />
                </span>
                <label
                  htmlFor="rescheduling-toggle"
                  className="inline-flex relative items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id="rescheduling-toggle"
                    className="sr-only peer"
                    checked={enableRescheduling}
                    onChange={() => setEnableRescheduling(!enableRescheduling)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarBookingModal;
