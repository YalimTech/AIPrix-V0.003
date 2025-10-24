/**
 * Country codes mapping for phone numbers
 * Maps ISO country codes to their international dialing codes
 */

const countryCodeMap: Record<string, string> = {
  // North America
  "US": "1",
  "CA": "1",
  "MX": "52",
  
  // Caribbean
  "CU": "53",
  "DO": "1",
  "PR": "1",
  "JM": "1",
  "HT": "509",
  "TT": "1",
  
  // Central America
  "GT": "502",
  "BZ": "501",
  "SV": "503",
  "HN": "504",
  "NI": "505",
  "CR": "506",
  "PA": "507",
  
  // South America
  "CO": "57",
  "VE": "58",
  "EC": "593",
  "PE": "51",
  "BO": "591",
  "PY": "595",
  "UY": "598",
  "AR": "54",
  "CL": "56",
  "BR": "55",
  "GY": "592",
  "SR": "597",
  "GF": "594",
  "FK": "500",
  
  // Europe
  "GB": "44",
  "IE": "353",
  "FR": "33",
  "ES": "34",
  "PT": "351",
  "IT": "39",
  "DE": "49",
  "AT": "43",
  "CH": "41",
  "BE": "32",
  "NL": "31",
  "LU": "352",
  "PL": "48",
  "CZ": "420",
  "SK": "421",
  "HU": "36",
  "RO": "40",
  "BG": "359",
  "GR": "30",
  "TR": "90",
  "RU": "7",
  "UA": "380",
  "BY": "375",
  "LT": "370",
  "LV": "371",
  "EE": "372",
  "FI": "358",
  "SE": "46",
  "NO": "47",
  "DK": "45",
  "IS": "354",
  
  // Middle East
  "IL": "972",
  "PS": "970",
  "JO": "962",
  "LB": "961",
  "SY": "963",
  "IQ": "964",
  "IR": "98",
  "SA": "966",
  "YE": "967",
  "OM": "968",
  "AE": "971",
  "QA": "974",
  "BH": "973",
  "KW": "965",
  
  // Asia
  "AF": "93",
  "PK": "92",
  "IN": "91",
  "BD": "880",
  "LK": "94",
  "NP": "977",
  "BT": "975",
  "MV": "960",
  "CN": "86",
  "TW": "886",
  "HK": "852",
  "MO": "853",
  "JP": "81",
  "KR": "82",
  "KP": "850",
  "MN": "976",
  "KZ": "7",
  "UZ": "998",
  "TM": "993",
  "TJ": "992",
  "KG": "996",
  "TH": "66",
  "LA": "856",
  "KH": "855",
  "VN": "84",
  "MY": "60",
  "SG": "65",
  "BN": "673",
  "ID": "62",
  "PH": "63",
  "MM": "95",
  
  // Oceania
  "AU": "61",
  "NZ": "64",
  "PG": "675",
  "FJ": "679",
  "NC": "687",
  "PF": "689",
  "WS": "685",
  "TO": "676",
  "VU": "678",
  "SB": "677",
  "KI": "686",
  "TV": "688",
  "NR": "674",
  "PW": "680",
  "FM": "691",
  "MH": "692",
  "GU": "1",
  "MP": "1",
  "AS": "1",
  
  // Africa
  "EG": "20",
  "LY": "218",
  "TN": "216",
  "DZ": "213",
  "MA": "212",
  "EH": "212",
  "SD": "249",
  "SS": "211",
  "ET": "251",
  "ER": "291",
  "DJ": "253",
  "SO": "252",
  "KE": "254",
  "UG": "256",
  "TZ": "255",
  "RW": "250",
  "BI": "257",
  "MZ": "258",
  "MG": "261",
  "KM": "269",
  "SC": "248",
  "MU": "230",
  "RE": "262",
  "YT": "262",
  "ZW": "263",
  "ZM": "260",
  "MW": "265",
  "LS": "266",
  "SZ": "268",
  "ZA": "27",
  "BW": "267",
  "NA": "264",
  "AO": "244",
  "CD": "243",
  "CG": "242",
  "CF": "236",
  "TD": "235",
  "CM": "237",
  "GQ": "240",
  "GA": "241",
  "ST": "239",
  "GH": "233",
  "TG": "228",
  "BJ": "229",
  "NE": "227",
  "BF": "226",
  "ML": "223",
  "MR": "222",
  "SN": "221",
  "GM": "220",
  "GW": "245",
  "GN": "224",
  "SL": "232",
  "LR": "231",
  "CI": "225",
  "NG": "234",
  "CV": "238",
  "SH": "290",
};

/**
 * Get the international dialing code for a country
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US", "MX", "ES")
 * @returns The international dialing code (e.g., "1", "52", "34")
 * @example
 * getCountryCode("US") // returns "1"
 * getCountryCode("MX") // returns "52"
 */
export function getCountryCode(countryCode: string): string {
  const code = countryCode.toUpperCase();
  return countryCodeMap[code] || "1"; // Default to US code if not found
}

/**
 * Get all available country codes
 * @returns Array of country codes
 */
export function getAllCountryCodes(): string[] {
  return Object.keys(countryCodeMap);
}

/**
 * Check if a country code exists
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns True if the country code exists
 */
export function hasCountryCode(countryCode: string): boolean {
  return countryCode.toUpperCase() in countryCodeMap;
}

