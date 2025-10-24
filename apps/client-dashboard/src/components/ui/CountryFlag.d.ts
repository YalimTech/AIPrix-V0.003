import React from 'react';
interface CountryFlagProps {
    countryCode: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}
/**
 * CountryFlag Component
 * Displays a country flag emoji based on ISO country code
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US", "MX", "ES")
 * @param className - Additional CSS classes
 * @param size - Size variant (sm, md, lg)
 */
declare const CountryFlag: React.FC<CountryFlagProps>;
export default CountryFlag;
