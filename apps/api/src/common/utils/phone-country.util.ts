const NANP_AREA_CODES: Array<{ prefix: string; country: string }> = [
  { prefix: '+1-264', country: 'AI' },
  { prefix: '+1-268', country: 'AG' },
  { prefix: '+1-242', country: 'BS' },
  { prefix: '+1-246', country: 'BB' },
  { prefix: '+1-441', country: 'BM' },
  { prefix: '+1-284', country: 'VG' },
  { prefix: '+1-345', country: 'KY' },
  { prefix: '+1-767', country: 'DM' },
  { prefix: '+1-787', country: 'PR' },
  { prefix: '+1-939', country: 'PR' },
  { prefix: '+1-809', country: 'DO' },
  { prefix: '+1-829', country: 'DO' },
  { prefix: '+1-849', country: 'DO' },
  { prefix: '+1-868', country: 'TT' },
  { prefix: '+1-649', country: 'TC' },
  { prefix: '+1-869', country: 'KN' },
  { prefix: '+1-758', country: 'LC' },
  { prefix: '+1-784', country: 'VC' },
  { prefix: '+1', country: 'US' },
];

const CALLING_CODES: Record<string, string> = {
  '+52': 'MX',
  '+53': 'CU',
  '+54': 'AR',
  '+55': 'BR',
  '+56': 'CL',
  '+57': 'CO',
  '+58': 'VE',
  '+34': 'ES',
  '+39': 'IT',
  '+44': 'GB',
  '+49': 'DE',
  '+61': 'AU',
  '+62': 'ID',
};

export function resolvePhoneCountry(params: {
  phoneNumber?: string | null;
  isoCountry?: string | null;
  countryCode?: string | null;
}): string {
  const { phoneNumber, isoCountry, countryCode } = params;

  // NORMALIZAR Y VALIDAR isoCountry
  // Si Twilio devuelve un isoCountry válido y no es "US", usarlo
  const normalizedIso = normalizeCountryCode(isoCountry);
  if (normalizedIso && normalizedIso !== 'US') {
    return normalizedIso;
  }

  // Si el isoCountry es "US" o no existe, intentar determinar por el número de teléfono
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (normalizedCountryCode && normalizedCountryCode !== 'US') {
    return normalizedCountryCode;
  }

  if (!phoneNumber) {
    return 'US';
  }

  const normalized = normalizePhoneNumber(phoneNumber);

  // Primero verificar códigos de llamada internacionales (no NANP)
  const sortedCodes = Object.keys(CALLING_CODES).sort(
    (a, b) => b.length - a.length,
  );

  for (const code of sortedCodes) {
    const canonicalCode = normalizePhoneNumber(code);
    if (normalized.startsWith(canonicalCode)) {
      return CALLING_CODES[code];
    }
  }

  // Luego verificar códigos NANP (países que usan +1)
  for (const mapping of NANP_AREA_CODES) {
    const canonicalPrefix = normalizePhoneNumber(mapping.prefix);
    if (normalized.startsWith(canonicalPrefix)) {
      return mapping.country;
    }
  }

  return 'US';
}

function normalizeCountryCode(code?: string | null): string | null {
  if (!code) {
    return null;
  }

  const trimmed = code.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.toUpperCase();
}

function normalizePhoneNumber(raw: string): string {
  if (!raw) {
    return '';
  }

  return raw.replace(/[^\d+]/g, '');
}
