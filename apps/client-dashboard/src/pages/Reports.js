import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ChartBarIcon, DocumentTextIcon, ArrowDownTrayIcon, MagnifyingGlassIcon, FunnelIcon,
// CalendarIcon,
// EyeIcon,
 } from "@heroicons/react/24/outline";
import { useCalls } from "../hooks/useCalls";
import { useCampaigns } from "../hooks/useCampaigns";
import Button from "../components/ui/Button";
const Reports = () => {
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
                missed: calls.filter((call) => call.outcome === "no_answer" || call.outcome === "busy").length,
                avgDuration: calls.length > 0
                    ? Math.round(calls.reduce((acc, call) => acc + (call.duration || 0), 0) /
                        calls.length /
                        60) + "m"
                    : "0m",
                successRate: calls.length > 0
                    ? Math.round((calls.filter((call) => call.outcome === "answered").length /
                        calls.length) *
                        100)
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
                totalContacts: campaigns.reduce((acc, c) => acc + (c.contacts || 0), 0),
                conversionRate: campaigns.length > 0
                    ? Math.round((campaigns.reduce((acc, c) => acc + (c.appointments || 0), 0) /
                        campaigns.reduce((acc, c) => acc + (c.contacts || 0), 1)) *
                        100)
                    : 0,
                avgCostPerContact: campaigns.length > 0
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
            chartData: [],
        },
        contacts: {
            total: 0, // TODO: Get from contacts API
            newThisMonth: 0, // TODO: Get from contacts API
            engagementRate: 0, // TODO: Calculate from contact data
            avgResponseTime: "0m", // TODO: Calculate from contact data
            chartData: [],
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Reports" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Generate and export detailed analytics reports" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { onClick: exportReport, variant: "outline", className: "flex items-center", children: [_jsx(ArrowDownTrayIcon, { className: "w-4 h-4 mr-2" }), "Export"] }), _jsxs(Button, { onClick: generateReport, variant: "primary", className: "flex items-center", children: [_jsx(ChartBarIcon, { className: "w-4 h-4 mr-2" }), "Generate Report"] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(FunnelIcon, { className: "w-5 h-5 text-gray-400 mr-2" }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Filters" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Search" }), _jsxs("div", { className: "relative", children: [_jsx(MagnifyingGlassIcon, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search reports...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Date Range" }), _jsxs("select", { value: dateRange, onChange: (e) => setDateRange(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "last-7-days", children: "Last 7 Days" }), _jsx("option", { value: "last-30-days", children: "Last 30 Days" }), _jsx("option", { value: "last-3-months", children: "Last 3 Months" }), _jsx("option", { value: "last-year", children: "Last Year" }), _jsx("option", { value: "custom", children: "Custom Range" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Report Type" }), _jsx("select", { value: selectedReport, onChange: (e) => setSelectedReport(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: reportTypes.map((type) => (_jsx("option", { value: type.id, children: type.name }, type.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Time Period" }), _jsxs("select", { value: selectedPeriod, onChange: (e) => setSelectedPeriod(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "day", children: "Last 24 Hours" }), _jsx("option", { value: "week", children: "Last 7 Days" }), _jsx("option", { value: "month", children: "Last 30 Days" }), _jsx("option", { value: "quarter", children: "Last 3 Months" }), _jsx("option", { value: "year", children: "Last Year" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Report Configuration" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Report Type" }), _jsx("select", { value: selectedReport, onChange: (e) => setSelectedReport(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500", children: reportTypes.map((type) => (_jsx("option", { value: type.id, children: type.name }, type.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Time Period" }), _jsxs("select", { value: selectedPeriod, onChange: (e) => setSelectedPeriod(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500", children: [_jsx("option", { value: "day", children: "Last 24 Hours" }), _jsx("option", { value: "week", children: "Last 7 Days" }), _jsx("option", { value: "month", children: "Last 30 Days" }), _jsx("option", { value: "quarter", children: "Last 3 Months" }), _jsx("option", { value: "year", children: "Last Year" })] })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (_jsx("div", { className: `bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 ${selectedReport === type.id
                            ? "ring-2 ring-red-500 border-red-500"
                            : "hover:shadow-md"}`, onClick: () => setSelectedReport(type.id), children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(Icon, { className: "h-8 w-8 text-gray-400" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900", children: type.name }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: type.description })] })] }) }, type.id));
                }) }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Report Preview" }) }), _jsxs("div", { className: "p-6", children: [selectedReport === "calls" && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Total Calls" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: reportData.calls.total.toLocaleString() })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Answered" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: reportData.calls.answered.toLocaleString() })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Success Rate" }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [reportData.calls.successRate, "%"] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Avg Duration" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: reportData.calls.avgDuration })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 mb-4", children: "Call Volume Trend" }), _jsx("div", { className: "flex items-end space-x-2 h-48", children: reportData.calls.chartData.map((day, index) => (_jsxs("div", { className: "flex-1 flex flex-col items-center", children: [_jsx("div", { className: "w-full bg-blue-200 rounded-t", style: { height: `${(day.calls / 70) * 100}%` }, children: _jsx("div", { className: "w-full bg-blue-500 rounded-t", style: {
                                                                    height: `${(day.answered / day.calls) * 100}%`,
                                                                } }) }), _jsx("span", { className: "text-xs text-gray-500 mt-2", children: day.calls }), _jsx("span", { className: "text-xs text-gray-400", children: new Date(day.date).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                            }) })] }, index))) }), _jsxs("div", { className: "flex justify-center space-x-6 mt-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 bg-blue-500 rounded mr-2" }), _jsx("span", { className: "text-sm text-gray-600", children: "Answered" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 bg-blue-200 rounded mr-2" }), _jsx("span", { className: "text-sm text-gray-600", children: "Total" })] })] })] })] })), selectedReport === "campaigns" && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Active Campaigns" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: reportData.campaigns.active })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Conversion Rate" }), _jsxs("p", { className: "text-2xl font-bold text-green-600", children: [reportData.campaigns.conversionRate, "%"] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Total Contacts" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: reportData.campaigns.totalContacts.toLocaleString() })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Avg Cost/Contact" }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: ["$", reportData.campaigns.avgCostPerContact] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 mb-4", children: "Campaign Performance" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-700", children: "Campaign" }), _jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-700", children: "Contacts" }), _jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-700", children: "Converted" }), _jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-700", children: "Cost" }), _jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-700", children: "Rate" })] }) }), _jsx("tbody", { children: reportData.campaigns.chartData.map((campaign, index) => (_jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("td", { className: "py-3 text-sm font-medium text-gray-900", children: campaign.campaign }), _jsx("td", { className: "py-3 text-sm text-gray-600", children: campaign.contacts.toLocaleString() }), _jsx("td", { className: "py-3 text-sm text-gray-600", children: campaign.converted.toLocaleString() }), _jsxs("td", { className: "py-3 text-sm text-gray-600", children: ["$", campaign.cost] }), _jsxs("td", { className: "py-3 text-sm text-gray-600", children: [((campaign.converted / campaign.contacts) *
                                                                                100).toFixed(1), "%"] })] }, index))) })] }) })] })] })), selectedReport === "agents" && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Active Agents" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: reportData.agents.active })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Avg Response Time" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [reportData.agents.avgResponseTime, "s"] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Success Rate" }), _jsxs("p", { className: "text-2xl font-bold text-green-600", children: [reportData.agents.successRate, "%"] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Total Calls" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: reportData.agents.totalCalls.toLocaleString() })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 mb-4", children: "Agent Performance" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-700", children: "Agent" }), _jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-700", children: "Calls" }), _jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-700", children: "Success" }), _jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-700", children: "Response Time" }), _jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-700", children: "Success Rate" })] }) }), _jsx("tbody", { children: reportData.agents.chartData.map((agent, index) => (_jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("td", { className: "py-3 text-sm font-medium text-gray-900", children: agent.agent }), _jsx("td", { className: "py-3 text-sm text-gray-600", children: agent.calls.toLocaleString() }), _jsx("td", { className: "py-3 text-sm text-gray-600", children: agent.success.toLocaleString() }), _jsxs("td", { className: "py-3 text-sm text-gray-600", children: [agent.responseTime, "s"] }), _jsxs("td", { className: "py-3 text-sm text-gray-600", children: [((agent.success / agent.calls) * 100).toFixed(1), "%"] })] }, index))) })] }) })] })] })), selectedReport === "contacts" && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Total Contacts" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: reportData.contacts.total.toLocaleString() })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Engagement Rate" }), _jsxs("p", { className: "text-2xl font-bold text-green-600", children: [reportData.contacts.engagementRate, "%"] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "New This Month" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: reportData.contacts.newThisMonth })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Avg Response Time" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: reportData.contacts.avgResponseTime })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 mb-4", children: "Contact Engagement Trend" }), _jsx("div", { className: "flex items-end space-x-2 h-48", children: reportData.contacts.chartData.map((day, index) => (_jsxs("div", { className: "flex-1 flex flex-col items-center", children: [_jsx("div", { className: "w-full bg-green-200 rounded-t", style: { height: `${(day.contacts / 70) * 100}%` }, children: _jsx("div", { className: "w-full bg-green-500 rounded-t", style: {
                                                                    height: `${(day.engaged / day.contacts) * 100}%`,
                                                                } }) }), _jsx("span", { className: "text-xs text-gray-500 mt-2", children: day.contacts }), _jsx("span", { className: "text-xs text-gray-400", children: new Date(day.date).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                            }) })] }, index))) }), _jsxs("div", { className: "flex justify-center space-x-6 mt-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded mr-2" }), _jsx("span", { className: "text-sm text-gray-600", children: "Engaged" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 bg-green-200 rounded mr-2" }), _jsx("span", { className: "text-sm text-gray-600", children: "Total" })] })] })] })] }))] })] })] }));
};
export default Reports;
