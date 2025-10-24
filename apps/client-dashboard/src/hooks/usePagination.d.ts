interface PaginationConfig {
    totalItems: number;
    itemsPerPage?: number;
    maxVisiblePages?: number;
    initialPage?: number;
}
export declare const usePagination: (config: PaginationConfig) => {
    resetToFirstPage: () => void;
    goToPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    firstPage: () => void;
    lastPage: () => void;
    setItemsPerPage: (itemsPerPage: number) => void;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    visiblePages: number[];
};
interface ServerPaginationConfig {
    totalItems: number;
    itemsPerPage?: number;
    maxVisiblePages?: number;
    initialPage?: number;
    onPageChange?: (page: number, itemsPerPage: number) => void;
}
export declare const useServerPagination: (config: ServerPaginationConfig) => {
    goToPage: (page: number) => void;
    setItemsPerPage: (newItemsPerPage: number) => void;
    resetToFirstPage: () => void;
    nextPage: () => void;
    previousPage: () => void;
    firstPage: () => void;
    lastPage: () => void;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    visiblePages: number[];
};
interface InfiniteScrollConfig {
    itemsPerPage?: number;
    onLoadMore?: (page: number) => Promise<void>;
    hasMore?: boolean;
}
export declare const useInfiniteScroll: (config: InfiniteScrollConfig) => {
    currentPage: number;
    isLoading: boolean;
    allItemsLoaded: boolean;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    reset: () => void;
};
export declare const paginationUtils: {
    getPageInfo: (startIndex: number, endIndex: number, totalItems: number) => string;
    getItemsPerPageOptions: () => number[];
    getPageRange: (currentPage: number, totalPages: number, maxVisible?: number) => {
        start: number;
        end: number;
    };
    getPageNumbersWithEllipsis: (currentPage: number, totalPages: number, maxVisible?: number) => (string | number)[];
};
export {};
