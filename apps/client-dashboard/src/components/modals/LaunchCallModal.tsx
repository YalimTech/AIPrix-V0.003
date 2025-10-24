import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import {
  useAvailableCountries,
  usePhoneNumbers,
} from "../../hooks/usePhoneNumbers";

interface LaunchCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (
    fromNumber: string,
    toNumber: string,
    agentId?: string,
    phoneNumberId?: string,
  ) => void;
  agentId?: string;
}

// Componente para mostrar banderas de países
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

const LaunchCallModal: React.FC<LaunchCallModalProps> = ({
  isOpen,
  onClose,
  onLaunch,
  agentId,
}) => {
  const [fromNumber, setFromNumber] = useState("");
  const [fromNumberId, setFromNumberId] = useState("");
  const [toNumber, setToNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isFromNumberDropdownOpen, setIsFromNumberDropdownOpen] =
    useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [fromNumberSearchTerm, setFromNumberSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fromNumberDropdownRef = useRef<HTMLDivElement>(null);

  // Obtener números comprados desde la API
  const { data: phoneNumbersData, isLoading: phoneNumbersLoading } =
    usePhoneNumbers();

  // Obtener países disponibles
  const { data: availableCountries, isLoading: countriesLoading } =
    useAvailableCountries();

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
      if (
        fromNumberDropdownRef.current &&
        !fromNumberDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFromNumberDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Función para obtener el código de país desde el número de teléfono
  const getCountryFromPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return "US";

    // Mapeo de códigos de país a códigos ISO
    const countryCodeMap: { [key: string]: string } = {
      "+1": "US",
      "+44": "GB",
      "+33": "FR",
      "+49": "DE",
      "+39": "IT",
      "+34": "ES",
      "+31": "NL",
      "+32": "BE",
      "+41": "CH",
      "+43": "AT",
      "+45": "DK",
      "+46": "SE",
      "+47": "NO",
      "+48": "PL",
      "+30": "GR",
      "+351": "PT",
      "+353": "IE",
      "+352": "LU",
      "+354": "IS",
      "+356": "MT",
      "+357": "CY",
      "+358": "FI",
      "+370": "LT",
      "+371": "LV",
      "+372": "EE",
      "+373": "MD",
      "+374": "AM",
      "+375": "BY",
      "+380": "UA",
      "+381": "RS",
      "+382": "ME",
      "+383": "XK",
      "+385": "HR",
      "+386": "SI",
      "+387": "BA",
      "+389": "MK",
      "+420": "CZ",
      "+421": "SK",
      "+423": "LI",
      "+500": "FK",
      "+501": "BZ",
      "+502": "GT",
      "+503": "SV",
      "+504": "HN",
      "+505": "NI",
      "+506": "CR",
      "+507": "PA",
      "+508": "PM",
      "+509": "HT",
      "+590": "GP",
      "+591": "BO",
      "+592": "GY",
      "+593": "EC",
      "+594": "GF",
      "+595": "PY",
      "+596": "MQ",
      "+597": "SR",
      "+598": "UY",
      "+599": "CW",
      "+670": "TL",
      "+672": "AU",
      "+673": "BN",
      "+674": "NR",
      "+675": "PG",
      "+676": "TO",
      "+677": "SB",
      "+678": "VU",
      "+679": "FJ",
      "+680": "PW",
      "+681": "WF",
      "+682": "CK",
      "+683": "NU",
      "+684": "AS",
      "+685": "WS",
      "+686": "KI",
      "+687": "NC",
      "+688": "TV",
      "+689": "PF",
      "+690": "TK",
      "+691": "FM",
      "+692": "MH",
      "+850": "KP",
      "+852": "HK",
      "+853": "MO",
      "+855": "KH",
      "+856": "LA",
      "+880": "BD",
      "+886": "TW",
      "+960": "MV",
      "+961": "LB",
      "+962": "JO",
      "+963": "SY",
      "+964": "IQ",
      "+965": "KW",
      "+966": "SA",
      "+967": "YE",
      "+968": "OM",
      "+970": "PS",
      "+971": "AE",
      "+972": "IL",
      "+973": "BH",
      "+974": "QA",
      "+975": "BT",
      "+976": "MN",
      "+977": "NP",
      "+992": "TJ",
      "+993": "TM",
      "+994": "AZ",
      "+995": "GE",
      "+996": "KG",
      "+998": "UZ",
      "+1242": "BS",
      "+1246": "BB",
      "+1264": "AI",
      "+1268": "AG",
      "+1284": "VG",
      "+1340": "VI",
      "+1345": "KY",
      "+1441": "BM",
      "+1473": "GD",
      "+1649": "TC",
      "+1664": "MS",
      "+1670": "MP",
      "+1671": "GU",
      "+1684": "AS",
      "+1721": "SX",
      "+1758": "LC",
      "+1767": "DM",
      "+1784": "VC",
      "+1787": "PR",
      "+1809": "DO",
      "+1868": "TT",
      "+1869": "KN",
      "+1876": "JM",
      "+1939": "PR",
      "+20": "EG",
      "+212": "MA",
      "+213": "DZ",
      "+216": "TN",
      "+218": "LY",
      "+220": "GM",
      "+221": "SN",
      "+222": "MR",
      "+223": "ML",
      "+224": "GN",
      "+225": "CI",
      "+226": "BF",
      "+227": "NE",
      "+228": "TG",
      "+229": "BJ",
      "+230": "MU",
      "+231": "LR",
      "+232": "SL",
      "+233": "GH",
      "+234": "NG",
      "+235": "TD",
      "+236": "CF",
      "+237": "CM",
      "+238": "CV",
      "+239": "ST",
      "+240": "GQ",
      "+241": "GA",
      "+242": "CG",
      "+243": "CD",
      "+244": "AO",
      "+245": "GW",
      "+246": "IO",
      "+248": "SC",
      "+249": "SD",
      "+250": "RW",
      "+251": "ET",
      "+252": "SO",
      "+253": "DJ",
      "+254": "KE",
      "+255": "TZ",
      "+256": "UG",
      "+257": "BI",
      "+258": "MZ",
      "+260": "ZM",
      "+261": "MG",
      "+262": "RE",
      "+263": "ZW",
      "+264": "NA",
      "+265": "MW",
      "+266": "LS",
      "+267": "BW",
      "+268": "SZ",
      "+269": "KM",
      "+290": "SH",
      "+291": "ER",
      "+297": "AW",
      "+298": "FO",
      "+299": "GL",
      "+350": "GI",
      "+355": "AL",
      "+376": "AD",
      "+377": "MC",
      "+378": "SM",
      "+7": "RU",
      "+81": "JP",
      "+82": "KR",
      "+84": "VN",
      "+86": "CN",
      "+90": "TR",
      "+91": "IN",
      "+92": "PK",
      "+93": "AF",
      "+94": "LK",
      "+95": "MM",
      "+98": "IR",
    };

    // Buscar el código de país más largo que coincida
    const sortedCodes = Object.keys(countryCodeMap).sort(
      (a, b) => b.length - a.length,
    );
    for (const code of sortedCodes) {
      if (phoneNumber.startsWith(code)) {
        return countryCodeMap[code];
      }
    }

    return "US"; // Default
  };

  // Función para obtener el código de país
  const getCountryCode = (countryCode: string) => {
    const countryCodes: { [key: string]: string } = {
      US: "+1",
      CA: "+1",
      GB: "+44",
      AU: "+61",
      DE: "+49",
      FR: "+33",
      ES: "+34",
      IT: "+39",
      NL: "+31",
      BE: "+32",
      CH: "+41",
      AT: "+43",
      SE: "+46",
      NO: "+47",
      DK: "+45",
      FI: "+358",
      PL: "+48",
      CZ: "+420",
      GR: "+30",
      PT: "+351",
      IE: "+353",
      LU: "+352",
      IS: "+354",
      MT: "+356",
      CY: "+357",
      EE: "+372",
      LV: "+371",
      LT: "+370",
      SI: "+386",
      SK: "+421",
      HU: "+36",
      RO: "+40",
      BG: "+359",
      HR: "+385",
      MX: "+52",
      BR: "+55",
      AR: "+54",
      CL: "+56",
      CO: "+57",
      PE: "+51",
      VE: "+58",
      EC: "+593",
      BO: "+591",
      PY: "+595",
      UY: "+598",
      CR: "+506",
      PA: "+507",
      DO: "+1",
      CU: "+53",
      GT: "+502",
      HN: "+504",
      NI: "+505",
      SV: "+503",
      JM: "+1",
      TT: "+868",
      BB: "+246",
      BS: "+242",
      AG: "+268",
      LC: "+758",
      VC: "+784",
      GD: "+473",
      KN: "+869",
      DM: "+767",
      SR: "+597",
      GY: "+592",
      BZ: "+501",
      HT: "+509",
      JP: "+81",
      CN: "+86",
      IN: "+91",
      KR: "+82",
      TH: "+66",
      VN: "+84",
      PH: "+63",
      ID: "+62",
      MY: "+60",
      SG: "+65",
      HK: "+852",
      TW: "+886",
      MO: "+853",
      BD: "+880",
      PK: "+92",
      LK: "+94",
      NP: "+977",
      MM: "+95",
      KH: "+855",
      LA: "+856",
      BN: "+673",
      FJ: "+679",
      PG: "+675",
      NC: "+687",
      PF: "+689",
      WS: "+685",
      TO: "+676",
      VU: "+678",
      SB: "+677",
      KI: "+686",
      TV: "+688",
      FM: "+691",
      MH: "+692",
      PW: "+680",
      AS: "+684",
      GU: "+671",
      MP: "+670",
      AE: "+971",
      SA: "+966",
      IL: "+972",
      TR: "+90",
      EG: "+20",
      ZA: "+27",
      NG: "+234",
      KE: "+254",
      TZ: "+255",
      UG: "+256",
      GH: "+233",
      ET: "+251",
      MA: "+212",
      DZ: "+213",
      TN: "+216",
      LY: "+218",
      SD: "+249",
      SO: "+252",
      DJ: "+253",
      ER: "+291",
      MW: "+265",
      ZM: "+260",
      ZW: "+263",
      BW: "+267",
      LS: "+266",
      SZ: "+268",
      MZ: "+258",
      MG: "+261",
      MU: "+230",
      SC: "+248",
      KM: "+269",
      BI: "+257",
      RW: "+250",
      AO: "+244",
      CD: "+243",
      CG: "+242",
      CF: "+236",
      TD: "+235",
      CM: "+237",
      GQ: "+240",
      GA: "+241",
      ST: "+239",
      BJ: "+229",
      BF: "+226",
      ML: "+223",
      NE: "+227",
      MR: "+222",
      SN: "+221",
      GM: "+220",
      GN: "+224",
      GW: "+245",
      SL: "+232",
      LR: "+231",
      CI: "+225",
      TG: "+228",
      RU: "+7",
      KZ: "+7",
      UZ: "+998",
      TJ: "+992",
      TM: "+993",
      KG: "+996",
      MN: "+976",
      AF: "+93",
      IR: "+98",
      IQ: "+964",
      SY: "+963",
      LB: "+961",
      JO: "+962",
      KW: "+965",
      BH: "+973",
      QA: "+974",
      OM: "+968",
      YE: "+967",
      PS: "+970",
      AZ: "+994",
      GE: "+995",
      AM: "+374",
      BY: "+375",
      MD: "+373",
      UA: "+380",
      NZ: "+64",
    };
    return countryCodes[countryCode] || "+1";
  };

  // Función para obtener el nombre del país
  const getCountryName = (countryCode: string) => {
    if (!availableCountries || !Array.isArray(availableCountries)) {
      return "United States";
    }
    const country = availableCountries.find((c: any) => c.code === countryCode);
    return country ? country.name : "United States";
  };

  const handleCancel = () => {
    onClose();
  };

  const handleLaunch = () => {
    if (toNumber.trim()) {
      // Construir el número completo con el código de país
      const fullNumber = toNumber.startsWith("+")
        ? toNumber
        : `${getCountryCode(selectedCountry)}${toNumber}`;

      onLaunch(fromNumber, fullNumber, agentId, fromNumberId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Launch A Call</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Number (Required) */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  From Number <span className="text-red-500">*</span>
                </label>
                <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 ml-1" />
              </div>
              <div className="relative" ref={fromNumberDropdownRef}>
                <button
                  type="button"
                  onClick={() =>
                    setIsFromNumberDropdownOpen(!isFromNumberDropdownOpen)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-left flex items-center justify-between"
                  disabled={phoneNumbersLoading}
                >
                  <div className="flex items-center">
                    {fromNumber ? (
                      <>
                        <CountryFlag
                          countryCode={getCountryFromPhoneNumber(fromNumber)}
                          className="mr-2"
                        />
                        <span>{fromNumber}</span>
                        {!fromNumberId && " ⚠️ No registrado en ElevenLabs"}
                      </>
                    ) : (
                      <span className="text-gray-500">
                        {phoneNumbersLoading
                          ? "Cargando números de Twilio..."
                          : "Selecciona un número de Twilio"}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isFromNumberDropdownOpen ? "rotate-180" : ""
                    }`}
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

                {isFromNumberDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {phoneNumbersData && Array.isArray(phoneNumbersData) ? (
                      phoneNumbersData
                        .filter((number: any) => number.status === "active")
                        .filter(
                          (number: any) =>
                            !fromNumberSearchTerm ||
                            number.number
                              .toLowerCase()
                              .includes(fromNumberSearchTerm.toLowerCase()),
                        )
                        .map((number: any) => {
                          const countryCode = getCountryFromPhoneNumber(
                            number.number,
                          );
                          return (
                            <button
                              key={number.id}
                              type="button"
                              onClick={() => {
                                setFromNumber(number.number);
                                setFromNumberId(
                                  number.elevenLabsPhoneNumberId || number.id,
                                );
                                setIsFromNumberDropdownOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                            >
                              <CountryFlag
                                countryCode={countryCode}
                                className="mr-3 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {number.number}
                                </div>
                                {number.friendlyName && (
                                  <div className="text-xs text-gray-500">
                                    {number.friendlyName}
                                  </div>
                                )}
                                {!number.elevenLabsPhoneNumberId && (
                                  <div className="text-xs text-amber-600">
                                    ⚠️ No registrado en ElevenLabs
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })
                    ) : (
                      // Fallback para cuentas de prueba - Magic Numbers de Twilio
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setFromNumber("+15005550006");
                            setFromNumberId("test-magic-006");
                            setIsFromNumberDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                        >
                          <CountryFlag
                            countryCode="US"
                            className="mr-3 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              +1 (500) 555-0006
                            </div>
                            <div className="text-xs text-gray-500">
                              Magic Number - Success
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFromNumber("+15005550000");
                            setFromNumberId("test-magic-000");
                            setIsFromNumberDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                        >
                          <CountryFlag
                            countryCode="US"
                            className="mr-3 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              +1 (500) 555-0000
                            </div>
                            <div className="text-xs text-gray-500">
                              Magic Number - Unavailable
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFromNumber("+15005550001");
                            setFromNumberId("test-magic-001");
                            setIsFromNumberDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                        >
                          <CountryFlag
                            countryCode="US"
                            className="mr-3 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              +1 (500) 555-0001
                            </div>
                            <div className="text-xs text-gray-500">
                              Magic Number - Invalid
                            </div>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {Array.isArray(phoneNumbersData) &&
                (phoneNumbersData as any[]).filter(
                  (n: any) => n.status === "active",
                ).length === 0 && (
                  <div className="mt-1 text-xs text-amber-600">
                    No tienes números de Twilio activos.{" "}
                    <a
                      href="/buy-phone-number"
                      className="underline font-medium"
                    >
                      Compra uno aquí
                    </a>
                  </div>
                )}
            </div>

            {/* To Phone Number */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  To Phone Number
                </label>
              </div>
              <div className="flex gap-2">
                {/* Country Selector */}
                <div className="relative w-40 flex-shrink-0" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsCountryDropdownOpen(!isCountryDropdownOpen)
                    }
                    className="w-full px-3 py-2.5 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <CountryFlag
                        countryCode={selectedCountry}
                        className="flex-shrink-0"
                      />
                      <span className="text-xs font-medium">
                        {getCountryCode(selectedCountry)}
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
                    <div className="absolute z-10 w-80 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
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
                      <div className="overflow-y-auto max-h-80">
                        {countriesLoading ? (
                          <div className="px-3 py-2 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                            <span className="text-sm ml-2">
                              Cargando países...
                            </span>
                          </div>
                        ) : availableCountries &&
                          Array.isArray(availableCountries) ? (
                          (() => {
                            // Filtrar países basándose en el término de búsqueda
                            const filteredCountries = availableCountries.filter(
                              (country: any) => {
                                const searchLower =
                                  countrySearchTerm.toLowerCase();
                                return (
                                  country.name
                                    .toLowerCase()
                                    .includes(searchLower) ||
                                  country.code
                                    .toLowerCase()
                                    .includes(searchLower) ||
                                  getCountryCode(country.code).includes(
                                    searchLower,
                                  )
                                );
                              },
                            );

                            if (filteredCountries.length === 0) {
                              return (
                                <div className="px-3 py-2 text-center text-gray-500 text-sm">
                                  No se encontraron países
                                </div>
                              );
                            }

                            return filteredCountries.map((country: any) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country.code);
                                  setIsCountryDropdownOpen(false);
                                  setCountrySearchTerm("");
                                }}
                                className={`w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center ${
                                  selectedCountry === country.code
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-900"
                                }`}
                              >
                                <CountryFlag
                                  countryCode={country.code}
                                  className="mr-2 flex-shrink-0"
                                />
                                <div className="flex-1">
                                  <span className="text-sm">
                                    {country.name}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {getCountryCode(country.code)}
                                </span>
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

                {/* Phone Number Input */}
                <div className="flex-1">
                  <input
                    type="tel"
                    value={toNumber}
                    onChange={(e) => setToNumber(e.target.value)}
                    placeholder="Número de teléfono"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunch}
            disabled={!fromNumber || !toNumber}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              !fromNumber || !toNumber
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "text-white bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Launch Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaunchCallModal;
