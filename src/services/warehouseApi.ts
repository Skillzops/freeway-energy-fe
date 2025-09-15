import { useApiCall, useGetRequest } from '../utils/useApiCall';
import type { Warehouse, Product, TransferRequest } from '../data/warehouseData';

// API endpoints for warehouse operations - Updated to match new API structure
const WAREHOUSE_ENDPOINTS = {
  WAREHOUSES: '/v1/warehouses',
  WAREHOUSE_BY_ID: (id: string) => `/v1/warehouses/${id}`,
  WAREHOUSE_STATS: '/v1/warehouses/stats',
  WAREHOUSE_ACTIVATE: (id: string) => `/v1/warehouses/${id}/activate`,
  WAREHOUSE_DEACTIVATE: (id: string) => `/v1/warehouses/${id}/deactivate`,
  WAREHOUSE_MANAGERS: (id: string) => `/v1/warehouses/${id}/managers`,
  UNASSIGN_MANAGER: (managerId: string) => `/v1/warehouses/managers/${managerId}`,
  TRANSFER_REQUESTS: '/v1/warehouses/transfer-requests',
  TRANSFER_REQUEST_BY_ID: (id: string) => `/v1/warehouses/transfer-requests/${id}`,
  TRANSFER_REQUEST_FULFILL: (id: string) => `/v1/warehouses/transfer-requests/${id}/fulfill`,
  TRANSFER_REQUEST_REJECT: (id: string) => `/v1/warehouses/transfer-requests/${id}/reject`,
  // Legacy endpoints for backward compatibility
  PRODUCTS: '/v1/products',
  PRODUCT_BY_ID: (id: string) => `/v1/products/${id}`,
  WAREHOUSE_INVENTORY: (id: string) => `/v1/warehouses/${id}/inventory`,
  USERS: '/v1/users',
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
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Warehouse created successfully',
    });
  };

  const updateWarehouse = async (id: string, warehouseData: Partial<Warehouse>) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_BY_ID(id),
      method: 'patch',
      data: warehouseData,
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Warehouse updated successfully',
    });
  };

  const deleteWarehouse = async (id: string) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_BY_ID(id),
      method: 'delete',
      headers: {
        'Accept': 'application/json',
      },
      successMessage: 'Warehouse deleted successfully',
    });
  };

  const activateWarehouse = async (id: string) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_ACTIVATE(id),
      method: 'patch',
      data: {},
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Warehouse activated successfully',
    });
  };

  const deactivateWarehouse = async (id: string) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_DEACTIVATE(id),
      method: 'patch',
      data: {},
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Warehouse deactivated successfully',
    });
  };

  const toggleWarehouseStatus = async (id: string, isActive: boolean) => {
    return isActive ? activateWarehouse(id) : deactivateWarehouse(id);
  };

  // Product operations
  const createProduct = async (productData: Omit<Product, 'id'>) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.PRODUCTS,
      method: 'post',
      data: productData,
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Product created successfully',
    });
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.PRODUCT_BY_ID(id),
      method: 'put',
      data: productData,
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Product updated successfully',
    });
  };

  const deleteProduct = async (id: string) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.PRODUCT_BY_ID(id),
      method: 'delete',
      headers: {
        'Accept': 'application/json',
      },
      successMessage: 'Product deleted successfully',
    });
  };

  // Transfer request operations
  const createTransferRequest = async (transferData: Omit<TransferRequest, 'id' | 'requestDate' | 'fulfilledQuantity' | 'status'>) => {
    // Map field names to what the API expects
    const apiData = {
      fromWarehouseId: transferData.fromWarehouse,
      toWarehouseId: transferData.toWarehouse,
      inventoryId: transferData.productId,
      requestedQuantity: transferData.requestedQuantity,
      notes: transferData.notes,
    };

    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS,
      method: 'post',
      data: apiData,
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Transfer request created successfully',
    });
  };

  const updateTransferRequest = async (id: string, transferData: Partial<TransferRequest>) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_BY_ID(id),
      method: 'put',
      data: transferData,
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Transfer request updated successfully',
    });
  };

  const fulfillTransferRequest = async (id: string, quantity?: number, notes?: string) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_FULFILL(id),
      method: 'patch',
      data: { quantity, notes },
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Transfer request fulfilled successfully',
    });
  };

  const rejectTransferRequest = async (id: string, reason?: string) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_REJECT(id),
      method: 'patch',
      data: { reason },
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Transfer request rejected successfully',
    });
  };

  // Inventory operations
  const addInventoryItem = async (warehouseId: string, inventoryData: any) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY(warehouseId),
      method: 'post',
      data: inventoryData,
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Inventory item added successfully',
    });
  };

  const updateInventoryItem = async (warehouseId: string, itemId: string, inventoryData: any) => {
    return await apiCall({
      endpoint: `${WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY(warehouseId)}/${itemId}`,
      method: 'put',
      data: inventoryData,
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Inventory item updated successfully',
    });
  };

  const deleteInventoryItem = async (warehouseId: string, itemId: string) => {
    return await apiCall({
      endpoint: `${WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY(warehouseId)}/${itemId}`,
      method: 'delete',
      headers: {
        'Accept': 'application/json',
      },
      successMessage: 'Inventory item deleted successfully',
    });
  };

  // Warehouse manager operations
  const assignWarehouseManagers = async (warehouseId: string, userIds: string[]) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_MANAGERS(warehouseId),
      method: 'post',
      data: { userIds },
      headers: {
        'Accept': 'application/json'
      },
      successMessage: 'Warehouse managers assigned successfully',
    });
  };

  const unassignWarehouseManager = async (managerId: string) => {
    return await apiCall({
      endpoint: WAREHOUSE_ENDPOINTS.UNASSIGN_MANAGER(managerId),
      method: 'delete',
      headers: {
        'Accept': 'application/json',
      },
      successMessage: 'Warehouse manager unassigned successfully',
    });
  };

  return {
    // Warehouse operations
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    toggleWarehouseStatus,
    activateWarehouse,
    deactivateWarehouse,
    
    // Warehouse manager operations
    assignWarehouseManagers,
    unassignWarehouseManager,
    
    // Product operations
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Transfer operations
    createTransferRequest,
    updateTransferRequest,
    fulfillTransferRequest,
    rejectTransferRequest,
    
    // Legacy inventory operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  };
};

