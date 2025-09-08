import { useApiCall, useGetRequest } from '../utils/useApiCall';

// Inventory API endpoints
const INVENTORY_ENDPOINTS = {
  INVENTORY: '/v1/inventory',
  INVENTORY_BY_ID: (id: string) => `/v1/inventory/${id}`,
  INVENTORY_BATCH_CREATE: '/api/v1/inventory/batch/create',
  INVENTORY_BATCH_BY_ID: (id: string) => `/v1/inventory/batch/${id}`,
  INVENTORY_CATEGORIES: '/v1/inventory/categories/all',
  INVENTORY_CATEGORY_CREATE: '/v1/inventory/category/create',
  INVENTORY_CREATE: '/v1/inventory/create',
  INVENTORY_STATS: '/v1/inventory/stats',
  INVENTORY_TABS: (id: string) => `/v1/inventory/${id}/tabs`,
};

// Inventory API service
export const useInventoryApi = () => {
  const { apiCall } = useApiCall();

  // Create inventory item with warehouse assignment - supports complete field set
  const createInventoryItem = async (inventoryData: any) => {
    // Check if we have a file upload
    const hasFile = inventoryData.inventoryImage && inventoryData.inventoryImage instanceof File;
    
    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.keys(inventoryData).forEach(key => {
        if (inventoryData[key] !== null && inventoryData[key] !== undefined) {
          if (key === 'inventoryImage' && inventoryData[key] instanceof File) {
            formData.append(key, inventoryData[key]);
          } else {
            formData.append(key, inventoryData[key].toString());
          }
        }
      });

      // Add calculated fields
      const quantity = inventoryData.quantity || parseInt(inventoryData.numberOfStock) || 0;
      const unitPrice = inventoryData.unitPrice || parseFloat(inventoryData.price) || 0;
      formData.append('quantity', quantity.toString());
      formData.append('unitPrice', unitPrice.toString());
      formData.append('totalValue', (quantity * unitPrice).toString());

      console.log('Creating inventory with FormData (file upload)');

      return await apiCall({
        endpoint: INVENTORY_ENDPOINTS.INVENTORY_CREATE,
        method: 'post',
        data: formData,
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        successMessage: 'Inventory item created successfully',
      });
    } else {
      // Use JSON for non-file uploads
      const payload = {
        ...inventoryData,
        warehouseId: inventoryData.warehouseId,
        quantity: inventoryData.quantity || parseInt(inventoryData.numberOfStock) || 0,
        unitPrice: inventoryData.unitPrice || parseFloat(inventoryData.price) || 0,
        category: inventoryData.category || inventoryData.inventoryCategoryId,
        subCategory: inventoryData.subCategory || inventoryData.inventorySubCategoryId,
        totalValue: (inventoryData.quantity || parseInt(inventoryData.numberOfStock) || 0) *
                    (inventoryData.unitPrice || parseFloat(inventoryData.price) || 0),
        status: inventoryData.status || inventoryData.class || 'active',
        createdAt: new Date().toISOString(),
      };

      console.log('Creating inventory with JSON payload (no file):', payload);

      return await apiCall({
        endpoint: INVENTORY_ENDPOINTS.INVENTORY_CREATE,
        method: 'post',
        data: payload,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        successMessage: 'Inventory item created successfully',
      });
    }
  };

  // Create inventory batch
  const createInventoryBatch = async (batchData: any) => {
    return await apiCall({
      endpoint: INVENTORY_ENDPOINTS.INVENTORY_BATCH_CREATE,
      method: 'post',
      data: batchData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      successMessage: 'Inventory batch created successfully',
    });
  };

  // Create inventory category
  const createInventoryCategory = async (categoryData: any) => {
    return await apiCall({
      endpoint: INVENTORY_ENDPOINTS.INVENTORY_CATEGORY_CREATE,
      method: 'post',
      data: categoryData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      successMessage: 'Inventory category created successfully',
    });
  };

  return {
    createInventoryItem,
    createInventoryBatch,
    createInventoryCategory,
  };
};

