import React, { useState, useEffect } from "react";
import {
  HomeIcon,
  PhoneIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useAnalytics, useAgents, usePhoneNumbers, AnalyticsFilters } from "../hooks/useAnalytics";

const Analytics: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedCallType, setSelectedCallType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedType, setSelectedType] = useState("Number");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [callOutcomeFrom, setCallOutcomeFrom] = useState("08/31/2025");
  const [callOutcomeTo, setCallOutcomeTo] = useState("09/30/2025");
  const [callOutcomeDay, setCallOutcomeDay] = useState("Day");

  // Construir filtros para la API
  const filters: AnalyticsFilters = {
    agentId: selectedAgent || undefined,
    callType: selectedCallType || undefined,
    dateFrom: fromDate || undefined,
    dateTo: toDate || undefined,
    phoneNumber: selectedType || undefined,
  };

  // Obtener datos de analytics
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useAnalytics(filters);
  const analytics = analyticsData as any;
  
  // Obtener datos para los filtros
  const { data: agentsData } = useAgents();
  const { data: phoneNumbersData } = usePhoneNumbers();

  // Actualizar filtros cuando cambien los datos
  useEffect(() => {
    if (fromDate && toDate) {
      setCallOutcomeFrom(fromDate);
      setCallOutcomeTo(toDate);
    }
  }, [fromDate, toDate]);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a href="#" className="text-gray-700 hover:text-blue-600">
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
              <span className="ml-1 text-gray-500 md:ml-2">Analytics</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Filters</h3>
          <button
            onClick={() => {
              setSelectedAgent("");
              setSelectedCallType("");
              setFromDate("");
              setToDate("");
              setSelectedType("");
            }}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Limpiar filtros
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos los Agentes</option>
              {(agentsData as any[])?.map((agent: any) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Call Type
            </label>
            <select
              value={selectedCallType}
              onChange={(e) => setSelectedCallType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Call Type</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              From
            </label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <CalendarDaysIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              To
            </label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <CalendarDaysIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between text-sm"
              >
                <span>{selectedType}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`}
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

              {isTypeDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType("Number");
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-blue-50 text-sm ${
                      selectedType === "Number"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-900"
                    }`}
                  >
                    Number
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType("Percentage");
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-blue-50 text-sm ${
                      selectedType === "Percentage"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-900"
                    }`}
                  >
                    Percentage
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Number
            </label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos los Números</option>
              {(phoneNumbersData as any[])?.map((number: any) => (
                <option key={number.id} value={number.number}>
                  {number.number} ({number.friendlyName || 'Sin nombre'})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Indicador de filtros activos */}
        {(selectedAgent || selectedCallType || fromDate || toDate || selectedType) && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              Filtros activos: 
              {selectedAgent && ` Agente: ${(agentsData as any[])?.find((a: any) => a.id === selectedAgent)?.name || selectedAgent}`}
              {selectedCallType && ` Tipo: ${selectedCallType}`}
              {fromDate && ` Desde: ${fromDate}`}
              {toDate && ` Hasta: ${toDate}`}
              {selectedType && ` Número: ${selectedType}`}
            </p>
          </div>
        )}
      </div>

      {/* Metric Cards Section */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : analyticsError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error cargando datos de analytics: {analyticsError.message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics?.calls || 0}</p>
                <p className="text-sm text-gray-600">Calls</p>
              </div>
              <PhoneIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics?.minutes?.toFixed(1) || 0}</p>
                <p className="text-sm text-gray-600">Minutes</p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">${analytics?.spent?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-600">Spent</p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics?.didNotConnect || 0}</p>
                <p className="text-sm text-gray-600">Did Not Connect</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics?.answers || 0}</p>
                <p className="text-sm text-gray-600">({analytics?.answerRate?.toFixed(2) || '0.00'}%) Answers</p>
              </div>
              <PhoneIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics?.noAnswer || 0}</p>
                <p className="text-sm text-gray-600">({analytics?.noAnswerRate?.toFixed(2) || '0.00'}%) No Answer</p>
              </div>
              <PhoneIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics?.appointments || 0}</p>
                <p className="text-sm text-gray-600">({analytics?.appointmentRate?.toFixed(2) || '0.00'}%) Appointments</p>
              </div>
              <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics?.transfers || 0}</p>
                <p className="text-sm text-gray-600">({analytics?.transferRate?.toFixed(2) || '0.00'}%) Transfers</p>
              </div>
              <ArrowPathIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Call Outcome Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Call Outcome</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-700">From</label>
              <div className="relative">
                <input
                  type="text"
                  value={callOutcomeFrom}
                  onChange={(e) => setCallOutcomeFrom(e.target.value)}
                  className="w-32 px-3 py-1 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <CalendarDaysIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-700">To</label>
              <div className="relative">
                <input
                  type="text"
                  value={callOutcomeTo}
                  onChange={(e) => setCallOutcomeTo(e.target.value)}
                  className="w-32 px-3 py-1 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <CalendarDaysIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-700">Day</label>
              <select
                value={callOutcomeDay}
                onChange={(e) => setCallOutcomeDay(e.target.value)}
                className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="Day">Day</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chart/Table Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Chart/Table area for call outcome data</p>
            {analytics && (
              <div className="mt-4 text-xs text-gray-400">
                <p>Última actualización: {new Date(analytics.lastUpdated).toLocaleString()}</p>
                <div className="flex justify-center space-x-4 mt-2">
                  {analytics.dataSources?.twilio && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Twilio</span>
                  )}
                  {analytics.dataSources?.elevenLabs && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">ElevenLabs</span>
                  )}
                  {analytics.dataSources?.goHighLevel && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">GoHighLevel</span>
                  )}
                  {analytics.dataSources?.local && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">Local</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
