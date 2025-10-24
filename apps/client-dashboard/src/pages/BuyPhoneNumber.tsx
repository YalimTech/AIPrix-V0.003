import { ChartBarIcon, HomeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "../components/ui/Button";
import {
  useAvailableCountries,
  useAvailablePhoneNumbers,
  useBuyPhoneNumber,
  useCountryInfo,
  useCountryPricing,
} from "../hooks/usePhoneNumbers";

// Hook para debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

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
const CountryFlag: React.FC<{ countryCode: string; className?: string }> = ({
  countryCode,
  className = "",
}) => {
  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png 2x`}
      width="24"
      height="18"
      alt={`${countryCode} flag`}
      className={`inline-block ${className}`}
      style={{ objectFit: "cover", borderRadius: "2px" }}
    />
  );
};

const BuyPhoneNumber: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startsWith, setStartsWith] = useState("");
  const [endsWith, setEndsWith] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [selectedNumberType, setSelectedNumberType] = useState<
    "local" | "tollFree"
  >("local");

  const [capabilities, setCapabilities] = useState(() => {
    try {
      const savedCapabilities = localStorage.getItem("phoneNumberCapabilities");
      return savedCapabilities
        ? JSON.parse(savedCapabilities)
        : { voice: true, sms: true, mms: false, fax: false, beta: false };
    } catch (error) {
      console.error("Error reading capabilities from localStorage", error);
      return { voice: true, sms: true, mms: false, fax: false, beta: false };
    }
  });

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce los términos de búsqueda para evitar llamadas excesivas a la API
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedStartsWith = useDebounce(startsWith, 500);
  const debouncedEndsWith = useDebounce(endsWith, 500);

  // Guardar capabilities en localStorage cada vez que cambien
  useEffect(() => {
    try {
      localStorage.setItem(
        "phoneNumberCapabilities",
        JSON.stringify(capabilities),
      );
    } catch (error) {
      console.error("Error saving capabilities to localStorage", error);
    }
  }, [capabilities]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const {
    data: availableNumbers,
    isLoading,
    error,
    refetch,
  } = useAvailablePhoneNumbers(searchParams);

  const handleRefresh = () => {
    refetch({ cancelRefetch: false });
  };

  const buyPhoneNumber = useBuyPhoneNumber();
  const {
    data: availableCountries,
    isLoading: countriesLoading,
    error: countriesError,
  } = useAvailableCountries();

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
  const getCountryName = (countryCode: string) => {
    if (!countries || !Array.isArray(countries)) {
      return "United States"; // Default to United States
    }
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.name : "United States"; // Default to United States
  };

  // Función para obtener el mensaje de error apropiado
  const getErrorMessage = (error: any) => {
    if (!error) return null;

    const errorMessage =
      error?.response?.data?.message || error?.message || "Error desconocido";

    // Detectar diferentes tipos de errores de Twilio
    if (errorMessage.includes("TWILIO_CREDENTIALS_NOT_CONFIGURED")) {
      return {
        type: "credentials_not_configured",
        title: "Credenciales de Twilio no configuradas",
        message:
          "Por favor, configura tus credenciales de Twilio en la sección de Ajustes para poder ver los países disponibles.",
        action: "Ir a Ajustes",
        actionUrl: "/settings",
      };
    }

    if (errorMessage.includes("TWILIO_INVALID_CREDENTIALS")) {
      return {
        type: "invalid_credentials",
        title: "Credenciales de Twilio inválidas",
        message:
          "Las credenciales de Twilio configuradas son inválidas. Por favor, verifica tus credenciales en la sección de Ajustes.",
        action: "Ir a Ajustes",
        actionUrl: "/settings",
      };
    }

    if (errorMessage.includes("TWILIO_CONNECTION_ERROR")) {
      return {
        type: "connection_error",
        title: "Error de conexión",
        message:
          "No se pudo conectar con la API de Twilio. Verifica tu conexión a internet.",
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

  const [purchasingNumbers, setPurchasingNumbers] = useState<Set<string>>(
    new Set(),
  );

  const handlePurchase = async (phoneNumber: string) => {
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
      alert(
        `✅ ¡Número comprado exitosamente!\n\nNúmero: ${phoneNumber}\n\nPuedes verlo en la sección "Purchased Phone Numbers".`,
      );
      console.log("Número comprado exitosamente:", phoneNumber);
    } catch (error: any) {
      console.error("Error purchasing phone number:", error);

      // Mostrar mensaje específico según el tipo de error
      let errorMessage = "Error al comprar el número";

      if (error.message) {
        if (error.message.includes("Error 21422")) {
          errorMessage =
            "Este número mágico de prueba está diseñado para generar un error 'No disponible'. Esto es normal en las pruebas de Twilio.";
        } else if (error.message.includes("Error 21421")) {
          errorMessage =
            "Este número mágico de prueba está diseñado para generar un error 'Número inválido'. Esto es normal en las pruebas de Twilio.";
        } else if (error.message.includes("Error 21612")) {
          errorMessage =
            "Este número mágico de prueba está diseñado para generar un error 'No se puede enrutar'. Esto es normal en las pruebas de Twilio.";
        } else if (error.message.includes("Error 21408")) {
          errorMessage =
            "Este número mágico de prueba está diseñado para generar un error 'Sin permisos internacionales'. Esto es normal en las pruebas de Twilio.";
        } else if (error.message.includes("Error 21610")) {
          errorMessage =
            "Este número mágico de prueba está diseñado para generar un error 'Número bloqueado'. Esto es normal en las pruebas de Twilio.";
        } else {
          errorMessage = error.message;
        }
      }

      // TODO: Mostrar toast o modal con el mensaje de error
      alert(errorMessage);
    } finally {
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

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a href="/dashboard" className="text-gray-700 hover:text-blue-600">
              <HomeIcon className="w-4 h-4 mr-2" />
              Dashboard
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1 text-gray-500 md:ml-2">Phone Numbers</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phone Numbers</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <a
            href="/purchased-numbers"
            className="whitespace-nowrap py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center"
          >
            <ChartBarIcon className="w-4 h-4 mr-1" />
            Purchased Phone Numbers
          </a>
          <a
            href="/buy-number"
            className="whitespace-nowrap py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 flex items-center"
          >
            <PhoneIcon className="w-4 h-4 mr-1" />
            Buy Phone Numbers
          </a>
        </nav>
      </div>

      {/* Information Section - Solo mostrar cuando no hay números */}
      {filteredNumbers.length === 0 && !isLoading && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <PhoneIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                No numbers available
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  We couldn't find any numbers that matched your search
                  criteria. You can retry with different search terms or learn
                  more about how to{" "}
                  <a
                    href="https://twlo.my.salesforce-sites.com/PrivateOffering"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    request an exclusive number
                  </a>
                  . For countries not listed, you can request an exclusive
                  number directly through Twilio. Please be aware that some
                  countries require additional documentation due to local
                  regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Filter Section - Clean and Organized */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Filter By Label */}
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter By:
            </label>
          </div>

          {/* Search Input - General */}
          <div className="w-80 relative">
            <input
              type="text"
              placeholder="Buscar por código de área (ej: 212) o estado (ej: New York)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {/* Indicador de búsqueda */}
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Starts With Input */}
          <div className="w-48 relative">
            <input
              type="text"
              placeholder="Prefijo local (ej: 555)"
              value={startsWith}
              onChange={(e) => setStartsWith(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {/* Indicador de búsqueda */}
            {startsWith !== debouncedStartsWith && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Ends With Input */}
          <div className="w-48 relative">
            <input
              type="text"
              placeholder="Termina con (ej: 1234)"
              value={endsWith}
              onChange={(e) => setEndsWith(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {/* Indicador de búsqueda */}
            {endsWith !== debouncedEndsWith && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Country/Region Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="w-full lg:w-48 px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between"
            >
              <span className="flex items-center">
                <CountryFlag
                  countryCode={selectedCountry}
                  className="mr-2 flex-shrink-0"
                />
                <span className="text-sm truncate">
                  {getCountryName(selectedCountry)}
                </span>
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isCountryDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isCountryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
                {/* Campo de búsqueda */}
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Buscar país..."
                    value={countrySearchTerm}
                    onChange={(e) => setCountrySearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>

                {/* Lista de países filtrados */}
                <div className="overflow-y-auto max-h-52">
                  {countriesLoading ? (
                    <div className="px-3 py-2 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                      <span className="text-sm ml-2">Cargando países...</span>
                    </div>
                  ) : countriesError && errorInfo ? (
                    <div className="px-3 py-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-yellow-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-yellow-800">
                              {errorInfo.title}
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>{errorInfo.message}</p>
                            </div>
                            {errorInfo.action && errorInfo.actionUrl && (
                              <div className="mt-3">
                                <a
                                  href={errorInfo.actionUrl}
                                  className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                                >
                                  {errorInfo.action} →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : countries && Array.isArray(countries) ? (
                    (() => {
                      // Filtrar países basándose en el término de búsqueda
                      const filteredCountries = countries.filter((country) => {
                        const searchLower = countrySearchTerm.toLowerCase();
                        return (
                          country.name.toLowerCase().startsWith(searchLower) ||
                          country.code.toLowerCase().startsWith(searchLower)
                        );
                      });

                      if (filteredCountries.length === 0) {
                        return (
                          <div className="px-3 py-2 text-center text-gray-500 text-sm">
                            No se encontraron países
                          </div>
                        );
                      }

                      return filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country.code);
                            setIsCountryDropdownOpen(false);
                            setCountrySearchTerm("");
                          }}
                          disabled={!country.supported}
                          className={`w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center ${
                            selectedCountry === country.code
                              ? "bg-blue-100 text-blue-700"
                              : country.supported
                                ? "text-gray-900"
                                : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <CountryFlag
                            countryCode={country.code}
                            className="mr-2 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <span className="text-sm">{country.name}</span>
                            {!country.supported && (
                              <span className="text-xs text-orange-600 ml-2">
                                (Requiere solicitud especial)
                              </span>
                            )}
                          </div>
                        </button>
                      ));
                    })()
                  ) : (
                    <div className="px-3 py-2 text-center text-gray-500 text-sm">
                      No hay países disponibles
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Number Type Selector */}
          <div className="flex">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedNumberType("local")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedNumberType === "local"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Local
              </button>
              <button
                onClick={() => setSelectedNumberType("tollFree")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedNumberType === "tollFree"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Toll-Free
              </button>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Options Section */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-700">Options</span>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={capabilities.voice}
                  onChange={(e) =>
                    setCapabilities({
                      ...capabilities,
                      voice: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Voice</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={capabilities.sms}
                  onChange={(e) =>
                    setCapabilities({ ...capabilities, sms: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">SMS</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={capabilities.mms}
                  onChange={(e) =>
                    setCapabilities({ ...capabilities, mms: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">MMS</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={capabilities.fax}
                  onChange={(e) =>
                    setCapabilities({ ...capabilities, fax: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Fax</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={capabilities.beta}
                  onChange={(e) =>
                    setCapabilities((prev: any) => ({
                      ...prev,
                      beta: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Include Beta Numbers
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Numbers Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voice
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SMS
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MMS
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fax
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address Requirement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly fee
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase numbers
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></div>
                      Cargando números disponibles...
                    </div>
                  </td>
                </tr>
              ) : filteredNumbers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {error ? (
                      <div className="text-center">
                        <div className="text-red-600 mb-6">
                          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <PhoneIcon className="w-8 h-8 text-red-500" />
                          </div>
                          <p className="text-xl font-semibold mb-2">
                            Error cargando números
                          </p>
                          <p className="text-sm text-gray-600">
                            {error.message?.includes(
                              "TWILIO_CREDENTIALS_NOT_CONFIGURED",
                            )
                              ? "Por favor, configura tus credenciales de Twilio en la sección de Ajustes para poder buscar números disponibles."
                              : error.message}
                          </p>
                        </div>

                        {/* Información específica para credenciales no configuradas */}
                        {error.message?.includes(
                          "Credenciales de Twilio no configuradas",
                        ) && (
                          <div className="max-w-2xl mx-auto">
                            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl shadow-lg overflow-hidden">
                              {/* Header con icono y título */}
                              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                                    <PhoneIcon className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-white">
                                      Conecta tu Cuenta de Twilio
                                    </h3>
                                    <p className="text-blue-100 text-sm">
                                      Configura tus credenciales para acceder a
                                      números telefónicos
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Contenido principal */}
                              <div className="p-6">
                                <div className="mb-6">
                                  <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <svg
                                          className="w-6 h-6 text-blue-600"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                        ¿Por qué necesito conectar Twilio?
                                      </h4>
                                      <p className="text-gray-700 leading-relaxed">
                                        Twilio es la plataforma que nos permite
                                        acceder a números telefónicos reales de
                                        todo el mundo. Al conectar tu cuenta,
                                        podrás ver y comprar números disponibles
                                        para tus agentes de IA.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Pasos de configuración */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                                  <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-3">
                                      ⚙️
                                    </span>
                                    Cómo configurar Twilio en 4 pasos simples:
                                  </h5>
                                  <div className="grid gap-4">
                                    <div className="flex items-start space-x-4">
                                      <div className="flex-shrink-0">
                                        <span className="w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                                          1
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-gray-700">
                                          Ve a{" "}
                                          <strong className="text-blue-600">
                                            Configuración
                                          </strong>{" "}
                                          en el menú lateral
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                      <div className="flex-shrink-0">
                                        <span className="w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                                          2
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-gray-700">
                                          Busca la sección{" "}
                                          <strong className="text-blue-600">
                                            "Integración Twilio"
                                          </strong>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                      <div className="flex-shrink-0">
                                        <span className="w-8 h-8 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                                          3
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-gray-700">
                                          Ingresa tu{" "}
                                          <strong className="text-blue-600">
                                            Account SID
                                          </strong>{" "}
                                          y{" "}
                                          <strong className="text-blue-600">
                                            Auth Token
                                          </strong>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                      <div className="flex-shrink-0">
                                        <span className="w-8 h-8 bg-green-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                                          ✓
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-gray-700">
                                          Guarda la configuración y regresa aquí
                                          para comenzar
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Información adicional */}
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                      <div className="flex-shrink-0">
                                        <span className="text-amber-500 text-xl">
                                          💡
                                        </span>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-amber-800 mb-1">
                                          ¿Dónde encontrar mis credenciales?
                                        </h6>
                                        <p className="text-sm text-amber-700">
                                          Ve al{" "}
                                          <a
                                            href="https://console.twilio.com/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline hover:text-amber-900 font-medium"
                                          >
                                            Console de Twilio
                                          </a>{" "}
                                          y busca tu Account SID y Auth Token.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                      <div className="flex-shrink-0">
                                        <span className="text-green-500 text-xl">
                                          🎉
                                        </span>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-green-800 mb-1">
                                          ¿No tienes cuenta de Twilio?
                                        </h6>
                                        <p className="text-sm text-green-700">
                                          <a
                                            href="https://www.twilio.com/try-twilio"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline hover:text-green-900 font-medium"
                                          >
                                            Regístrate gratis
                                          </a>{" "}
                                          y obtén $15 de crédito inicial.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Botón de acción */}
                                <div className="mt-6 text-center">
                                  <a
                                    href="/settings"
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                  >
                                    <svg
                                      className="w-5 h-5 mr-2"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                    Ir a Configuración
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Información específica para Request for an Exclusive Number */}
                        {error.message?.includes(
                          "requiere una solicitud especial",
                        ) && (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-left">
                            <h4 className="text-sm font-medium text-yellow-800 mb-2">
                              📋 Request for an Exclusive Number Required
                            </h4>
                            <div className="text-sm text-yellow-700 space-y-2">
                              <p>
                                Este país requiere un "Request for an Exclusive
                                Number" a Twilio. Los números no están
                                disponibles directamente en el listado regular.
                              </p>
                              <div className="bg-white p-3 rounded border border-yellow-300">
                                <p className="font-medium mb-2">
                                  Para solicitar números en{" "}
                                  {getCountryName(selectedCountry)}:
                                </p>
                                <ol className="list-decimal list-inside space-y-1 text-xs">
                                  <li>Contacta al soporte de Twilio</li>
                                  <li>
                                    Proporciona información sobre el uso
                                    previsto
                                  </li>
                                  <li>Envía documentación de respaldo</li>
                                  <li>Espera la aprobación de Twilio</li>
                                </ol>
                              </div>
                              <p className="text-xs">
                                <strong>Contacto Twilio:</strong>{" "}
                                support@twilio.com o +1 (415) 390-0000
                              </p>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={handleRefresh}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : (
                      <div>
                        <PhoneIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          No numbers available
                        </p>
                        <p className="text-gray-500 mb-4">
                          No numbers were found for the selected criteria.
                        </p>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>
                            • Verify that the selected country is supported by
                            Twilio
                          </p>
                          <p>• Try a different area code</p>
                          <p>
                            • Make sure your Twilio credentials are configured
                          </p>
                          <p>
                            • Some countries require "Request for an Exclusive
                            Number" to Twilio
                          </p>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-700">
                            <strong>💡 Tip:</strong> If you don't see available
                            numbers, check your Twilio configuration in the
                            Settings section.
                          </p>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : Array.isArray(filteredNumbers) ? (
                filteredNumbers.map((number, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CountryFlag
                          countryCode={number.country}
                          className="mr-3 flex-shrink-0"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {number.number}
                          </span>
                          <div className="text-xs text-gray-500">
                            {number.locality && number.region ? (
                              <span>
                                {number.locality}, {number.region},{" "}
                                {number.country}
                              </span>
                            ) : number.region ? (
                              <span>
                                {number.region}, {number.country}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                          {number.friendlyName &&
                            number.friendlyName !== number.number && (
                              <div className="text-xs text-gray-400">
                                {number.friendlyName}
                              </div>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {number.numberType === "local" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            📞 Local
                          </span>
                        )}
                        {number.numberType === "tollFree" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🆓 Toll Free
                          </span>
                        )}
                        {number.numberType === "mobile" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            📱 Mobile
                          </span>
                        )}
                        {!number.numberType && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            📞 Local
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {number.capabilities.includes("voice") ? (
                        <svg
                          className="w-4 h-4 mx-auto text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {number.capabilities.includes("sms") ? (
                        <svg
                          className="w-4 h-4 mx-auto text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {number.capabilities.includes("mms") ? (
                        <svg
                          className="w-4 h-4 mx-auto text-purple-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-gray-300">—</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      None
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">
                          {number.price
                            ? `$${number.price.toFixed(2)}/mo`
                            : "N/A"}
                          {number.isMagicNumber && (
                            <span className="text-xs text-blue-600 ml-1">
                              (Magic Number)
                            </span>
                          )}
                          {number.isTestAccount && !number.isMagicNumber && (
                            <span className="text-xs text-orange-600 ml-1">
                              (Test Account)
                            </span>
                          )}
                        </div>
                        {number.setupPrice && number.setupPrice > 0 && (
                          <div className="text-xs text-gray-400">
                            +${number.setupPrice.toFixed(2)} setup
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePurchase(number.number)}
                        disabled={purchasingNumbers.has(number.number)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {purchasingNumbers.has(number.number)
                          ? "Purchasing..."
                          : "Buy"}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Error cargando números disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BuyPhoneNumber;
