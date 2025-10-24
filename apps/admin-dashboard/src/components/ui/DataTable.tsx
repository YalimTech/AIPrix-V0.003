import React from "react";
import { clsx } from "clsx";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={clsx("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={clsx(
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  column.width && `w-${column.width}`,
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={clsx(
                "hover:bg-gray-50",
                onRowClick && "cursor-pointer",
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(item[column.key], item)
                    : (() => {
                        const value = item[column.key];
                        // Si el valor es un objeto, convertirlo a string
                        if (typeof value === "object" && value !== null) {
                          return JSON.stringify(value);
                        }
                        // Si es null o undefined, mostrar string vacío
                        if (value === null || value === undefined) {
                          return "";
                        }
                        // Para otros tipos, convertir a string
                        return String(value);
                      })()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
