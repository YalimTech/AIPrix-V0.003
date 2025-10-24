import {
    ChartBarIcon,
    CheckCircleIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    usePurchasedPhoneNumbers,
    useReleasePhoneNumber,
    useSyncPhoneNumbersWithElevenLabs,
} from "../hooks/usePhoneNumbers";
import { apiClient } from "../lib/api";

// Componente profesional para mostrar banderas usando SVG desde CDN
const CountryFlag: React.FC<{ countryCode: string; className?: string }> = ({
  countryCode,
  className = "",
}) => {
  // Validar que countryCode existe y no es undefined
  if (!countryCode) {
    return (
      <div
        className={`inline-block w-6 h-4 bg-gray-200 rounded ${className}`}
        title="Unknown country"
      />
    );
  }

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

const PurchasedNumbers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Numbers");
  const [releasingNumbers, setReleasingNumbers] = useState<Set<string>>(
    new Set(),
  );
  const [isLoadingSync] = useState(false);

  // hasAttemptedAutoSync removido ya que no se usa más
  const queryClient = useQueryClient();

  const {
    data: purchasedNumbers,
    isLoading,
    error,
  } = usePurchasedPhoneNumbers();

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
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
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

      if (filterStatus === "All Numbers") return matchesSearch;
      if (filterStatus === "Activated Numbers")
        return matchesSearch && number.status === "active";
      if (filterStatus === "Inactive Numbers")
        return matchesSearch && number.status === "inactive";

      return matchesSearch;
    });
  }, [numbers, searchTerm, filterStatus]);

  const handleSyncSingleNumber = async (phoneNumberId: string) => {
    try {
      // Obtener el número específico
      const phoneNumber = numbers.find((n: { id: string }) => n.id === phoneNumberId);

      if (!phoneNumber) {
        alert("❌ Número no encontrado");
        return;
      }

      // Registrar el número en ElevenLabs
      const result = await apiClient.post(
        "/integrations/elevenlabs/phone-numbers/register-single",
        {
          phoneNumberId: phoneNumber.id,
          phoneNumber: phoneNumber.number,
          twilioSid: phoneNumber.twilioSid,
        },
      );

      const typedResult = result as {
        success?: boolean;
        phone_number_id?: string;
        message?: string;
      };

      if (typedResult.success) {
        alert(
          `✅ Número ${phoneNumber.number} sincronizado exitosamente con ElevenLabs`,
        );
        // Usar invalidateQueries de forma más específica para evitar recargas completas
        queryClient.invalidateQueries({
          queryKey: ["phoneNumbers", "purchased", "optimized"],
          exact: true // Solo invalidar la query exacta
        });
      } else {
        alert(
          `❌ Error al sincronizar: ${typedResult.message || "Error desconocido"}`,
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert(`❌ Error al sincronizar: ${errorMessage}`);
    }
  };

  const handleReleaseNumber = async (numberId: string) => {
    try {
      // Agregar al estado de loading individual
      setReleasingNumbers((prev) => new Set(prev).add(numberId));

      // Pedir confirmación al usuario con mensaje detallado
      const confirmationText = prompt(
        "⚠️ ADVERTENCIA: LIBERAR NÚMERO TELEFÓNICO\n\n" +
          "Al liberar este número:\n" +
          "• PERDERÁS el número permanentemente\n" +
          "• Ya NO podrás recibir llamadas ni SMS en este número\n" +
          "• Cualquier otra persona podrá comprarlo\n" +
          "• Ya no se cobrará la tarifa mensual\n\n" +
          "Esta acción NO se puede deshacer.\n\n" +
          "Para confirmar la liberación, escribe exactamente: RELEASE",
      );

      console.log("Confirmation text received:", confirmationText);
      console.log(
        'Is confirmation text "RELEASE"?',
        confirmationText === "RELEASE",
      );

      if (confirmationText !== "RELEASE") {
        alert(
          '❌ Cancelado. Debes escribir exactamente "RELEASE" para confirmar la liberación.',
        );
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
      if ((result as { isSimulated?: boolean })?.isSimulated) {
        alert(
          "✅ Número liberado exitosamente (SIMULADO - Cuenta de prueba).\n\n⚠️ NOTA: Con credenciales de prueba, la liberación es simulada ya que Twilio no soporta operaciones DELETE con credenciales de prueba.\n\nEl número ya no está disponible en tu cuenta.",
        );
      } else {
        alert(
          "✅ Número liberado exitosamente.\n\nEl número ya no está disponible en tu cuenta y ya no se cobrará la tarifa mensual.",
        );
      }
    } catch (error: unknown) {
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
    } finally {
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
            className="whitespace-nowrap py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 flex items-center"
          >
            <ChartBarIcon className="w-4 h-4 mr-1" />
            Purchased Phone Numbers
          </a>
          <a
            href="/buy-number"
            className="whitespace-nowrap py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center"
          >
            <PhoneIcon className="w-4 h-4 mr-1" />
            Buy Phone Numbers
          </a>
        </nav>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter By</span>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Number"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All Numbers">All Numbers</option>
              <option value="Activated Numbers">Activated Numbers</option>
              <option value="Inactive Numbers">Inactive Numbers</option>
            </select>
          </div>
        </div>

        {/* Botón de sincronización masiva */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => syncWithElevenLabs.mutate()}
            disabled={syncWithElevenLabs.isPending || isLoadingSync}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sincronizar todos los números con ElevenLabs"
          >
            {syncWithElevenLabs.isPending || isLoadingSync ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sincronizando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 text-white mr-2" />
                Sync All with ElevenLabs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Purchased Numbers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capabilities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ElevenLabs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNumbers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></div>
                        Cargando números...
                      </div>
                    ) : error ? (
                      <div className="text-center">
                        <div className="text-red-600 mb-4">
                          <PhoneIcon className="mx-auto h-12 w-12 text-red-400 mb-2" />
                          <p className="text-lg font-medium">
                            Error cargando números
                          </p>
                          <p className="text-sm">{error.message}</p>

                          {/* Información específica para credenciales no configuradas */}
                          {error.message?.includes(
                            "Credenciales de Twilio no configuradas",
                          ) && (
                            <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-left">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <PhoneIcon className="w-5 h-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4 flex-1">
                                  <h4 className="text-lg font-semibold text-blue-900 mb-2">
                                    Conecta tu Cuenta de Twilio
                                  </h4>
                                  <p className="text-blue-800 mb-4">
                                    Para gestionar tus números telefónicos,
                                    necesitas conectar tu cuenta de Twilio. Esto
                                    te permitirá ver todos los números que
                                    tienes en tu cuenta y comprar nuevos
                                    números.
                                  </p>

                                  <div className="bg-white p-4 rounded-lg border border-blue-300 shadow-sm">
                                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                      Cómo configurar Twilio:
                                    </h5>
                                    <ol className="space-y-2 text-sm text-gray-700">
                                      <li className="flex items-start">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                                          1
                                        </span>
                                        <span>
                                          Ve a <strong>Configuración</strong> en
                                          el menú lateral
                                        </span>
                                      </li>
                                      <li className="flex items-start">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                                          2
                                        </span>
                                        <span>
                                          Busca la sección{" "}
                                          <strong>"Integración Twilio"</strong>
                                        </span>
                                      </li>
                                      <li className="flex items-start">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                                          3
                                        </span>
                                        <span>
                                          Ingresa tu{" "}
                                          <strong>Account SID</strong> y{" "}
                                          <strong>Auth Token</strong>
                                        </span>
                                      </li>
                                      <li className="flex items-start">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                                          4
                                        </span>
                                        <span>
                                          Guarda la configuración y regresa aquí
                                        </span>
                                      </li>
                                    </ol>
                                  </div>

                                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-800">
                                      <strong>💡 Tip:</strong> Tus credenciales
                                      de Twilio se encuentran en el
                                      <a
                                        href="https://console.twilio.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-yellow-900"
                                      >
                                        Console de Twilio
                                      </a>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <PhoneIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          No hay números comprados
                        </p>
                        <p className="text-gray-500 mb-4">
                          Compra tu primer número de teléfono para comenzar.
                        </p>
                        <div className="text-sm text-gray-400 space-y-1 mb-4">
                          <p>• Los números comprados aparecerán aquí</p>
                          <p>• Puedes asignar números a agentes</p>
                          <p>
                            • Puedes liberar números cuando no los necesites
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <a
                            href="/buy-number"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Comprar Número
                          </a>
                          {/* Botón de sincronización manual removido por UX: sincroniza al guardar credenciales o automáticamente cuando no hay números */}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredNumbers.map((number) => (
                  <tr key={number.id}>
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
                          {number.assignedAgentId && (
                            <div className="text-xs text-gray-500">
                              Asignado a agente
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {number.country}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {(number.capabilities || []).map(
                          (capability: string) => (
                            <span
                              key={capability}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {capability}
                            </span>
                          ),
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          number.status === "active"
                            ? "bg-green-100 text-green-800"
                            : number.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {number.status === "active"
                          ? "Active"
                          : number.status === "pending"
                            ? "Pending"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {number.elevenLabsPhoneNumberId ? (
                        // Número ya sincronizado - mostrar estado de éxito
                        <div className="inline-flex items-center text-xs text-gray-600">
                          <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 mr-1" />
                          Synced
                        </div>
                      ) : (
                        // Número no sincronizado - mostrar botón de sincronización
                        <button
                          onClick={() => handleSyncSingleNumber(number.id)}
                          disabled={syncWithElevenLabs.isPending}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Sincronizar este número con ElevenLabs"
                        >
                          {syncWithElevenLabs.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Sincronizando...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-3.5 w-3.5 text-white mr-1" />
                              Sync
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleReleaseNumber(number.id)}
                        disabled={releasingNumbers.has(number.id)}
                        title="⚠️ Liberar número - PERDERÁS este número permanentemente y cualquier persona podrá comprarlo"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {releasingNumbers.has(number.id)
                          ? "Releasing..."
                          : "Release"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredNumbers.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Mostrando {filteredNumbers.length} de {numbers.length} números
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Total: {numbers.length} números
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasedNumbers;
