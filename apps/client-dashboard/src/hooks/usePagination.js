import { useState, useMemo, useCallback } from 'react';
export const usePagination = (config) => {
    const { totalItems, itemsPerPage: initialItemsPerPage = 10, maxVisiblePages = 5, initialPage = 1, } = config;
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
    // Calculate derived values
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;
    // Calculate visible pages
    const visiblePages = useMemo(() => {
        const pages = [];
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }
        else {
            // Calculate start and end of visible pages
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            // Adjust if we're near the end
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        return pages;
    }, [currentPage, totalPages, maxVisiblePages]);
    // Actions
    const goToPage = useCallback((page) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(validPage);
    }, [totalPages]);
    const nextPage = useCallback(() => {
        if (hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    }, [hasNextPage]);
    const previousPage = useCallback(() => {
        if (hasPreviousPage) {
            setCurrentPage(prev => prev - 1);
        }
    }, [hasPreviousPage]);
    const firstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);
    const lastPage = useCallback(() => {
        setCurrentPage(totalPages);
    }, [totalPages]);
    const handleSetItemsPerPage = useCallback((newItemsPerPage) => {
        const validItemsPerPage = Math.max(1, newItemsPerPage);
        setItemsPerPage(validItemsPerPage);
        // Adjust current page if necessary
        const newTotalPages = Math.ceil(totalItems / validItemsPerPage);
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
        }
    }, [totalItems, currentPage]);
    // Reset to first page when total items change
    const resetToFirstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);
    // State object
    const state = {
        currentPage,
        totalPages,
        itemsPerPage,
        totalItems,
        startIndex,
        endIndex,
        hasNextPage,
        hasPreviousPage,
        visiblePages,
    };
    // Actions object
    const actions = {
        goToPage,
        nextPage,
        previousPage,
        firstPage,
        lastPage,
        setItemsPerPage: handleSetItemsPerPage,
    };
    return {
        ...state,
        ...actions,
        resetToFirstPage,
    };
};
export const useServerPagination = (config) => {
    const { totalItems, itemsPerPage: initialItemsPerPage = 10, maxVisiblePages = 5, initialPage = 1, onPageChange, } = config;
    const pagination = usePagination({
        totalItems,
        itemsPerPage: initialItemsPerPage,
        maxVisiblePages,
        initialPage,
    });
    const handlePageChange = useCallback((page) => {
        pagination.goToPage(page);
        if (onPageChange) {
            onPageChange(page, pagination.itemsPerPage);
        }
    }, [pagination, onPageChange]);
    const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
        pagination.setItemsPerPage(newItemsPerPage);
        if (onPageChange) {
            onPageChange(1, newItemsPerPage); // Reset to first page when changing items per page
        }
    }, [pagination, onPageChange]);
    return {
        ...pagination,
        goToPage: handlePageChange,
        setItemsPerPage: handleItemsPerPageChange,
    };
};
export const useInfiniteScroll = (config) => {
    const { onLoadMore, hasMore = true, } = config;
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [allItemsLoaded, setAllItemsLoaded] = useState(false);
    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore || allItemsLoaded)
            return;
        setIsLoading(true);
        try {
            await onLoadMore?.(currentPage + 1);
            setCurrentPage(prev => prev + 1);
        }
        catch (error) {
            console.error('Error loading more items:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [currentPage, isLoading, hasMore, allItemsLoaded, onLoadMore]);
    const reset = useCallback(() => {
        setCurrentPage(1);
        setAllItemsLoaded(false);
        setIsLoading(false);
    }, []);
    return {
        currentPage,
        isLoading,
        allItemsLoaded,
        hasMore: hasMore && !allItemsLoaded,
        loadMore,
        reset,
    };
};
// Utility functions for pagination
export const paginationUtils = {
    // Get page info string
    getPageInfo: (startIndex, endIndex, totalItems) => {
        if (totalItems === 0)
            return 'No hay elementos';
        return `Mostrando ${startIndex + 1}-${endIndex + 1} de ${totalItems} elementos`;
    },
    // Get items per page options
    getItemsPerPageOptions: () => {
        return [5, 10, 25, 50, 100];
    },
    // Calculate page range for display
    getPageRange: (currentPage, totalPages, maxVisible = 5) => {
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - half);
        const end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        return { start, end };
    },
    // Generate page numbers with ellipsis
    getPageNumbersWithEllipsis: (currentPage, totalPages, maxVisible = 7) => {
        const pages = [];
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }
        else {
            const { start, end } = paginationUtils.getPageRange(currentPage, totalPages, maxVisible - 2);
            if (start > 1) {
                pages.push(1);
                if (start > 2) {
                    pages.push('...');
                }
            }
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pages.push('...');
                }
                pages.push(totalPages);
            }
        }
        return pages;
    },
};