// Data fetching hooks using SWR
export const useWarehouses = (revalidate = true) => {
  const result = useGetRequest(WAREHOUSE_ENDPOINTS.WAREHOUSES, revalidate);
  
  // Handle different API response structures and map fields
  const rawData = result.data ?
    (Array.isArray(result.data) ? result.data :
     Array.isArray(result.data.data) ? result.data.data :
     Array.isArray(result.data.warehouses) ? result.data.warehouses : []) : [];
  
  // Map API response fields to UI expected fields
  const processedData = rawData.map((warehouse: any) => ({
    ...warehouse,
    isMainWarehouse: warehouse.isMain || warehouse.isMainWarehouse || false, // Map 'isMain' field to 'isMainWarehouse'
  }));
  
  return {
    ...result,
    data: processedData
  };
};

export const useWarehouse = (id: string | null, revalidate = true) => {
  return useGetRequest(
    id ? WAREHOUSE_ENDPOINTS.WAREHOUSE_BY_ID(id) : null,
    revalidate
  );
};

export const useWarehouseInventory = (warehouseId: string | null, revalidate = true) => {
  const result = useGetRequest(
    warehouseId ? WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY(warehouseId) : null,
    revalidate
  );
  
  // Handle the new API response structure
  const processedData = result.data ?
    (Array.isArray(result.data) ? result.data :
     Array.isArray(result.data.inventories) ? result.data.inventories :
     Array.isArray(result.data.data) ? result.data.data : []) : [];
  
  return {
    ...result,
    data: processedData
  };
};