// Data fetching hooks using SWR
export const useInventory = (revalidate = true) => {
  const result = useGetRequest(INVENTORY_ENDPOINTS.INVENTORY, revalidate);
  
  // Handle different API response structures
  const processedData = result.data ?
    (Array.isArray(result.data) ? result.data :
     Array.isArray(result.data.inventories) ? result.data.inventories :
     Array.isArray(result.data.data) ? result.data.data :
     Array.isArray(result.data.inventory) ? result.data.inventory : []) : [];
  
  return {
    ...result,
    data: processedData
  };
};

export const useInventoryById = (id: string | null, revalidate = true) => {
  return useGetRequest(
    id ? INVENTORY_ENDPOINTS.INVENTORY_BY_ID(id) : null,
    revalidate
  );
};

export const useInventoryBatch = (id: string | null, revalidate = true) => {
  return useGetRequest(
    id ? INVENTORY_ENDPOINTS.INVENTORY_BATCH_BY_ID(id) : null,
    revalidate
  );
};

export const useInventoryStats = (revalidate = true) => {
  return useGetRequest(INVENTORY_ENDPOINTS.INVENTORY_STATS, revalidate);
};

export const useInventoryCategories = (revalidate = true) => {
  const result = useGetRequest(INVENTORY_ENDPOINTS.INVENTORY_CATEGORIES, revalidate);
  
  // Handle different API response structures
  const processedData = result.data ? 
    (Array.isArray(result.data) ? result.data : 
     Array.isArray(result.data.data) ? result.data.data :
     Array.isArray(result.data.categories) ? result.data.categories : []) : [];
  
  return {
    ...result,
    data: processedData
  };
};

export const useInventoryTabs = (id: string | null, revalidate = true) => {
  return useGetRequest(
    id ? INVENTORY_ENDPOINTS.INVENTORY_TABS(id) : null,
    revalidate
  );
};

// Warehouse-specific inventory hooks
export const useWarehouseInventory = (warehouseId: string | null, revalidate = true) => {
  const result = useGetRequest(
    warehouseId ? `${INVENTORY_ENDPOINTS.INVENTORY}?warehouseId=${warehouseId}` : null,
    revalidate
  );
  
  // Handle different API response structures
  const processedData = result.data ?
    (Array.isArray(result.data) ? result.data :
     Array.isArray(result.data.data) ? result.data.data :
     Array.isArray(result.data.inventory) ? result.data.inventory : []) : [];
  
  return {
    ...result,
    data: processedData
  };
};

// Search and filter hooks
export const useSearchInventory = (searchTerm: string, revalidate = true) => {
  return useGetRequest(
    searchTerm ? `${INVENTORY_ENDPOINTS.INVENTORY}?search=${encodeURIComponent(searchTerm)}` : null,
    revalidate
  );
};

export const useFilteredInventory = (filters: { category?: string; status?: string; warehouseId?: string }, revalidate = true) => {
  const queryParams = new URLSearchParams();
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.warehouseId) queryParams.append('warehouseId', filters.warehouseId);
  
  const queryString = queryParams.toString();
  return useGetRequest(
    queryString ? `${INVENTORY_ENDPOINTS.INVENTORY}?${queryString}` : INVENTORY_ENDPOINTS.INVENTORY,
    revalidate
  );
};

// Pagination hooks
export const usePaginatedInventory = (page: number, limit: number = 10, revalidate = true) => {
  const result = useGetRequest(
    `${INVENTORY_ENDPOINTS.INVENTORY}?page=${page}&limit=${limit}`,
    revalidate
  );
  
  // Handle different API response structures
  const processedData = result.data ? 
    (Array.isArray(result.data) ? result.data : 
     Array.isArray(result.data.data) ? result.data.data :
     Array.isArray(result.data.inventory) ? result.data.inventory : []) : [];
  
  return {
    ...result,
    data: processedData
  };
};