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
const CountryFlag: React.FC<CountryFlagProps> = ({ 
  countryCode, 
  className = '', 
  size = 'md' 
}) => {
  const getFlagEmoji = (code: string): string => {
    const upperCode = code.toUpperCase();
    
    // Convert country code to flag emoji
    // Each flag emoji is constructed from regional indicator symbols
    // A = 🇦 (U+1F1E6), B = 🇧 (U+1F1E7), etc.
    const base = 0x1F1E6; // Regional Indicator Symbol Letter A
    const firstChar = upperCode.charCodeAt(0) - 'A'.charCodeAt(0);
    const secondChar = upperCode.charCodeAt(1) - 'A'.charCodeAt(0);
    
    if (firstChar < 0 || firstChar > 25 || secondChar < 0 || secondChar > 25) {
      return '🌐'; // Globe emoji as fallback
    }
    
    const firstEmoji = String.fromCodePoint(base + firstChar);
    const secondEmoji = String.fromCodePoint(base + secondChar);
    
    return firstEmoji + secondEmoji;
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <span 
      className={`inline-block ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={`Flag of ${countryCode}`}
      title={`Flag of ${countryCode}`}
    >
      {getFlagEmoji(countryCode)}
    </span>
  );
};

export default CountryFlag;

