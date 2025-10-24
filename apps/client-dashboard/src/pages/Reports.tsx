import React, { useState } from "react";
import {
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  // CalendarIcon,
  // EyeIcon,
} from "@heroicons/react/24/outline";
import { useCalls } from "../hooks/useCalls";
import { useCampaigns } from "../hooks/useCampaigns";
import Button from "../components/ui/Button";

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedReport, setSelectedReport] = useState("calls");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("last-7-days");

  // Use real data from API
  const { data: calls } = useCalls();
  const { data: campaigns } = useCampaigns();

  // Real data from API - process actual data
  const reportData = {
    calls: calls
      ? {
          total: calls.length,
          answered: calls.filter((call) => call.outcome === "answered").length,
          missed: calls.filter(
            (call) => call.outcome === "no_answer" || call.outcome === "busy",
          ).length,
          avgDuration:
            calls.length > 0
              ? Math.round(
                  calls.reduce((acc, call) => acc + (call.duration || 0), 0) /
                    calls.length /
                    60,
                ) + "m"
              : "0m",
          successRate:
            calls.length > 0
              ? Math.round(
                  (calls.filter((call) => call.outcome === "answered").length /
                    calls.length) *
                    100,
                )
              : 0,
          chartData: calls.map((call) => ({
            date: new Date(call.createdAt).toISOString().split("T")[0],
            calls: 1,
            answered: call.outcome === "answered" ? 1 : 0,
            missed: call.outcome !== "answered" ? 1 : 0,
          })),
        }
      : {
          total: 0,
          answered: 0,
          missed: 0,
          avgDuration: "0m",
          successRate: 0,
          chartData: [],
        },
    campaigns: campaigns
      ? {
          active: campaigns.filter((c) => c.isActive).length,
          completed: campaigns.filter((c) => !c.isActive).length,
          totalContacts: campaigns.reduce(
            (acc, c) => acc + (c.contacts || 0),
            0,
          ),
          conversionRate:
            campaigns.length > 0
              ? Math.round(
                  (campaigns.reduce(
                    (acc, c) => acc + (c.appointments || 0),
                    0,
                  ) /
                    campaigns.reduce((acc, c) => acc + (c.contacts || 0), 1)) *
                    100,
                )
              : 0,
          avgCostPerContact:
            campaigns.length > 0
              ? campaigns.reduce((acc, c) => acc + (c.spent || 0), 0) /
                campaigns.reduce((acc, c) => acc + (c.contacts || 0), 1)
              : 0,
          chartData: campaigns.map((campaign) => ({
            campaign: campaign.name,
            contacts: campaign.contacts || 0,
            converted: campaign.appointments || 0,
            cost: campaign.spent || 0,
          })),
        }
      : {
          active: 0,
          completed: 0,
          totalContacts: 0,
          conversionRate: 0,
          avgCostPerContact: 0,
          chartData: [],
        },
    agents: {
      active: 0, // TODO: Get from agents API
      avgResponseTime: 0, // TODO: Calculate from call data
      successRate: 0, // TODO: Calculate from call data
      totalCalls: calls?.length || 0,
      chartData: [] as Array<{
        agent: string;
        calls: number;
        success: number;
        responseTime: number;
      }>,
    },
    contacts: {
      total: 0, // TODO: Get from contacts API
      newThisMonth: 0, // TODO: Get from contacts API
      engagementRate: 0, // TODO: Calculate from contact data
      avgResponseTime: "0m", // TODO: Calculate from contact data
      chartData: [] as Array<{
        contacts: number;
        engaged: number;
        date: string;
      }>,
    },
  };

  const reportTypes = [
    {
      id: "calls",
      name: "Call Reports",
      description: "Detailed call analytics and performance metrics",
      icon: ChartBarIcon,
    },
    {
      id: "campaigns",
      name: "Campaign Reports",
      description: "Campaign performance and conversion rates",
      icon: DocumentTextIcon,
    },
    {
      id: "agents",
      name: "Agent Reports",
      description: "Agent performance and productivity metrics",
      icon: ChartBarIcon,
    },
    {
      id: "contacts",
      name: "Contact Reports",
      description: "Contact engagement and response rates",
      icon: DocumentTextIcon,
    },
  ];

  const generateReport = () => {
    // Simulate report generation
    console.log("Generating report...", { selectedPeriod, selectedReport });
  };

  const exportReport = () => {
    // Simulate report export
    console.log("Exporting report...", { selectedPeriod, selectedReport });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate and export detailed analytics reports
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={exportReport}
            variant="outline"
            className="flex items-center"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={generateReport}
            variant="primary"
            className="flex items-center"
          >
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="last-7-days">Last 7 Days</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Report Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 ${
                selectedReport === type.id
                  ? "ring-2 ring-red-500 border-red-500"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedReport(type.id)}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {type.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Report Preview</h3>
        </div>
        <div className="p-6">
          {selectedReport === "calls" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Total Calls
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.calls.total.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Answered
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {reportData.calls.answered.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Success Rate
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData.calls.successRate}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Avg Duration
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.calls.avgDuration}
                  </p>
                </div>
              </div>

              {/* Simple Chart Visualization */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Call Volume Trend
                </h4>
                <div className="flex items-end space-x-2 h-48">
                  {reportData.calls.chartData.map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-blue-200 rounded-t"
                        style={{ height: `${(day.calls / 70) * 100}%` }}
                      >
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{
                            height: `${(day.answered / day.calls) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">
                        {day.calls}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-6 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Total</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === "campaigns" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Active Campaigns
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.campaigns.active}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Conversion Rate
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {reportData.campaigns.conversionRate}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Total Contacts
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.campaigns.totalContacts.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Avg Cost/Contact
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    ${reportData.campaigns.avgCostPerContact}
                  </p>
                </div>
              </div>

              {/* Campaign Performance Table */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Campaign Performance
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                          Campaign
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                          Contacts
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                          Converted
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                          Cost
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.campaigns.chartData.map((campaign, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 text-sm font-medium text-gray-900">
                            {campaign.campaign}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {campaign.contacts.toLocaleString()}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {campaign.converted.toLocaleString()}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            ${campaign.cost}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {(
                              (campaign.converted / campaign.contacts) *
                              100
                            ).toFixed(1)}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedReport === "agents" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Active Agents
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.agents.active}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Avg Response Time
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.agents.avgResponseTime}s
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Success Rate
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {reportData.agents.successRate}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Total Calls
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData.agents.totalCalls.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Agent Performance Table */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Agent Performance
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                          Agent
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                          Calls
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                          Success
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                          Response Time
                        </th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.agents.chartData.map((agent, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 text-sm font-medium text-gray-900">
                            {agent.agent}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {agent.calls.toLocaleString()}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {agent.success.toLocaleString()}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {agent.responseTime}s
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {((agent.success / agent.calls) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedReport === "contacts" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Total Contacts
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.contacts.total.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Engagement Rate
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {reportData.contacts.engagementRate}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    New This Month
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData.contacts.newThisMonth}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Avg Response Time
                  </h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.contacts.avgResponseTime}
                  </p>
                </div>
              </div>

              {/* Contact Engagement Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Contact Engagement Trend
                </h4>
                <div className="flex items-end space-x-2 h-48">
                  {reportData.contacts.chartData.map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-green-200 rounded-t"
                        style={{ height: `${(day.contacts / 70) * 100}%` }}
                      >
                        <div
                          className="w-full bg-green-500 rounded-t"
                          style={{
                            height: `${(day.engaged / day.contacts) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">
                        {day.contacts}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-6 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Engaged</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Total</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
