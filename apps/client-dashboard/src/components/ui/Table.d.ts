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
declare function Table<T extends Record<string, any>>({ data, columns, loading, emptyMessage, onRowClick, className, }: TableProps<T>): import("react/jsx-runtime").JSX.Element;
export default Table;
