// src/Redux/AgentOverview.ts
import { useMemo } from "react";
import { useGetRequest } from "@/utils/useApiCall";

export type AgentOverviewResponse = {
  overview: {
    totalSales: number;
    salesCount: number;
    totalCustomers: number;
    walletBalance: number;
  };
  charts?: {
    salesGraph?: Array<any>;
  };
};

export type OverviewFilters = {
  status?: "COMPLETED" | "IN_INSTALLMENT" | "UNPAID" | "CANCELLED";
  month?: string;        // e.g. "Jan", "Feb", ...
  productType?: string;  // if/when you support it server-side
};

/**
 * Fetch Agent Overview with optional filters
 * Usage: const { data, isFetching } = useGetAgentOverviewQuery({ status, month, productType })
 */
export function useGetAgentOverviewQuery(filters?: OverviewFilters) {
  // Build a stable URL based on filters (memoized)
  const endpoint = useMemo(() => {
    const url = new URL("/v1/agents/overview", "http://local"); // base ignored by client
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

  const typedData = data as AgentOverviewResponse | undefined;

  return {
    data: typedData,
    isFetching: Boolean(isLoading || isValidating),
    isError: Boolean(error) && (error as any)?.message !== "PERMISSION_DENIED",
    refetch: () => mutate(),
  };
}

export default useGetAgentOverviewQuery;
