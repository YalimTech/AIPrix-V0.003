/**
 * Utilidades generales para el dashboard
 */
/**
 * Formatear duración en segundos a formato legible
 */
export declare const formatDuration: (seconds: number) => string;
/**
 * Formatear fecha Unix a formato legible
 */
export declare const formatDate: (unixTimestamp: number) => string;
/**
 * Formatear fecha ISO string a formato legible
 */
export declare const formatISODate: (isoString: string) => string;
/**
 * Formatear hora Unix a formato legible
 */
export declare const formatTime: (unixTimestamp: number) => string;
/**
 * Formatear hora ISO string a formato legible
 */
export declare const formatISOTime: (isoString: string) => string;
/**
 * Formatear fecha y hora Unix a formato completo
 */
export declare const formatDateTime: (unixTimestamp: number) => string;
/**
 * Formatear número con separadores de miles
 */
export declare const formatNumber: (num: number) => string;
/**
 * Formatear moneda
 */
export declare const formatCurrency: (amount: number, currency?: string) => string;
/**
 * Truncar texto a una longitud específica
 */
export declare const truncateText: (text: string, maxLength: number) => string;
/**
 * Capitalizar primera letra
 */
export declare const capitalize: (text: string) => string;
/**
 * Generar ID único
 */
export declare const generateId: () => string;
/**
 * Debounce function
 */
export declare const debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => ((...args: Parameters<T>) => void);
/**
 * Verificar si una fecha está en el rango de fechas
 */
export declare const isDateInRange: (date: Date, startDate: Date, endDate: Date) => boolean;
/**
 * Obtener diferencia en días entre dos fechas
 */
export declare const getDaysDifference: (date1: Date, date2: Date) => number;
/**
 * Obtener fecha de hace X días
 */
export declare const getDateDaysAgo: (days: number) => Date;
/**
 * Obtener fecha de hace X horas
 */
export declare const getDateHoursAgo: (hours: number) => Date;
/**
 * Convertir fecha a Unix timestamp
 */
export declare const dateToUnix: (date: Date) => number;
/**
 * Convertir Unix timestamp a fecha
 */
export declare const unixToDate: (unixTimestamp: number) => Date;
/**
 * Verificar si es un número de teléfono válido
 */
export declare const isValidPhoneNumber: (phoneNumber: string) => boolean;
/**
 * Formatear número de teléfono
 */
export declare const formatPhoneNumber: (phoneNumber: string) => string;
/**
 * Obtener iniciales de un nombre
 */
export declare const getInitials: (name: string) => string;
/**
 * Generar color aleatorio para avatares
 */
export declare const generateAvatarColor: (seed: string) => string;
/**
 * Clasificar texto según sentimiento
 */
export declare const getSentimentColor: (sentiment: string) => string;
/**
 * Obtener badge de estado
 */
export declare const getStatusBadge: (status: string) => {
    color: string;
    text: string;
};
/**
 * Calcular porcentaje
 */
export declare const calculatePercentage: (value: number, total: number) => number;
/**
 * Ordenar array por campo específico
 */
export declare const sortBy: <T>(array: T[], field: keyof T, direction?: "asc" | "desc") => T[];
/**
 * Filtrar array por término de búsqueda
 */
export declare const filterBySearch: <T>(array: T[], searchTerm: string, searchFields: (keyof T)[]) => T[];
