import { useApiCall, useGetRequest } from '../utils/useApiCall';
import type { Warehouse, Product as _Product, TransferRequest } from '../data/warehouseData';
import { useMemo } from 'react';

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
  WAREHOUSE_INVENTORY: (id: string) => `/v1/warehouses/${id}/inventory`,
  WAREHOUSE_INVENTORY_ITEM: (warehouseId: string, itemId: string) => `/v1/warehouses/${warehouseId}/inventory/${itemId}`,
  PRODUCTS: '/v1/products',
  PRODUCT_BY_ID: (id: string) => `/v1/products/${id}`,
  USERS: '/v1/users'
} as const;

// Common headers
const JSON_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
} as const;

const FORM_DATA_HEADERS = {
  'Accept': 'application/json'
} as const;

// Helper function to normalize API response data
const normalizeArrayResponse = (data: any, fallbackKey?: string): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const possibleKeys = [
  fallbackKey,
  'data',
  'warehouses',
  'products',
  'transferRequests',
  'transfers',
  'inventories',
  'inventory',
  'managers',
  'users',
  'categories'].
  filter(Boolean);

  for (const key of possibleKeys) {
    if (data[key] && Array.isArray(data[key])) {
      return data[key];
    }
  }

  return [];
};

// Warehouse API service
export const useWarehouseApi = () => {
  const { apiCall } = useApiCall();

  // Optimized warehouse operations with consistent error handling
  const warehouseOperations = useMemo(() => ({
    create: async (warehouseData: Omit<Warehouse, 'id'>) => {
      const formData = new FormData();

      // Append required fields
      Object.entries({
        name: warehouseData.name,
        location: warehouseData.location,
        totalItems: warehouseData.totalItems.toString(),
        totalValue: warehouseData.totalValue.toString(),
        isMain: warehouseData.isMainWarehouse.toString(),
        state: "LAGOS",
        ...(warehouseData.isActive !== undefined && { isActive: warehouseData.isActive.toString() })
      }).forEach(([key, value]) => formData.append(key, value));

      // Append image if exists
      if (warehouseData.image instanceof File) {
        formData.append('image', warehouseData.image);
      }

      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSES,
        method: 'post',
        data: formData,
        headers: FORM_DATA_HEADERS,
        successMessage: 'Warehouse created successfully'
      });

      // Trigger revalidation of warehouses data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' && key.includes('/v1/warehouses'));
      });

      return result;
    },

    update: async (id: string, warehouseData: Partial<Warehouse> | FormData) => {
      const isFormData = warehouseData instanceof FormData;

      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_BY_ID(id),
        method: 'patch',
        data: warehouseData,
        headers: isFormData ? FORM_DATA_HEADERS : JSON_HEADERS,
        successMessage: 'Warehouse updated successfully'
      });

      // Trigger revalidation of warehouses data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' && (
        key.includes('/v1/warehouses') ||
        key.includes(`/v1/warehouses/${id}`))
        );
      });

      return result;
    },

    delete: async (id: string) => {
      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_BY_ID(id),
        method: 'delete',
        headers: FORM_DATA_HEADERS,
        successMessage: 'Warehouse deleted successfully'
      });

      // Trigger revalidation of warehouses data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' && key.includes('/v1/warehouses'));
      });

      return result;
    },

    toggleStatus: async (id: string, isActive: boolean) => {
      const endpoint = isActive ?
      WAREHOUSE_ENDPOINTS.WAREHOUSE_ACTIVATE(id) :
      WAREHOUSE_ENDPOINTS.WAREHOUSE_DEACTIVATE(id);

      const result = await apiCall({
        endpoint,
        method: 'patch',
        data: {},
        headers: FORM_DATA_HEADERS,
        successMessage: `Warehouse ${isActive ? 'activated' : 'deactivated'} successfully`
      });

      // Trigger revalidation of warehouses data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' && (
        key.includes('/v1/warehouses') ||
        key.includes(`/v1/warehouses/${id}`))
        );
      });

      return result;
    }
  }), [apiCall]);

  // Optimized transfer operations
  const transferOperations = useMemo(() => ({
    create: async (transferData: Omit<TransferRequest, 'id' | 'requestDate' | 'fulfilledQuantity' | 'status'>) => {
      const apiData = {
        fromWarehouseId: transferData.fromWarehouse,
        toWarehouseId: transferData.toWarehouse,
        inventoryId: transferData.productId,
        requestedQuantity: transferData.requestedQuantity,
        notes: transferData.notes
      };

      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS,
        method: 'post',
        data: apiData,
        headers: JSON_HEADERS,
        successMessage: 'Transfer request created successfully'
      });

      // Trigger revalidation of transfer requests data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' && key.includes('/v1/warehouses/transfer-requests'));
      });

      return result;
    },

    fulfill: async (id: string, quantity?: number, notes?: string) => {
      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_FULFILL(id),
        method: 'patch',
        data: { quantity, notes },
        headers: JSON_HEADERS,
        successMessage: 'Transfer request fulfilled successfully'
      });

      // Trigger revalidation of transfer requests and inventory data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' && (
        key.includes('/v1/warehouses/transfer-requests') ||
        key.includes('/v1/warehouses') && key.includes('/inventory'))
        );
      });

      return result;
    },

    reject: async (id: string, reason?: string) => {
      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_REJECT(id),
        method: 'patch',
        data: { reason },
        headers: JSON_HEADERS,
        successMessage: 'Transfer request rejected successfully'
      });

      // Trigger revalidation of transfer requests data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' && key.includes('/v1/warehouses/transfer-requests'));
      });

      return result;
    },

    update: async (id: string, updates: Partial<TransferRequest>) => {
      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_BY_ID(id),
        method: 'patch',
        data: updates,
        headers: JSON_HEADERS,
        successMessage: 'Transfer request updated successfully'
      });

      // Trigger revalidation of transfer requests data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' && key.includes('/v1/warehouses/transfer-requests'));
      });

      return result;
    }
  }), [apiCall]);

  // Optimized inventory operations
  const inventoryOperations = useMemo(() => ({
    add: async (warehouseId: string, inventoryData: any) => {
      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY(warehouseId),
        method: 'post',
        data: inventoryData,
        headers: JSON_HEADERS,
        successMessage: 'Inventory item added successfully'
      });

      // Trigger revalidation of inventory data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' &&
        key.includes('/v1/warehouses') && key.includes('/inventory')
        );
      });

      return result;
    },

    update: async (warehouseId: string, itemId: string, updates: any) => {
      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY_ITEM(warehouseId, itemId),
        method: 'patch',
        data: updates,
        headers: JSON_HEADERS,
        successMessage: 'Inventory item updated successfully'
      });

      // Trigger revalidation of inventory data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' &&
        key.includes('/v1/warehouses') && key.includes('/inventory')
        );
      });

      return result;
    },

    delete: async (warehouseId: string, itemId: string) => {
      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_INVENTORY_ITEM(warehouseId, itemId),
        method: 'delete',
        headers: JSON_HEADERS,
        successMessage: 'Inventory item deleted successfully'
      });

      // Trigger revalidation of inventory data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' &&
        key.includes('/v1/warehouses') && key.includes('/inventory')
        );
      });

      return result;
    }
  }), [apiCall]);

  // Optimized manager operations
  const managerOperations = useMemo(() => ({
    assign: async (warehouseId: string, userIds: string[]) => {
      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.WAREHOUSE_MANAGERS(warehouseId),
        method: 'post',
        data: { userIds },
        headers: JSON_HEADERS,
        successMessage: 'Warehouse managers assigned successfully'
      });

      // Trigger revalidation of managers data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' && key.includes(`/v1/warehouses/${warehouseId}/managers`));
      });

      return result;
    },

    unassign: async (managerId: string) => {
      const result = await apiCall({
        endpoint: WAREHOUSE_ENDPOINTS.UNASSIGN_MANAGER(managerId),
        method: 'delete',
        headers: FORM_DATA_HEADERS,
        successMessage: 'Warehouse manager unassigned successfully'
      });

      // Trigger revalidation of managers data
      import('swr').then(({ mutate }) => {
        mutate((key) => typeof key === 'string' && key.includes('/managers'));
      });

      return result;
    }
  }), [apiCall]);

  return {
    // Warehouse operations
    createWarehouse: warehouseOperations.create,
    updateWarehouse: warehouseOperations.update,
    deleteWarehouse: warehouseOperations.delete,
    toggleWarehouseStatus: warehouseOperations.toggleStatus,
    activateWarehouse: (id: string) => warehouseOperations.toggleStatus(id, true),
    deactivateWarehouse: (id: string) => warehouseOperations.toggleStatus(id, false),

    // Manager operations
    assignWarehouseManagers: managerOperations.assign,
    unassignWarehouseManager: managerOperations.unassign,

    // Transfer operations
    createTransferRequest: transferOperations.create,
    fulfillTransferRequest: transferOperations.fulfill,
    rejectTransferRequest: transferOperations.reject,
    updateTransferRequest: transferOperations.update,

    // Inventory operations
    addInventoryItem: inventoryOperations.add,
    updateInventoryItem: inventoryOperations.update,
    deleteInventoryItem: inventoryOperations.delete
  };
};

