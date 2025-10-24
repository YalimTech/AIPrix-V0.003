import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChartBarIcon, CheckCircleIcon, HomeIcon, MagnifyingGlassIcon, PhoneIcon, } from "@heroicons/react/24/outline";
import React, { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePurchasedPhoneNumbers, useReleasePhoneNumber, useSyncPhoneNumbersWithElevenLabs, } from "../hooks/usePhoneNumbers";
import { apiClient } from "../lib/api";
// Componente profesional para mostrar banderas usando SVG desde CDN
const CountryFlag = ({ countryCode, className = "", }) => {
    // Validar que countryCode existe y no es undefined
    if (!countryCode) {
        return (_jsx("div", { className: `inline-block w-6 h-4 bg-gray-200 rounded ${className}`, title: "Unknown country" }));
    }
    return (_jsx("img", { src: `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`, srcSet: `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png 2x`, width: "24", height: "18", alt: `${countryCode} flag`, className: `inline-block ${className}`, style: { objectFit: "cover", borderRadius: "2px" } }));
};
const PurchasedNumbers = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All Numbers");
    const [releasingNumbers, setReleasingNumbers] = useState(new Set());
    const [isLoadingSync] = useState(false);
    // hasAttemptedAutoSync removido ya que no se usa más
    const queryClient = useQueryClient();
    const { data: purchasedNumbers, isLoading, error, } = usePurchasedPhoneNumbers();
    // Debug: Log component state (solo en desarrollo y optimizado)
    React.useEffect(() => {
        if (import.meta.env.MODE === "development" && import.meta.env.DEV) {
            console.log("📱 PurchasedNumbers - Component State:", {
                isLoading,
                hasError: !!error,
                errorMessage: error?.message,
                hasData: !!purchasedNumbers,
                dataLength: Array.isArray(purchasedNumbers)
                    ? purchasedNumbers.length
                    : "not array",
            });
        }
    }, [isLoading, error]); // Removido purchasedNumbers de las dependencias para evitar re-renders
    const releasePhoneNumber = useReleasePhoneNumber();
    const syncWithElevenLabs = useSyncPhoneNumbersWithElevenLabs();
    // Optimizar funciones de cambio para evitar re-renders innecesarios
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);
    const handleFilterChange = useCallback((e) => {
        setFilterStatus(e.target.value);
    }, []);
    // Usar datos reales de la API - NO hay datos mock
    const numbers = Array.isArray(purchasedNumbers) ? purchasedNumbers : [];
    // Removed unused isTwilioConfigMissing variable
    // Sincronización automática removida para evitar mensajes duplicados
    // La sincronización ahora solo se ejecuta manualmente cuando el usuario hace clic en "Sync"
    // Optimizar filtrado con useMemo para evitar re-renders innecesarios
    const filteredNumbers = useMemo(() => {
        return numbers.filter((number) => {
            const matchesSearch = (number.number || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            if (filterStatus === "All Numbers")
                return matchesSearch;
            if (filterStatus === "Activated Numbers")
                return matchesSearch && number.status === "active";
            if (filterStatus === "Inactive Numbers")
                return matchesSearch && number.status === "inactive";
            return matchesSearch;
        });
    }, [numbers, searchTerm, filterStatus]);
    const handleSyncSingleNumber = async (phoneNumberId) => {
        try {
            // Obtener el número específico
            const phoneNumber = numbers.find((n) => n.id === phoneNumberId);
            if (!phoneNumber) {
                alert("❌ Número no encontrado");
                return;
            }
            // Registrar el número en ElevenLabs
            const result = await apiClient.post("/integrations/elevenlabs/phone-numbers/register-single", {
                phoneNumberId: phoneNumber.id,
                phoneNumber: phoneNumber.number,
                twilioSid: phoneNumber.twilioSid,
            });
            const typedResult = result;
            if (typedResult.success) {
                alert(`✅ Número ${phoneNumber.number} sincronizado exitosamente con ElevenLabs`);
                // Usar invalidateQueries de forma más específica para evitar recargas completas
                queryClient.invalidateQueries({
                    queryKey: ["phoneNumbers", "purchased", "optimized"],
                    exact: true // Solo invalidar la query exacta
                });
            }
            else {
                alert(`❌ Error al sincronizar: ${typedResult.message || "Error desconocido"}`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            alert(`❌ Error al sincronizar: ${errorMessage}`);
        }
    };
    const handleReleaseNumber = async (numberId) => {
        try {
            // Agregar al estado de loading individual
            setReleasingNumbers((prev) => new Set(prev).add(numberId));
            // Pedir confirmación al usuario con mensaje detallado
            const confirmationText = prompt("⚠️ ADVERTENCIA: LIBERAR NÚMERO TELEFÓNICO\n\n" +
                "Al liberar este número:\n" +
                "• PERDERÁS el número permanentemente\n" +
                "• Ya NO podrás recibir llamadas ni SMS en este número\n" +
                "• Cualquier otra persona podrá comprarlo\n" +
                "• Ya no se cobrará la tarifa mensual\n\n" +
                "Esta acción NO se puede deshacer.\n\n" +
                "Para confirmar la liberación, escribe exactamente: RELEASE");
            console.log("Confirmation text received:", confirmationText);
            console.log('Is confirmation text "RELEASE"?', confirmationText === "RELEASE");
            if (confirmationText !== "RELEASE") {
                alert('❌ Cancelado. Debes escribir exactamente "RELEASE" para confirmar la liberación.');
                console.log("Release cancelled by user");
                // Resetear el estado de loading cuando se cancela
                setReleasingNumbers((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(numberId);
                    return newSet;
                });
                return;
            }
            console.log("Calling API with:", {
                phoneNumberId: numberId,
                confirmationText: "RELEASE",
            });
            const result = await releasePhoneNumber.mutateAsync({
                phoneNumberId: numberId,
                confirmationText: "RELEASE",
            });
            console.log("Number released successfully:", numberId, result);
            // Mostrar mensaje apropiado según si fue simulado o real
            if (result?.isSimulated) {
                alert("✅ Número liberado exitosamente (SIMULADO - Cuenta de prueba).\n\n⚠️ NOTA: Con credenciales de prueba, la liberación es simulada ya que Twilio no soporta operaciones DELETE con credenciales de prueba.\n\nEl número ya no está disponible en tu cuenta.");
            }
            else {
                alert("✅ Número liberado exitosamente.\n\nEl número ya no está disponible en tu cuenta y ya no se cobrará la tarifa mensual.");
            }
        }
        catch (error) {
            console.error("Error releasing number:", error);
            const errorMessage = (() => {
                if (error && typeof error === "object") {
                    if ("message" in error && error.message) {
                        return String(error.message);
                    }
                    if ("toString" in error && typeof error.toString === "function") {
                        return error.toString();
                    }
                }
                return "Error al liberar el número";
            })();
            alert(errorMessage);
        }
        finally {
            // Remover del estado de loading individual
            setReleasingNumbers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(numberId);
                return newSet;
            });
        }
    };
    // Botón manual de sincronización eliminado: la sincronización ocurre automáticamente
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("nav", { className: "flex", "aria-label": "Breadcrumb", children: _jsxs("ol", { className: "inline-flex items-center space-x-1 md:space-x-3", children: [_jsx("li", { className: "inline-flex items-center", children: _jsxs("a", { href: "/dashboard", className: "text-gray-700 hover:text-blue-600", children: [_jsx(HomeIcon, { className: "w-4 h-4 mr-2" }), "Dashboard"] }) }), _jsx("li", { children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "w-6 h-6 text-gray-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }), _jsx("span", { className: "ml-1 text-gray-500 md:ml-2", children: "Phone Numbers" })] }) })] }) }), _jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Phone Numbers" }) }), _jsx("div", { className: "border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", children: [_jsxs("a", { href: "/purchased-numbers", className: "whitespace-nowrap py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 flex items-center", children: [_jsx(ChartBarIcon, { className: "w-4 h-4 mr-1" }), "Purchased Phone Numbers"] }), _jsxs("a", { href: "/buy-number", className: "whitespace-nowrap py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center", children: [_jsx(PhoneIcon, { className: "w-4 h-4 mr-1" }), "Buy Phone Numbers"] })] }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Filter By" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "relative", children: [_jsx(MagnifyingGlassIcon, { className: "h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search Number", value: searchTerm, onChange: handleSearchChange, className: "pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("select", { value: filterStatus, onChange: handleFilterChange, className: "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "All Numbers", children: "All Numbers" }), _jsx("option", { value: "Activated Numbers", children: "Activated Numbers" }), _jsx("option", { value: "Inactive Numbers", children: "Inactive Numbers" })] })] })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsx("button", { onClick: () => syncWithElevenLabs.mutate(), disabled: syncWithElevenLabs.isPending || isLoadingSync, className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", title: "Sincronizar todos los n\u00FAmeros con ElevenLabs", children: syncWithElevenLabs.isPending || isLoadingSync ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Sincronizando..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircleIcon, { className: "h-4 w-4 text-white mr-2" }), "Sync All with ElevenLabs"] })) }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Number" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Country" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Capabilities" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "ElevenLabs" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredNumbers.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "px-6 py-12 text-center text-gray-500", children: isLoading ? (_jsxs("div", { className: "flex items-center justify-center", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2" }), "Cargando n\u00FAmeros..."] })) : error ? (_jsx("div", { className: "text-center", children: _jsxs("div", { className: "text-red-600 mb-4", children: [_jsx(PhoneIcon, { className: "mx-auto h-12 w-12 text-red-400 mb-2" }), _jsx("p", { className: "text-lg font-medium", children: "Error cargando n\u00FAmeros" }), _jsx("p", { className: "text-sm", children: error.message }), error.message?.includes("Credenciales de Twilio no configuradas") && (_jsx("div", { className: "mt-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-left", children: _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx(PhoneIcon, { className: "w-5 h-5 text-blue-600" }) }) }), _jsxs("div", { className: "ml-4 flex-1", children: [_jsx("h4", { className: "text-lg font-semibold text-blue-900 mb-2", children: "Conecta tu Cuenta de Twilio" }), _jsx("p", { className: "text-blue-800 mb-4", children: "Para gestionar tus n\u00FAmeros telef\u00F3nicos, necesitas conectar tu cuenta de Twilio. Esto te permitir\u00E1 ver todos los n\u00FAmeros que tienes en tu cuenta y comprar nuevos n\u00FAmeros." }), _jsxs("div", { className: "bg-white p-4 rounded-lg border border-blue-300 shadow-sm", children: [_jsxs("h5", { className: "font-medium text-gray-900 mb-3 flex items-center", children: [_jsx("span", { className: "w-2 h-2 bg-blue-500 rounded-full mr-2" }), "C\u00F3mo configurar Twilio:"] }), _jsxs("ol", { className: "space-y-2 text-sm text-gray-700", children: [_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5", children: "1" }), _jsxs("span", { children: ["Ve a ", _jsx("strong", { children: "Configuraci\u00F3n" }), " en el men\u00FA lateral"] })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5", children: "2" }), _jsxs("span", { children: ["Busca la secci\u00F3n", " ", _jsx("strong", { children: "\"Integraci\u00F3n Twilio\"" })] })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5", children: "3" }), _jsxs("span", { children: ["Ingresa tu", " ", _jsx("strong", { children: "Account SID" }), " y", " ", _jsx("strong", { children: "Auth Token" })] })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5", children: "4" }), _jsx("span", { children: "Guarda la configuraci\u00F3n y regresa aqu\u00ED" })] })] })] }), _jsx("div", { className: "mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md", children: _jsxs("p", { className: "text-sm text-yellow-800", children: [_jsx("strong", { children: "\uD83D\uDCA1 Tip:" }), " Tus credenciales de Twilio se encuentran en el", _jsx("a", { href: "https://console.twilio.com/", target: "_blank", rel: "noopener noreferrer", className: "underline hover:text-yellow-900", children: "Console de Twilio" })] }) })] })] }) }))] }) })) : (_jsxs("div", { children: [_jsx(PhoneIcon, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-900 mb-2", children: "No hay n\u00FAmeros comprados" }), _jsx("p", { className: "text-gray-500 mb-4", children: "Compra tu primer n\u00FAmero de tel\u00E9fono para comenzar." }), _jsxs("div", { className: "text-sm text-gray-400 space-y-1 mb-4", children: [_jsx("p", { children: "\u2022 Los n\u00FAmeros comprados aparecer\u00E1n aqu\u00ED" }), _jsx("p", { children: "\u2022 Puedes asignar n\u00FAmeros a agentes" }), _jsx("p", { children: "\u2022 Puedes liberar n\u00FAmeros cuando no los necesites" })] }), _jsx("div", { className: "flex space-x-3", children: _jsx("a", { href: "/buy-number", className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700", children: "Comprar N\u00FAmero" }) })] })) }) })) : (filteredNumbers.map((number) => (_jsxs("tr", { children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CountryFlag, { countryCode: number.country, className: "mr-3 flex-shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: number.number }), number.assignedAgentId && (_jsx("div", { className: "text-xs text-gray-500", children: "Asignado a agente" }))] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: "text-sm text-gray-900", children: number.country }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "flex flex-wrap gap-1", children: (number.capabilities || []).map((capability) => (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: capability }, capability))) }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${number.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : number.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"}`, children: number.status === "active"
                                                        ? "Active"
                                                        : number.status === "pending"
                                                            ? "Pending"
                                                            : "Inactive" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: number.elevenLabsPhoneNumberId ? (
                                                // Número ya sincronizado - mostrar estado de éxito
                                                _jsxs("div", { className: "inline-flex items-center text-xs text-gray-600", children: [_jsx(CheckCircleIcon, { className: "h-3.5 w-3.5 text-green-500 mr-1" }), "Synced"] })) : (
                                                // Número no sincronizado - mostrar botón de sincronización
                                                _jsx("button", { onClick: () => handleSyncSingleNumber(number.id), disabled: syncWithElevenLabs.isPending, className: "inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", title: "Sincronizar este n\u00FAmero con ElevenLabs", children: syncWithElevenLabs.isPending ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" }), "Sincronizando..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircleIcon, { className: "h-3.5 w-3.5 text-white mr-1" }), "Sync"] })) })) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("button", { onClick: () => handleReleaseNumber(number.id), disabled: releasingNumbers.has(number.id), title: "\u26A0\uFE0F Liberar n\u00FAmero - PERDER\u00C1S este n\u00FAmero permanentemente y cualquier persona podr\u00E1 comprarlo", className: "inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed", children: releasingNumbers.has(number.id)
                                                        ? "Releasing..."
                                                        : "Release" }) })] }, number.id)))) })] }) }), filteredNumbers.length > 0 && (_jsxs("div", { className: "bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6", children: [_jsx("div", { className: "flex items-center", children: _jsxs("span", { className: "text-sm text-gray-700", children: ["Mostrando ", filteredNumbers.length, " de ", numbers.length, " n\u00FAmeros"] }) }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("span", { className: "text-sm text-gray-700", children: ["Total: ", numbers.length, " n\u00FAmeros"] }) })] }))] })] }));
};
export default PurchasedNumbers;
