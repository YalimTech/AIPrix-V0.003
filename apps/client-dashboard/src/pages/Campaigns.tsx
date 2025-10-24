import React, { useState } from "react";
import {
  // PlusIcon, // No se usa
  ChartBarIcon,
  ChartPieIcon,
  XMarkIcon,
  FunnelIcon,
  // CalendarIcon, // No se usa
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import SummaryModal from "../components/modals/SummaryModal";
import DatePicker from "../components/ui/DatePicker";

interface Call {
  id: string;
  date: string;
  spent: number;
  minutesUsed: number;
  calls: number;
  answers: number;
  noAnswers: number;
  didNotConnect: number;
  transfers: number;
  appointments: number;
}

interface Campaign {
  id: string;
  name: string;
  isActive: boolean;
  date: string;
  contactListId: string;
  agentName: string;
  budget: number;
  spent: number;
  costEstimate: number;
  totalContacts: number;
  contactsRemaining: number;
  contactsCalled: number;
  answers: number;
  noAnswers: number;
  didNotConnect: number;
  transfers: number;
  appointments: number;
}

const Campaigns: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"CRM" | "Dashboard">("CRM");
  const [activeSubTab, setActiveSubTab] = useState<"All" | "Campaigns">("All");
  const [viewMode, setViewMode] = useState<"Total" | "Percentage" | "Cost">(
    "Total",
  );
  const [summaryMode, setSummaryMode] = useState<"Total" | "Average">("Total");
  const [showFilters, setShowFilters] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedCallData, setSelectedCallData] = useState<any>(null);

  // Filtros
  const [fromDate, setFromDate] = useState("09/24/2025");
  const [toDate, setToDate] = useState("10/01/2025");
  const [stateFilter, setStateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");

  // New Campaign Form
  const [campaignName, setCampaignName] = useState("");
  const [selectedContactList, setSelectedContactList] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [budget, setBudget] = useState("");

  // Mock data for "All" view
  const allCalls: Call[] = [
    {
      id: "1",
      date: "Tue, 30 Sep 2025",
      spent: 1.14,
      minutesUsed: 8.78,
      calls: 3,
      answers: 2,
      noAnswers: 1,
      didNotConnect: 0,
      transfers: 0,
      appointments: 0,
    },
  ];

  // Mock data for "Campaigns" view
  const campaigns: Campaign[] = [];

  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
    setStateFilter("");
    setStatusFilter("");
    setAgentFilter("");
  };

  const handleCreateCampaign = () => {
    console.log("Creating campaign:", {
      campaignName,
      selectedContactList,
      selectedAgent,
      budget,
    });
    setShowNewCampaignModal(false);
    setCampaignName("");
    setSelectedContactList("");
    setSelectedAgent("");
    setBudget("");
  };

  // Calculate All Calls totals
  const allCallsTotals = allCalls.reduce(
    (acc, call) => ({
      minutesUsed: acc.minutesUsed + call.minutesUsed,
      spent: acc.spent + call.spent,
      calls: acc.calls + call.calls,
      answers: acc.answers + call.answers,
      noAnswers: acc.noAnswers + call.noAnswers,
      didNotConnect: acc.didNotConnect + call.didNotConnect,
      transfers: acc.transfers + call.transfers,
      appointments: acc.appointments + call.appointments,
    }),
    {
      minutesUsed: 0,
      spent: 0,
      calls: 0,
      answers: 0,
      noAnswers: 0,
      didNotConnect: 0,
      transfers: 0,
      appointments: 0,
    },
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="flex items-center justify-end py-4 px-6 text-sm text-gray-500">
        <HomeIcon className="w-4 h-4" />
        <span className="mx-2">{">"}</span>
        <span className="text-gray-900 font-medium">Campaigns</span>
      </div>

      <div className="max-w-full mx-auto px-6 pb-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
        </div>

        {/* Main Tabs: CRM | Dashboard */}
        <div className="flex items-center gap-6 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("CRM")}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
              activeTab === "CRM"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            <span className="font-medium text-sm">CRM</span>
          </button>
          <button
            onClick={() => setActiveTab("Dashboard")}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
              activeTab === "Dashboard"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <ChartPieIcon className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </button>
        </div>

        {/* Sub Tabs and Actions Row */}
        <div className="flex items-center justify-between mb-6">
          {/* Left: All | Campaigns OR New Campaign button */}
          <div className="flex items-center gap-3">
            {activeSubTab === "All" || activeSubTab === "Campaigns" ? (
              <>
                <button
                  onClick={() => setActiveSubTab("All")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSubTab === "All"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveSubTab("Campaigns")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSubTab === "Campaigns"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Campaigns
                </button>
              </>
            ) : null}
          </div>

          {/* Right: View Mode Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("Total")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "Total"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Total
            </button>
            <button
              onClick={() => setViewMode("Percentage")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "Percentage"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Percentage
            </button>
            <button
              onClick={() => setViewMode("Cost")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "Cost"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Cost
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content based on active sub tab */}
        {activeSubTab === "All" ? (
          <>
            {/* All Calls Table */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Spent
                      </th>
                      {viewMode === "Percentage" ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Answer %
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            No Answer %
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Did Not Connect %
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Transfer %
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Appointment %
                          </th>
                        </>
                      ) : viewMode === "Cost" ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Cost Per Call
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Cost Per Answer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Cost Per No Answer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Cost Per Transfer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Cost Per Appointment
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Minutes Used
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Calls
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Answers
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            No Answers
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Did Not Connect
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Transfers
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Appointments
                          </th>
                        </>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Summary
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCalls.map((call) => (
                      <tr
                        key={call.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {call.date}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${call.spent.toFixed(2)}
                        </td>
                        {viewMode === "Percentage" ? (
                          <>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.calls > 0
                                ? ((call.answers / call.calls) * 100).toFixed(2)
                                : "0.00"}
                              %
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.calls > 0
                                ? ((call.noAnswers / call.calls) * 100).toFixed(
                                    2,
                                  )
                                : "0.00"}
                              %
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.calls > 0
                                ? (
                                    (call.didNotConnect / call.calls) *
                                    100
                                  ).toFixed(2)
                                : "0.00"}
                              %
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.calls > 0
                                ? ((call.transfers / call.calls) * 100).toFixed(
                                    2,
                                  )
                                : "0.00"}
                              %
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.calls > 0
                                ? (
                                    (call.appointments / call.calls) *
                                    100
                                  ).toFixed(2)
                                : "0.00"}
                              %
                            </td>
                          </>
                        ) : viewMode === "Cost" ? (
                          <>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              $
                              {call.calls > 0
                                ? (call.spent / call.calls).toFixed(2)
                                : "0.00"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              $
                              {call.answers > 0
                                ? (call.spent / call.answers).toFixed(2)
                                : "0.00"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              $
                              {call.noAnswers > 0
                                ? (call.spent / call.noAnswers).toFixed(2)
                                : "0.00"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              $
                              {call.transfers > 0
                                ? (call.spent / call.transfers).toFixed(2)
                                : "0.00"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              $
                              {call.appointments > 0
                                ? (call.spent / call.appointments).toFixed(2)
                                : "0.00"}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.minutesUsed.toFixed(2)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.calls}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.answers}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.noAnswers}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.didNotConnect}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.transfers}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {call.appointments}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedCallData(call);
                              setShowSummaryModal(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <SparklesIcon className="w-4 h-4" />
                            Summary
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Calls Summary Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Calls
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSummaryMode("Total")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      summaryMode === "Total"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Total
                  </button>
                  <button
                    onClick={() => setSummaryMode("Average")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      summaryMode === "Average"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Average
                  </button>
                </div>
              </div>

              {/* Summary Stats - Horizontal Grid */}
              <div className="grid grid-cols-9 gap-4">
                {summaryMode === "Average" ? (
                  <>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Average Minutes Used
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCalls.length > 0
                          ? (
                              allCallsTotals.minutesUsed / allCalls.length
                            ).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Average Spent
                      </div>
                      <div className="text-sm text-gray-900">
                        $
                        {allCalls.length > 0
                          ? (allCallsTotals.spent / allCalls.length).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Average Calls
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCalls.length > 0
                          ? (allCallsTotals.calls / allCalls.length).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Average Answers
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCalls.length > 0
                          ? (allCallsTotals.answers / allCalls.length).toFixed(
                              2,
                            )
                          : "0.00"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Average No Answer
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCalls.length > 0
                          ? (
                              allCallsTotals.noAnswers / allCalls.length
                            ).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Average Transfers
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCalls.length > 0
                          ? (
                              allCallsTotals.transfers / allCalls.length
                            ).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Average Cost Per Transfer
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCallsTotals.transfers > 0
                          ? (
                              allCallsTotals.spent / allCallsTotals.transfers
                            ).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Average Appointments
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCalls.length > 0
                          ? (
                              allCallsTotals.appointments / allCalls.length
                            ).toFixed(0)
                          : "0"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Average Cost Per Appointments
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCallsTotals.appointments > 0
                          ? (
                              allCallsTotals.spent / allCallsTotals.appointments
                            ).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Total Minutes Used
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCallsTotals.minutesUsed.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Total Spent
                      </div>
                      <div className="text-sm text-gray-900">
                        ${allCallsTotals.spent.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Total Calls
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCallsTotals.calls}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Total Answers
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCallsTotals.answers}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Total No Answers
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCallsTotals.noAnswers}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Total Did Not Connect
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCallsTotals.didNotConnect}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Total Transfers
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCallsTotals.transfers}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Total Appointments
                      </div>
                      <div className="text-sm text-gray-900">
                        {allCallsTotals.appointments}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        -
                      </div>
                      <div className="text-sm text-gray-900">-</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Campaigns Table */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Off/On
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Contact List ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Agent Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Budget
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Spent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Cost Estimate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Total Contacts
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Contacts Remaining
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Contacts Called
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Answers
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        No Answers
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Did Not Connect
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Transfers
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Appointments
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.length === 0 ? (
                      <tr>
                        <td
                          colSpan={17}
                          className="px-4 py-12 text-center text-sm text-gray-500"
                        >
                          No Campaigns Created
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((campaign) => (
                        <tr
                          key={campaign.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div
                              className={`w-10 h-5 rounded-full ${campaign.isActive ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.date}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.contactListId}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.agentName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${campaign.budget.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${campaign.spent.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${campaign.costEstimate.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.totalContacts}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.contactsRemaining}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.contactsCalled}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.answers}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.noAnswers}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.didNotConnect}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.transfers}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.appointments}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            •••
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Horizontal Scrollbar Visual */}
              <div className="bg-gray-100 p-2">
                <div className="h-2 bg-gray-300 rounded-full relative">
                  <div className="absolute left-0 top-0 h-full w-full bg-gray-400 rounded-full"></div>
                  <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-gray-500 rounded-sm flex items-center justify-center text-white hover:bg-gray-600">
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-gray-500 rounded-sm flex items-center justify-center text-white hover:bg-gray-600">
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* All Campaigns Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Campaigns
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSummaryMode("Total")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      summaryMode === "Total"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Total
                  </button>
                  <button
                    onClick={() => setSummaryMode("Average")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      summaryMode === "Average"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Average
                  </button>
                </div>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Budget
                  </div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Spent
                  </div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Contacts
                  </div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Remaining Contacts
                  </div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Called
                  </div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Answers
                  </div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total No Answers
                  </div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Did Not Connect
                  </div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Transfers
                  </div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Appointments
                  </div>
                  <div className="text-sm text-gray-900">-</div>
                </div>
              </div>

              <div className="text-center mt-6 text-sm text-gray-500">
                No Campaigns Created
              </div>
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-end gap-4 text-sm text-gray-700 mt-6">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <span>
            {allCalls.length > 0
              ? `1-${allCalls.length} of ${allCalls.length}`
              : "0-0 of 0"}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              disabled
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              disabled
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Sidebar */}
      {showFilters && (
        <div className="fixed right-6 top-32 w-80 bg-white shadow-2xl z-50 rounded-lg border border-gray-200 overflow-visible">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetFilters}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-5">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                label="From"
                placeholder="09/24/2025"
              />
              <DatePicker
                value={toDate}
                onChange={setToDate}
                label="To"
                placeholder="10/01/2025"
              />
            </div>

            {/* State Filter */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">State</option>
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">Status</option>
                <option value="prelaunch">Prelaunch</option>
                <option value="launched">Launched</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            {/* Agent Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent
              </label>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">Agent</option>
                <option value="agent1">Agent 1</option>
                <option value="agent2">Agent 2</option>
                <option value="agent3">Agent 3</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        callData={selectedCallData}
      />

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowNewCampaignModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                New Campaign
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Contact List and Agent - Two columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact List <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedContactList}
                    onChange={(e) => setSelectedContactList(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value=""></option>
                    <option value="list1">Contact List 1</option>
                    <option value="list2">Contact List 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value=""></option>
                    <option value="agent1">Agent 1</option>
                    <option value="agent2">Agent 2</option>
                  </select>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
              <button
                onClick={() => setShowNewCampaignModal(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
