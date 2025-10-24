import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function Table({ data, columns, loading = false, emptyMessage = "No data available", onRowClick, className = "", }) {
    // Asegurar que data sea un array válido
    const safeData = Array.isArray(data) ? data : [];
    if (loading) {
        return (_jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-2 text-gray-500", children: "Loading..." })] }) }));
    }
    if (safeData.length === 0) {
        return (_jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsx("div", { className: "p-8 text-center", children: _jsx("p", { className: "text-gray-500", children: emptyMessage }) }) }));
    }
    return (_jsx("div", { className: `bg-white rounded-lg shadow overflow-hidden ${className}`, children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsx("tr", { children: columns.map((column, index) => (_jsx("th", { className: `
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.className || ""}
                  `, children: column.title }, index))) }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: safeData.map((item, rowIndex) => (_jsx("tr", { className: `
                  hover:bg-gray-50 transition-colors duration-150
                  ${onRowClick ? "cursor-pointer" : ""}
                `, onClick: () => onRowClick?.(item), children: columns.map((column, colIndex) => {
                                const value = typeof column.key === "string" && column.key.includes(".")
                                    ? column.key
                                        .split(".")
                                        .reduce((obj, key) => obj?.[key], item)
                                    : item[column.key];
                                return (_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: column.render ? column.render(value, item) : value }, colIndex));
                            }) }, rowIndex))) })] }) }) }));
}
export default Table;
