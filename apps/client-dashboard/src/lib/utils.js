/**
 * Utilidades generales para el dashboard
 */
/**
 * Formatear duración en segundos a formato legible
 */
export const formatDuration = (seconds) => {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (minutes < 60) {
        return remainingSeconds > 0
            ? `${minutes}m ${remainingSeconds}s`
            : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
    }
    return `${hours}h`;
};
/**
 * Formatear fecha Unix a formato legible
 */
export const formatDate = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
/**
 * Formatear fecha ISO string a formato legible
 */
export const formatISODate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
/**
 * Formatear hora Unix a formato legible
 */
export const formatTime = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });
};
/**
 * Formatear hora ISO string a formato legible
 */
export const formatISOTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });
};
/**
 * Formatear fecha y hora Unix a formato completo
 */
export const formatDateTime = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
/**
 * Formatear número con separadores de miles
 */
export const formatNumber = (num) => {
    return new Intl.NumberFormat("es-ES").format(num);
};
/**
 * Formatear moneda
 */
export const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currency,
    }).format(amount);
};
/**
 * Truncar texto a una longitud específica
 */
export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength) + "...";
};
/**
 * Capitalizar primera letra
 */
export const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
/**
 * Generar ID único
 */
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};
/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
/**
 * Verificar si una fecha está en el rango de fechas
 */
export const isDateInRange = (date, startDate, endDate) => {
    return date >= startDate && date <= endDate;
};
/**
 * Obtener diferencia en días entre dos fechas
 */
export const getDaysDifference = (date1, date2) => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
/**
 * Obtener fecha de hace X días
 */
export const getDateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};
/**
 * Obtener fecha de hace X horas
 */
export const getDateHoursAgo = (hours) => {
    const date = new Date();
    date.setHours(date.getHours() - hours);
    return date;
};
/**
 * Convertir fecha a Unix timestamp
 */
export const dateToUnix = (date) => {
    return Math.floor(date.getTime() / 1000);
};
/**
 * Convertir Unix timestamp a fecha
 */
export const unixToDate = (unixTimestamp) => {
    return new Date(unixTimestamp * 1000);
};
/**
 * Verificar si es un número de teléfono válido
 */
export const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ""));
};
/**
 * Formatear número de teléfono
 */
export const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    else if (cleaned.length === 11 && cleaned.startsWith("1")) {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phoneNumber;
};
/**
 * Obtener iniciales de un nombre
 */
export const getInitials = (name) => {
    return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
};
/**
 * Generar color aleatorio para avatares
 */
export const generateAvatarColor = (seed) => {
    const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};
/**
 * Clasificar texto según sentimiento
 */
export const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
        case "positive":
            return "text-green-600 bg-green-100";
        case "negative":
            return "text-red-600 bg-red-100";
        case "neutral":
            return "text-gray-600 bg-gray-100";
        default:
            return "text-gray-600 bg-gray-100";
    }
};
/**
 * Obtener badge de estado
 */
export const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
        case "success":
        case "completed":
        case "done":
            return { color: "bg-green-100 text-green-800", text: "Exitoso" };
        case "failure":
        case "failed":
            return { color: "bg-red-100 text-red-800", text: "Fallido" };
        case "in-progress":
        case "processing":
            return { color: "bg-yellow-100 text-yellow-800", text: "En Proceso" };
        case "initiated":
            return { color: "bg-blue-100 text-blue-800", text: "Iniciado" };
        default:
            return { color: "bg-gray-100 text-gray-800", text: "Desconocido" };
    }
};
/**
 * Calcular porcentaje
 */
export const calculatePercentage = (value, total) => {
    if (total === 0)
        return 0;
    return Math.round((value / total) * 100);
};
/**
 * Ordenar array por campo específico
 */
export const sortBy = (array, field, direction = "asc") => {
    return [...array].sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];
        if (aValue < bValue)
            return direction === "asc" ? -1 : 1;
        if (aValue > bValue)
            return direction === "asc" ? 1 : -1;
        return 0;
    });
};
/**
 * Filtrar array por término de búsqueda
 */
export const filterBySearch = (array, searchTerm, searchFields) => {
    if (!searchTerm.trim())
        return array;
    const term = searchTerm.toLowerCase();
    return array.filter((item) => searchFields.some((field) => {
        const value = item[field];
        return typeof value === "string" && value.toLowerCase().includes(term);
    }));
};
