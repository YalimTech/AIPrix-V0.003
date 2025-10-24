import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "../lib/api";

export interface PhoneNumber {
  id: string;
  number: string;
  country: string;
  region: string;
  capabilities: string[];
  status: "active" | "inactive" | "pending";
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailablePhoneNumber {
  number: string;
  country: string;
  region: string;
  locality?: string;
  numberType?: "local" | "tollFree" | "mobile";
  capabilities: string[];
  friendlyName?: string;
  setupPrice?: number;
  monthlyPrice?: number;
  price: number;
  isMagicNumber?: boolean;
  isTestAccount?: boolean;
}

export interface AvailableCountry {
  code: string;
  name: string;
  supported: boolean;
  beta?: boolean;
  subresourceUris?: any;
}

export interface CountryInfo {
  countryCode: string;
  country: string;
  beta: boolean;
  subresourceUris: any;
}

export const usePhoneNumbers = () => {
  return useQuery({
    queryKey: ["phoneNumbers", "purchased"],
    queryFn: async () => {
      if (import.meta.env.MODE === "development") {
        console.log("📞 usePhoneNumbers - Iniciando consulta a la API...");
      }
      try {
        const result = await apiClient.get("/dashboard/phone-numbers");
        if (import.meta.env.MODE === "development") {
          console.log("✅ usePhoneNumbers - Respuesta exitosa:", {
            hasData: !!result,
            dataLength: Array.isArray(result) ? result.length : "not array",
            dataType: typeof result,
          });
        }
        return result;
      } catch (error) {
        if (import.meta.env.MODE === "development") {
          console.error("❌ usePhoneNumbers - Error en la consulta:", {
            error: error instanceof Error ? error.message : String(error),
            status: (error as { status?: number }).status,
            code: (error as { status?: number; code?: string }).code,
          });
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // No reintentar en errores de autenticación
          if ((error as { status?: number; code?: string }).status === 401 || (error as { status?: number; code?: string }).status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (más tiempo para evitar recargas)
    refetchOnWindowFocus: false, // Evitar recargas automáticas
    refetchOnMount: false, // No recargar al montar si hay datos en cache
    gcTime: 10 * 60 * 1000, // 10 minutos de garbage collection
    retryOnMount: false, // No reintentar al montar si hay datos
  });
};

// Hook optimizado para PurchasedNumbers con mejor manejo de recarga
export const usePurchasedPhoneNumbers = () => {
  return useQuery({
    queryKey: ["phoneNumbers", "purchased", "optimized"],
    queryFn: async () => {
      if (import.meta.env.MODE === "development") {
        console.log("📞 usePurchasedPhoneNumbers - Iniciando consulta optimizada...");
      }
      try {
        const result = await apiClient.get("/dashboard/phone-numbers");
        if (import.meta.env.MODE === "development") {
          console.log("✅ usePurchasedPhoneNumbers - Respuesta exitosa:", {
            hasData: !!result,
            dataLength: Array.isArray(result) ? result.length : "not array",
            dataType: typeof result,
          });
        }
        return result;
      } catch (error) {
        if (import.meta.env.MODE === "development") {
          console.error("❌ usePurchasedPhoneNumbers - Error en la consulta:", {
            error: error instanceof Error ? error.message : String(error),
            status: (error as { status?: number }).status,
            code: (error as { status?: number; code?: string }).code,
          });
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // No reintentar en errores de autenticación
          if ((error as { status?: number; code?: string }).status === 401 || (error as { status?: number; code?: string }).status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (más tiempo para evitar recargas)
    refetchOnWindowFocus: false, // Evitar recargas automáticas
    refetchOnMount: false, // No recargar al montar si hay datos en cache
    refetchOnReconnect: false, // No recargar automáticamente al reconectar
    // Configuración optimizada para evitar recargas completas
    notifyOnChangeProps: ['data', 'error', 'isLoading'], // Solo notificar cambios específicos
    // Configuración adicional para optimización
    gcTime: 10 * 60 * 1000, // 10 minutos de garbage collection
    retryOnMount: false, // No reintentar al montar si hay datos
    // Configuración para evitar recargas completas
    refetchInterval: false, // No recargar automáticamente
    refetchIntervalInBackground: false, // No recargar en background
  });
};

export const useAvailablePhoneNumbers = (filters: {
  country: string;
  numberType: "local" | "tollFree" | "mobile";
  search?: string;
  startsWith?: string;
  endsWith?: string;
  voiceEnabled?: boolean;
  smsEnabled?: boolean;
  mmsEnabled?: boolean;
  faxEnabled?: boolean;
  beta?: boolean;
}) => {
  return useQuery({
    queryKey: ["phoneNumbers", "available", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("country", filters.country);
      params.append("numberType", filters.numberType);
      if (filters.search) params.append("search", filters.search);
      if (filters.startsWith) params.append("startsWith", filters.startsWith);
      if (filters.endsWith) params.append("endsWith", filters.endsWith);
      if (filters.voiceEnabled !== undefined)
        params.append("voiceEnabled", filters.voiceEnabled.toString());
      if (filters.smsEnabled !== undefined)
        params.append("smsEnabled", filters.smsEnabled.toString());
      if (filters.mmsEnabled !== undefined)
        params.append("mmsEnabled", filters.mmsEnabled.toString());
      if (filters.faxEnabled !== undefined)
        params.append("faxEnabled", filters.faxEnabled.toString());
      if (filters.beta !== undefined)
        params.append("beta", filters.beta.toString());

      const url = `${endpoints.phoneNumbers.available}?${params.toString()}`;
      return apiClient.get<AvailablePhoneNumber[]>(url);
    },
    enabled: !!filters.country,
  });
};

export const useBuyPhoneNumber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { number: string; country: string }) =>
      apiClient.post<PhoneNumber>(endpoints.phoneNumbers.buy, data),
    onSuccess: () => {
      // Invalidar solo las queries de purchased numbers después de comprar con exact: true
      queryClient.invalidateQueries({ 
        queryKey: ["phoneNumbers", "purchased", "optimized"],
        exact: true
      });
    },
  });
};

export const useAssignPhoneNumber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      phoneNumberId,
      agentId,
    }: {
      phoneNumberId: string;
      agentId: string;
    }) =>
      apiClient.post(endpoints.phoneNumbers.assign(phoneNumberId), { agentId }),
    onSuccess: () => {
      // Invalidar solo las queries de purchased numbers después de asignar con exact: true
      queryClient.invalidateQueries({ 
        queryKey: ["phoneNumbers", "purchased", "optimized"],
        exact: true
      });
    },
  });
};