// Note: Inventory API hooks are now in inventoryApi.ts

export const useProducts = (revalidate = true) => {
  const result = useGetRequest(WAREHOUSE_ENDPOINTS.PRODUCTS, revalidate);
  
  // Handle different API response structures
  const processedData = result.data ?
    (Array.isArray(result.data) ? result.data :
     Array.isArray(result.data.data) ? result.data.data :
     Array.isArray(result.data.products) ? result.data.products : []) : [];
  
  return {
    ...result,
    data: processedData
  };
};

export const useProduct = (id: string | null, revalidate = true) => {
  return useGetRequest(
    id ? WAREHOUSE_ENDPOINTS.PRODUCT_BY_ID(id) : null,
    revalidate
  );
};

export const useTransferRequests = (revalidate = true) => {
  const result = useGetRequest(WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS, revalidate);
  
  // Handle different API response structures
  const processedData = result.data ?
    (Array.isArray(result.data) ? result.data :
     Array.isArray(result.data.data) ? result.data.data :
     Array.isArray(result.data.transferRequests) ? result.data.transferRequests :
     Array.isArray(result.data.transfers) ? result.data.transfers : []) : [];
  
  return {
    ...result,
    data: processedData
  };
};

export const useTransferRequest = (id: string | null, revalidate = true) => {
  return useGetRequest(
    id ? WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_BY_ID(id) : null,
    revalidate
  );
};

export const useWarehouseStats = (revalidate = true) => {
  return useGetRequest(WAREHOUSE_ENDPOINTS.WAREHOUSE_STATS, revalidate);
};

export const useWarehouseMetrics = (revalidate = true) => {
  return useWarehouseStats(revalidate);
};

export const useWarehouseManagers = (warehouseId: string | null, revalidate = true) => {
  const result = useGetRequest(
    warehouseId ? WAREHOUSE_ENDPOINTS.WAREHOUSE_MANAGERS(warehouseId) : null,
    revalidate
  );
  
  // Handle different API response structures
  const processedData = result.data ?
    (Array.isArray(result.data) ? result.data :
     Array.isArray(result.data.data) ? result.data.data :
     Array.isArray(result.data.managers) ? result.data.managers : []) : [];
  
  return {
    ...result,
    data: processedData
  };
};

export const useWarehouseTransfers = (warehouseId: string | null, revalidate = true) => {
  return useGetRequest(
    warehouseId ? `${WAREHOUSE_ENDPOINTS.WAREHOUSE_BY_ID(warehouseId)}/transfers` : null,
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

export const useWarehouseTransferRequests = (filters: {
  fromWarehouseId?: string;
  toWarehouseId?: string;
  status?: string;
  page?: number;
  limit?: number;
}, revalidate = true) => {
  const queryParams = new URLSearchParams();
  if (filters.fromWarehouseId) queryParams.append('fromWarehouseId', filters.fromWarehouseId);
  if (filters.toWarehouseId) queryParams.append('toWarehouseId', filters.toWarehouseId);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  
  const queryString = queryParams.toString();
  const result = useGetRequest(
    queryString ? `${WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS}?${queryString}` : WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS,
    revalidate
  );
  
  // Handle different API response structures
  const processedData = result.data ?
    (Array.isArray(result.data) ? result.data :
     Array.isArray(result.data.data) ? result.data.data :
     Array.isArray(result.data.transferRequests) ? result.data.transferRequests :
     Array.isArray(result.data.transfers) ? result.data.transfers : []) : [];
  
  return {
    ...result,
    data: processedData
  };
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

export const useUsers = (revalidate = true) => {
  const result = useGetRequest(WAREHOUSE_ENDPOINTS.USERS, revalidate);
  
  // Handle different API response structures
  const processedData = result.data ?
    (Array.isArray(result.data) ? result.data :
     Array.isArray(result.data.data) ? result.data.data :
     Array.isArray(result.data.users) ? result.data.users : []) : [];
  
  return {
    ...result,
    data: processedData
  };
};