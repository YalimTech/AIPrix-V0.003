import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
// interface PollingConfig {
//   interval: number;
//   enabled: boolean;
//   maxRetries: number;
//   retryDelay: number;
// }
export const useRealTimeData = (config) => {
    const { queryKey, endpoint, interval = 5000, enabled = true, onDataUpdate, onError, } = config;
    const [isPolling, setIsPolling] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const queryClient = useQueryClient();
    const intervalRef = useRef(null);
    // WebSocket functionality will be implemented later
    const subscribe = (event, _callback) => {
        console.log(`Subscribing to ${event}`);
    };
    const unsubscribe = (event) => {
        console.log(`Unsubscribing from ${event}`);
    };
    // Base query for initial data
    const { data, isLoading, error: queryError, } = useQuery({
        queryKey,
        queryFn: () => apiClient.get(endpoint),
        enabled,
        staleTime: 0, // Always consider data stale for real-time updates
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
    // Polling function
    const pollData = useCallback(async () => {
        if (!enabled)
            return;
        try {
            setIsPolling(true);
            setError(null);
            const newData = await apiClient.get(endpoint);
            // Update cache
            queryClient.setQueryData(queryKey, newData);
            // Update timestamp
            setLastUpdate(new Date());
            setRetryCount(0);
            // Callback for data updates
            if (onDataUpdate) {
                onDataUpdate(newData);
            }
        }
        catch (err) {
            const error = err;
            setError(error);
            setRetryCount((prev) => prev + 1);
            if (onError) {
                onError(error);
            }
        }
        finally {
            setIsPolling(false);
        }
    }, [enabled, endpoint, queryKey, queryClient, onDataUpdate, onError]);
    // Start polling
    const startPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(pollData, interval);
    }, [pollData, interval]);
    // Stop polling
    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);
    // WebSocket integration
    useEffect(() => {
        if (!enabled)
            return;
        const handleWebSocketUpdate = (wsData) => {
            // Update cache with WebSocket data
            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData)
                    return wsData;
                // Merge or replace data based on the type of update
                if (Array.isArray(oldData) && Array.isArray(wsData)) {
                    // For arrays, merge or update items
                    return wsData;
                }
                else if (typeof oldData === "object" && typeof wsData === "object") {
                    // For objects, merge properties
                    return { ...oldData, ...wsData };
                }
                return wsData;
            });
            setLastUpdate(new Date());
            if (onDataUpdate) {
                onDataUpdate(wsData);
            }
        };
        // Subscribe to relevant WebSocket events
        const eventName = queryKey.join(".");
        subscribe(eventName, handleWebSocketUpdate);
        return () => {
            unsubscribe(eventName);
        };
    }, [enabled, queryKey, queryClient, onDataUpdate, subscribe, unsubscribe]);
    // Polling lifecycle
    useEffect(() => {
        if (enabled && interval > 0) {
            startPolling();
        }
        else {
            stopPolling();
        }
        return () => {
            stopPolling();
        };
    }, [enabled, interval, startPolling, stopPolling]);
    // Visibility change handling
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Page is hidden, reduce polling frequency
                stopPolling();
                if (enabled && interval > 0) {
                    intervalRef.current = setInterval(pollData, interval * 3); // Poll 3x less frequently
                }
            }
            else {
                // Page is visible, resume normal polling
                stopPolling();
                if (enabled && interval > 0) {
                    startPolling();
                }
                // Also poll immediately when page becomes visible
                pollData();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [enabled, interval, startPolling, stopPolling, pollData]);
    // Online/offline handling
    useEffect(() => {
        const handleOnline = () => {
            // When coming back online, poll immediately
            if (enabled) {
                pollData();
            }
        };
        const handleOffline = () => {
            // When going offline, stop polling
            stopPolling();
        };
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [enabled, pollData, stopPolling]);
    // Manual refresh
    const refresh = useCallback(() => {
        pollData();
    }, [pollData]);
    // Get status information
    const status = {
        isPolling,
        lastUpdate,
        error: error || queryError,
        retryCount,
        isOnline: navigator.onLine,
        isVisible: !document.hidden,
    };
    return {
        data,
        isLoading,
        error: error || queryError,
        status,
        refresh,
        startPolling,
        stopPolling,
        subscribe,
        unsubscribe,
    };
};
// Specialized hooks for common data types
export const useRealTimeStats = (endpoint, enabled = true) => {
    return useRealTimeData({
        queryKey: ["stats", endpoint],
        endpoint,
        interval: 10000, // Poll every 10 seconds for stats
        enabled,
    });
};
export const useRealTimeCalls = (enabled = true) => {
    return useRealTimeData({
        queryKey: ["calls"],
        endpoint: "/calls",
        interval: 5000, // Poll every 5 seconds for calls
        enabled,
    });
};
export const useRealTimeCampaigns = (enabled = true) => {
    return useRealTimeData({
        queryKey: ["campaigns"],
        endpoint: "/campaigns",
        interval: 15000, // Poll every 15 seconds for campaigns
        enabled,
    });
};
export const useRealTimeAgents = (enabled = true) => {
    return useRealTimeData({
        queryKey: ["agents"],
        endpoint: "/agents",
        interval: 10000, // Poll every 10 seconds for agents
        enabled,
    });
};
export const useRealTimeBalance = (enabled = true) => {
    return useRealTimeData({
        queryKey: ["balance"],
        endpoint: "/billing/balance",
        interval: 30000, // Poll every 30 seconds for balance
        enabled,
    });
};
