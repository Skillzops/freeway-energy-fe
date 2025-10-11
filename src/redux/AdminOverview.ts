// src/Redux/AgentOverview.ts
import { useMemo } from "react";
import { useGetRequest } from "@/utils/useApiCall";



export type TopAgent = {
  agentId: number;
  name: string;
  email: string;
  category: string;      
  salesCount: number;
  totalRevenue: number;  
};


export type AdminOverviewResponse = {
  overview: {
    totalRevenue: number;
    totalSales: number;
    totalCustomers: number;
    totalAgent: number;
  };
  charts?: {
    salesGraph?: Array<any>;
  };
  insights: {
    topPerformingAgents: Array<any>;
  }
};

export type OverviewFilters = {
  status?: "COMPLETED" | "IN_INSTALLMENT" | "UNPAID" | "CANCELLED";
  month?: string;        // e.g. "Jan", "Feb", ...
  productType?: string;  // if/when you support it server-side
};

/**
 * Fetch Agent Overview with optional filters
 * Usage: const { data, isFetching } = useGetAdminOverviewQuery({ status, month, productType })
 */
export function useGetAdminOverviewQuery(filters?: OverviewFilters) {
  // Build a stable URL based on filters (memoized)
  const endpoint = useMemo(() => {
    const url = new URL("/v1/analytics/overview", "http://local"); // base ignored by client
    if (filters?.status) url.searchParams.set("status", filters.status);
    if (filters?.month) url.searchParams.set("month", filters.month);
    if (filters?.productType) url.searchParams.set("productType", filters.productType);
    // strip the fake origin
    return url.pathname + (url.search ? url.search : "");
  }, [filters?.status, filters?.month, filters?.productType]);

  // NOTE: your useGetRequest signature looked like useGetRequest(path, needsAuth)
  // If it supports SWR options, you can pass { revalidateOnFocus:false, revalidateOnReconnect:false } as a 3rd arg.
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useGetRequest(endpoint, true /* needsAuth */ /* , { revalidateOnFocus:false, revalidateOnReconnect:false } */);

  const typedData = data as AdminOverviewResponse | undefined;

  return {
    data: typedData,
    isFetching: Boolean(isLoading || isValidating),
    isError: Boolean(error) && (error as any)?.message !== "PERMISSION_DENIED",
    refetch: () => mutate(),
  };
}

export default useGetAdminOverviewQuery;