export const useReleasePhoneNumber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      phoneNumberId,
      confirmationText,
    }: {
      phoneNumberId: string;
      confirmationText: string;
    }) =>
      apiClient.post(`/phone-numbers/${phoneNumberId}/release`, {
        confirmationText,
      }),
    onSuccess: () => {
      // Invalidar solo la query específica de purchased numbers con exact: true
      queryClient.invalidateQueries({ 
        queryKey: ["phoneNumbers", "purchased", "optimized"],
        exact: true
      });
    },
  });
};

export const useActivatePhoneNumber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phoneNumberId: string) =>
      apiClient.patch(`/phone-numbers/${phoneNumberId}/activate`),
    onSuccess: () => {
      // Invalidar solo la query específica de purchased numbers con exact: true
      queryClient.invalidateQueries({ 
        queryKey: ["phoneNumbers", "purchased", "optimized"],
        exact: true
      });
    },
  });
};

export const useDeactivatePhoneNumber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phoneNumberId: string) =>
      apiClient.patch(`/phone-numbers/${phoneNumberId}/deactivate`),
    onSuccess: () => {
      // Invalidar solo la query específica de purchased numbers con exact: true
      queryClient.invalidateQueries({ 
        queryKey: ["phoneNumbers", "purchased", "optimized"],
        exact: true
      });
    },
  });
};

export const useAvailableCountries = () => {
  return useQuery({
    queryKey: ["phoneNumbers", "countries"],
    queryFn: () =>
      apiClient.get<AvailableCountry[]>("/phone-numbers/countries"),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useCountryInfo = (countryCode: string) => {
  return useQuery({
    queryKey: ["phoneNumbers", "countryInfo", countryCode],
    queryFn: () =>
      apiClient.get<CountryInfo>(`/phone-numbers/countries/${countryCode}`),
    enabled: !!countryCode,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};

export interface PhoneNumberPrice {
  numberType: "local" | "mobile" | "national" | "toll free";
  basePrice: string;
  currentPrice: string;
}

export interface CountryPricing {
  country: string;
  isoCountry: string;
  phoneNumberPrices: PhoneNumberPrice[];
  priceUnit: string;
  url: string;
}

export const useCountryPricing = (countryCode: string) => {
  return useQuery({
    queryKey: ["phoneNumbers", "pricing", countryCode],
    queryFn: () =>
      apiClient.get<CountryPricing>(`/phone-numbers/pricing/${countryCode}`),
    enabled: !!countryCode,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });
};

export const useSyncPhoneNumbersWithElevenLabs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post("/integrations/elevenlabs/phone-numbers/sync"),
    onSuccess: () => {
      // Invalidar solo la query específica de purchased numbers con exact: true
      queryClient.invalidateQueries({ 
        queryKey: ["phoneNumbers", "purchased", "optimized"],
        exact: true
      });
    },
  });
};