// Optimized data fetching hooks with better caching and error handling
export const useWarehouses = (revalidate = true, enabled = true) => {
  const result = useGetRequest(
    enabled ? WAREHOUSE_ENDPOINTS.WAREHOUSES : null,
    revalidate
  );

  const processedData = useMemo(() => {
    const rawData = normalizeArrayResponse(result.data, 'warehouses');

    // Map and sort warehouses
    const mappedData = rawData.map((warehouse: any) => ({
      ...warehouse,
      isMainWarehouse: warehouse.isMain || warehouse.isMainWarehouse || false
    }));

    // Sort: main warehouses first
    return mappedData.sort((a: any, b: any) => {
      if (a.isMainWarehouse && !b.isMainWarehouse) return -1;
      if (!a.isMainWarehouse && b.isMainWarehouse) return 1;
      return 0;
    });
  }, [result.data]);

  return { ...result, data: processedData };
};

// Optimized single warehouse hook
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
  Array.isArray(result.data) ? result.data :
  Array.isArray(result.data.inventories) ? result.data.inventories :
  Array.isArray(result.data.data) ? result.data.data : [] : [];

  return {
    ...result,
    data: processedData
  };
};

export const useProducts = (revalidate = true, enabled = true) => {
  const result = useGetRequest(
    enabled ? WAREHOUSE_ENDPOINTS.PRODUCTS : null,
    revalidate
  );

  // Handle different API response structures
  const processedData = result.data ?
  Array.isArray(result.data) ? result.data :
  Array.isArray(result.data.data) ? result.data.data :
  Array.isArray(result.data.products) ? result.data.products : [] : [];

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

// Optimized transfer requests hook with filtering
export const useWarehouseTransferRequests = (filters: {
  fromWarehouseId?: string;
  toWarehouseId?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}, revalidate = true) => {

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    return params.toString();
  }, [filters]);

  const endpoint = queryString ?
  `${WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS}?${queryString}` :
  WAREHOUSE_ENDPOINTS.TRANSFER_REQUESTS;

  const result = useGetRequest(endpoint, revalidate);

  const processedData = useMemo(() => {
    if (!result.data) return [];

    // For paginated requests, return the full response with pagination metadata
    if (filters.page || filters.limit) {
      return result.data; // Return full response including transferRequests, total, page, etc.
    }

    // For non-paginated requests, return just the array
    if (result.data.transferRequests) {
      return result.data.transferRequests;
    }

    return normalizeArrayResponse(result.data, 'transferRequests');
  }, [result.data, filters.page, filters.limit]);

  return { ...result, data: processedData };
};

