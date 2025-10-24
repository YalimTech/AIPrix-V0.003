import React from "react";

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  className = "",
}: TableProps<T>) {
  // Asegurar que data sea un array válido
  const safeData = Array.isArray(data) ? data : [];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (safeData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.className || ""}
                  `}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeData.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  hover:bg-gray-50 transition-colors duration-150
                  ${onRowClick ? "cursor-pointer" : ""}
                `}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => {
                  const value =
                    typeof column.key === "string" && column.key.includes(".")
                      ? column.key
                          .split(".")
                          .reduce((obj: any, key: string) => obj?.[key], item)
                      : item[column.key as keyof T];

                  return (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render ? column.render(value, item) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
