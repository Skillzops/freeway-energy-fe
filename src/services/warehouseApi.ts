import { useApiCall, useGetRequest } from '../utils/useApiCall';
import type { Warehouse, Product, TransferRequest } from '../data/warehouseData';

// API endpoints for warehouse operations
const WAREHOUSE_ENDPOINTS = {
  WAREHOUSES: '/v1/warehouses',
  WAREHOUSE_BY_ID: (id: string) => `/v1/warehouses/${id}`,
  WAREHOUSE_INVENTORY: (id: string) => `/v1/warehouses/${id}/inventory`,
  PRODUCTS: '/v1/products',
  PRODUCT_BY_ID: (id: string) => `/v1/products/${id}`,
  TRANSFER_REQUESTS: '/v1/transfer-requests',
  TRANSFER_REQUEST_BY_ID: (id: string) => `/v1/transfer-requests/${id}`,
  WAREHOUSE_METRICS: '/v1/warehouses/metrics',
  WAREHOUSE_TRANSFERS: (id: string) => `/v1/warehouses/${id}/transfers`,
};

// Warehouse API service
export const useWarehouseApi = () => {
  const { apiCall } = useApiCall();

  // Warehouse CRUD operations
  const createWarehouse = async (warehouseData: Omit<Warehouse, 'id'>) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSES,
      method: 'post',
      data: warehouseData,
      successMessage: 'Warehouse created successfully',
    });
  };

  const updateWarehouse = async (id: string, warehouseData: Partial<Warehouse>) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_BY_ID(id),
      method: 'put',
      data: warehouseData,
      successMessage: 'Warehouse updated successfully',
    });
  };

  const deleteWarehouse = async (id: string) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_BY_ID(id),
      method: 'delete',
      successMessage: 'Warehouse deleted successfully',
    });
  };

  const toggleWarehouseStatus = async (id: string, isActive: boolean) => {
    return await apiCall({
      endpoint: `${WAREHOUSE_ENDPOINTS.WAREHOUSE_BY_ID(id)}/status`,
      method: 'patch',
      data: { isActive },
      successMessage: `Warehouse ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  };

  // Product operations
  const createProduct = async (productData: Omit<Product, 'id'>) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.PRODUCTS,
      method: 'post',
      data: productData,
      successMessage: 'Product created successfully',
    });
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.PRODUCT_BY_ID(id),
      method: 'put',
      data: productData,
      successMessage: 'Product updated successfully',
    });
  };

  const deleteProduct = async (id: string) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.PRODUCT_BY_ID(id),
      method: 'delete',
      successMessage: 'Product deleted successfully',
    });
  };

  // Transfer request operations
  const createTransferRequest = async (transferData: Omit<TransferRequest, 'id' | 'requestDate' | 'fulfilledQuantity' | 'status'>) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS,
      method: 'post',
      data: transferData,
      successMessage: 'Transfer request created successfully',
    });
  };

  const updateTransferRequest = async (id: string, transferData: Partial<TransferRequest>) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_BY_ID(id),
      method: 'put',
      data: transferData,
      successMessage: 'Transfer request updated successfully',
    });
  };

  const fulfillTransferRequest = async (id: string, fulfilledQuantity: number, status: 'fulfilled' | 'partial' | 'rejected', notes?: string) => {
    return await apiCall({
      endpoint: `${WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_BY_ID(id)}/fulfill`,
      method: 'patch',
      data: { fulfilledQuantity, status, notes },
      successMessage: 'Transfer request fulfilled successfully',
    });
  };

  // Inventory operations
  const addInventoryItem = async (warehouseId: string, inventoryData: any) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY(warehouseId),
      method: 'post',
      data: inventoryData,
      successMessage: 'Inventory item added successfully',
    });
  };

  const updateInventoryItem = async (warehouseId: string, itemId: string, inventoryData: any) => {
    return await apiCall({
      endpoint: `${WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY(warehouseId)}/${itemId}`,
      method: 'put',
      data: inventoryData,
      successMessage: 'Inventory item updated successfully',
    });
  };

  const deleteInventoryItem = async (warehouseId: string, itemId: string) => {
    return await apiCall({
      endpoint: `${WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY(warehouseId)}/${itemId}`,
      method: 'delete',
      successMessage: 'Inventory item deleted successfully',
    });
  };

  return {
    // Warehouse operations
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    toggleWarehouseStatus,
    
    // Product operations
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Transfer operations
    createTransferRequest,
    updateTransferRequest,
    fulfillTransferRequest,
    
    // Inventory operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  };
};

// Data fetching hooks using SWR
export const useWarehouses = (revalidate = true) => {
  return useGetRequest(WAREHOUSE_ENDPOINTS.WAREHOUSES, revalidate);
};

export const useWarehouse = (id: string | null, revalidate = true) => {
  return useGetRequest(
    id ? WAREHOUSE_ENDPOINTS.WAREHOUSE_BY_ID(id) : null,
    revalidate
  );
};

export const useWarehouseInventory = (warehouseId: string | null, revalidate = true) => {
  return useGetRequest(
    warehouseId ? WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY(warehouseId) : null,
    revalidate
  );
};

export const useProducts = (revalidate = true) => {
  return useGetRequest(WAREHOUSE_ENDPOINTS.PRODUCTS, revalidate);
};

export const useProduct = (id: string | null, revalidate = true) => {
  return useGetRequest(
    id ? WAREHOUSE_ENDPOINTS.PRODUCT_BY_ID(id) : null,
    revalidate
  );
};

export const useTransferRequests = (revalidate = true) => {
  return useGetRequest(WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS, revalidate);
};

export const useTransferRequest = (id: string | null, revalidate = true) => {
  return useGetRequest(
    id ? WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_BY_ID(id) : null,
    revalidate
  );
};

export const useWarehouseMetrics = (revalidate = true) => {
  return useGetRequest(WAREHOUSE_ENDPOINTS.WAREHOUSE_METRICS, revalidate);
};

export const useWarehouseTransfers = (warehouseId: string | null, revalidate = true) => {
  return useGetRequest(
    warehouseId ? WAREHOUSE_ENDPOINTS.WAREHOUSE_TRANSFERS(warehouseId) : null,
    revalidate
  );
};

// Search and filter hooks
export const useSearchWarehouses = (searchTerm: string, revalidate = true) => {
  return useGetRequest(
    searchTerm ? `${WAREHOUSE_ENDPOINTS.WAREHOUSES}?search=${encodeURIComponent(searchTerm)}` : null,
    revalidate
  );
};

export const useSearchProducts = (searchTerm: string, revalidate = true) => {
  return useGetRequest(
    searchTerm ? `${WAREHOUSE_ENDPOINTS.PRODUCTS}?search=${encodeURIComponent(searchTerm)}` : null,
    revalidate
  );
};

export const useFilteredTransferRequests = (filters: { status?: string; warehouseId?: string }, revalidate = true) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.warehouseId) queryParams.append('warehouseId', filters.warehouseId);
  
  const queryString = queryParams.toString();
  return useGetRequest(
    queryString ? `${WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS}?${queryString}` : WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS,
    revalidate
  );
};

// Pagination hooks
export const usePaginatedWarehouses = (page: number, limit: number = 10, revalidate = true) => {
  return useGetRequest(
    `${WAREHOUSE_ENDPOINTS.WAREHOUSES}?page=${page}&limit=${limit}`,
    revalidate
  );
};

export const usePaginatedProducts = (page: number, limit: number = 10, revalidate = true) => {
  return useGetRequest(
    `${WAREHOUSE_ENDPOINTS.PRODUCTS}?page=${page}&limit=${limit}`,
    revalidate
  );
};

export const usePaginatedTransferRequests = (page: number, limit: number = 10, revalidate = true) => {
  return useGetRequest(
    `${WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS}?page=${page}&limit=${limit}`,
    revalidate
  );
};