export const useTransferRequest = (id: string | null, revalidate = true) => {
  return useGetRequest(
    id ? WAREHOUSE_ENDPOINTS.TRANSFER_REQUEST_BY_ID(id) : null,
    revalidate
  );
};

// Optimized stats hook
export const useWarehouseStats = (revalidate = true, enabled = true) => {
  return useGetRequest(
    enabled ? WAREHOUSE_ENDPOINTS.WAREHOUSE_STATS : null,
    revalidate
  );
};

// Optimized managers hook
export const useWarehouseManagers = (warehouseId: string | null, revalidate = true, enabled = true) => {
  const result = useGetRequest(
    enabled && warehouseId ? WAREHOUSE_ENDPOINTS.WAREHOUSE_MANAGERS(warehouseId) : null,
    revalidate
  );

  const processedData = useMemo(() =>
  normalizeArrayResponse(result.data, 'managers'),
  [result.data]
  );

  return { ...result, data: processedData };
};

// Export commonly used hooks
export const useWarehouseMetrics = useWarehouseStats;
export const useTransferRequests = () => useWarehouseTransferRequests({});

export const useUsers = (revalidate = true, enabled = true) => {
  const result = useGetRequest(
    enabled ? WAREHOUSE_ENDPOINTS.USERS : null,
    revalidate
  );

  // Handle different API response structures
  const processedData = result.data ?
  Array.isArray(result.data) ? result.data :
  Array.isArray(result.data.data) ? result.data.data :
  Array.isArray(result.data.users) ? result.data.users : [] : [];

  return {
    ...result,
    data: processedData
  };
};
