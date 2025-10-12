import { useGetRequest } from "@/utils/useApiCall";

export type Payment = {
  id: string;
  amount: number;
  paymentStatus: string; 
  paymentMethod: string; 
  paymentDate: string;  
};

export type AgentSaleCore = {
  id: string;
  status?: string;            
  totalPrice: number;         
  totalPaid: number;         
  paymentMethod?: string;    
  payment?: Payment[];       
};

export type AgentSaleItem = {
  id: string;                
  createdAt: string;          
  quantity: number;
  totalPrice: number;         
  paymentMode?: string;      
  sale?: AgentSaleCore;      
};

export type AgentSalesListResponse = {
  items: AgentSaleItem[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};


const normalizeList = (raw: any): AgentSalesListResponse => {
  const items: AgentSaleItem[] = Array.isArray(raw?.saleItems)
    ? raw.saleItems
    : Array.isArray(raw?.items)
    ? raw.items
    : [];

  return {
    items,
    total: Number(raw?.total ?? items.length) || 0,
    page: raw?.page,
    limit: raw?.limit,
    totalPages: raw?.totalPages,
  };
};

export function useGetAgentSalesQuery(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useGetRequest(`/v1/agents/sales${query.toString() ? `?${query}` : ""}`, true);

  const normalized = normalizeList(data);

  return {
    data: normalized,
    isFetching: Boolean(isLoading || isValidating),
    isError: Boolean(error),
    refetch: () => mutate(),
  };
}


export function useGetAgentSaleByIdQuery(id?: string) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useGetRequest(id ? `/v1/agents/sales/${id}` : "", Boolean(id));

  const item: AgentSaleItem | undefined =
    (data?.saleItem as AgentSaleItem) ??
    (data as AgentSaleItem) ??
    undefined;

  return {
    data: item,
    isFetching: Boolean(isLoading || isValidating),
    isError: Boolean(error),
    refetch: () => mutate(),
  };
}
