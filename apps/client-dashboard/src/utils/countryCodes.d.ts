/**
 * Country codes mapping for phone numbers
 * Maps ISO country codes to their international dialing codes
 */
/**
 * Get the international dialing code for a country
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US", "MX", "ES")
 * @returns The international dialing code (e.g., "1", "52", "34")
 * @example
 * getCountryCode("US") // returns "1"
 * getCountryCode("MX") // returns "52"
 */
export declare function getCountryCode(countryCode: string): string;
/**
 * Get all available country codes
 * @returns Array of country codes
 */
export declare function getAllCountryCodes(): string[];
/**
 * Check if a country code exists
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns True if the country code exists
 */
export declare function hasCountryCode(countryCode: string): boolean;
