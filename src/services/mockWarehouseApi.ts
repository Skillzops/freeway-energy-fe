import { warehouses as mockWarehouses, products as mockProducts, transferRequests as mockTransferRequests } from '../data/warehouseData';
import type { Warehouse, Product, TransferRequest } from '../data/warehouseData';

// Simulate API delay
const simulateApiDelay = (min = 500, max = 1500) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Simulate API response format
const createApiResponse = <T>(data: T, success = true, message = 'Success') => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString(),
});

// Simulate API error
const createApiError = (message: string, code = 400) => {
  const error = new Error(message) as any;
  error.response = { status: code, data: { message } };
  return error;
};

// In-memory storage (simulates database)
class MockDatabase {
  private warehouses: Warehouse[] = [...mockWarehouses];
  private products: Product[] = [...mockProducts];
  private transferRequests: TransferRequest[] = [...mockTransferRequests];
  private nextWarehouseId = 4;
  private nextProductId = 7;
  private nextTransferId = 4;

  // Warehouse operations
  async getWarehouses(): Promise<Warehouse[]> {
    await simulateApiDelay();
    return [...this.warehouses];
  }

  async getWarehouse(id: string): Promise<Warehouse | null> {
    await simulateApiDelay();
    return this.warehouses.find(w => w.id === id) || null;
  }

  async createWarehouse(data: Omit<Warehouse, 'id'>): Promise<Warehouse> {
    await simulateApiDelay();
    
    if (!data.name || !data.location) {
      throw createApiError('Name and location are required', 400);
    }

    const newWarehouse: Warehouse = {
      ...data,
      id: `warehouse-${this.nextWarehouseId++}`,
    };

    this.warehouses.push(newWarehouse);
    return newWarehouse;
  }

  async updateWarehouse(id: string, updates: Partial<Warehouse>): Promise<Warehouse> {
    await simulateApiDelay();
    
    const index = this.warehouses.findIndex(w => w.id === id);
    if (index === -1) {
      throw createApiError('Warehouse not found', 404);
    }

    this.warehouses[index] = { ...this.warehouses[index], ...updates };
    return this.warehouses[index];
  }

  async deleteWarehouse(id: string): Promise<void> {
    await simulateApiDelay();
    
    const index = this.warehouses.findIndex(w => w.id === id);
    if (index === -1) {
      throw createApiError('Warehouse not found', 404);
    }

    this.warehouses.splice(index, 1);
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    await simulateApiDelay();
    return [...this.products];
  }

  async getWarehouseInventory(warehouseId: string): Promise<Product[]> {
    await simulateApiDelay();
    // In a real system, this would filter by warehouse
    return [...this.products];
  }

  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    await simulateApiDelay();
    
    if (!data.name || !data.category) {
      throw createApiError('Name and category are required', 400);
    }

    const newProduct: Product = {
      ...data,
      id: `product-${this.nextProductId++}`,
    };

    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await simulateApiDelay();
    
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw createApiError('Product not found', 404);
    }

    this.products[index] = { ...this.products[index], ...updates };
    return this.products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    await simulateApiDelay();
    
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw createApiError('Product not found', 404);
    }

    this.products.splice(index, 1);
  }

  // Transfer request operations
  async getTransferRequests(): Promise<TransferRequest[]> {
    await simulateApiDelay();
    return [...this.transferRequests];
  }

  async getWarehouseTransfers(warehouseId: string): Promise<TransferRequest[]> {
    await simulateApiDelay();
    return this.transferRequests.filter(
      req => req.fromWarehouse === warehouseId || req.toWarehouse === warehouseId
    );
  }

  async createTransferRequest(data: Omit<TransferRequest, 'id' | 'requestDate' | 'fulfilledQuantity' | 'status'>): Promise<TransferRequest> {
    await simulateApiDelay();
    
    if (!data.fromWarehouse || !data.toWarehouse || !data.productId) {
      throw createApiError('From warehouse, to warehouse, and product are required', 400);
    }

    const newTransfer: TransferRequest = {
      ...data,
      id: `tr-${String(this.nextTransferId++).padStart(3, '0')}`,
      requestDate: new Date().toISOString().split('T')[0],
      fulfilledQuantity: 0,
      status: 'pending',
    };

    this.transferRequests.push(newTransfer);
    return newTransfer;
  }

  async updateTransferRequest(id: string, updates: Partial<TransferRequest>): Promise<TransferRequest> {
    await simulateApiDelay();
    
    const index = this.transferRequests.findIndex(t => t.id === id);
    if (index === -1) {
      throw createApiError('Transfer request not found', 404);
    }

    this.transferRequests[index] = { ...this.transferRequests[index], ...updates };
    return this.transferRequests[index];
  }

  async fulfillTransferRequest(id: string, fulfilledQuantity: number, status: 'fulfilled' | 'partial' | 'rejected', notes?: string): Promise<TransferRequest> {
    await simulateApiDelay();
    
    const index = this.transferRequests.findIndex(t => t.id === id);
    if (index === -1) {
      throw createApiError('Transfer request not found', 404);
    }

    this.transferRequests[index] = {
      ...this.transferRequests[index],
      fulfilledQuantity,
      status,
      notes,
    };

    return this.transferRequests[index];
  }

  // Analytics operations
  async getWarehouseMetrics() {
    await simulateApiDelay();
    
    const totalItems = this.products.reduce((sum, product) => sum + product.stockLevel, 0);
    const totalValue = this.products.reduce((sum, product) => sum + product.inventoryValue, 0);
    const lowStockItems = this.products.filter(product => (product.stockLevel / product.maxCapacity) < 0.3);

    return {
      totalWarehouses: this.warehouses.length,
      activeWarehouses: this.warehouses.filter(w => w.isActive).length,
      totalItems,
      totalValue,
      lowStockItems: lowStockItems.length,
      pendingTransfers: this.transferRequests.filter(t => t.status === 'pending').length,
      partialTransfers: this.transferRequests.filter(t => t.status === 'partial').length,
      fulfilledTransfers: this.transferRequests.filter(t => t.status === 'fulfilled').length,
    };
  }
}

// Singleton instance
const mockDb = new MockDatabase();

// Mock API service that mimics real API calls
export const mockWarehouseApi = {
  // Warehouse operations
  async getWarehouses() {
    const data = await mockDb.getWarehouses();
    return createApiResponse(data);
  },

  async getWarehouse(id: string) {
    const data = await mockDb.getWarehouse(id);
    if (!data) {
      throw createApiError('Warehouse not found', 404);
    }
    return createApiResponse(data);
  },

  async createWarehouse(warehouseData: Omit<Warehouse, 'id'>) {
    const data = await mockDb.createWarehouse(warehouseData);
    return createApiResponse(data, true, 'Warehouse created successfully');
  },

  async updateWarehouse(id: string, updates: Partial<Warehouse>) {
    const data = await mockDb.updateWarehouse(id, updates);
    return createApiResponse(data, true, 'Warehouse updated successfully');
  },

  async deleteWarehouse(id: string) {
    await mockDb.deleteWarehouse(id);
    return createApiResponse(null, true, 'Warehouse deleted successfully');
  },

  async toggleWarehouseStatus(id: string, isActive: boolean) {
    const data = await mockDb.updateWarehouse(id, { isActive });
    return createApiResponse(data, true, `Warehouse ${isActive ? 'activated' : 'deactivated'} successfully`);
  },

  // Product operations
  async getProducts() {
    const data = await mockDb.getProducts();
    return createApiResponse(data);
  },

  async getWarehouseInventory(warehouseId: string) {
    const data = await mockDb.getWarehouseInventory(warehouseId);
    return createApiResponse(data);
  },

  async createProduct(productData: Omit<Product, 'id'>) {
    const data = await mockDb.createProduct(productData);
    return createApiResponse(data, true, 'Product created successfully');
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const data = await mockDb.updateProduct(id, updates);
    return createApiResponse(data, true, 'Product updated successfully');
  },

  async deleteProduct(id: string) {
    await mockDb.deleteProduct(id);
    return createApiResponse(null, true, 'Product deleted successfully');
  },

  // Transfer operations
  async getTransferRequests() {
    const data = await mockDb.getTransferRequests();
    return createApiResponse(data);
  },

  async getWarehouseTransfers(warehouseId: string) {
    const data = await mockDb.getWarehouseTransfers(warehouseId);
    return createApiResponse(data);
  },

  async createTransferRequest(transferData: Omit<TransferRequest, 'id' | 'requestDate' | 'fulfilledQuantity' | 'status'>) {
    const data = await mockDb.createTransferRequest(transferData);
    return createApiResponse(data, true, 'Transfer request created successfully');
  },

  async updateTransferRequest(id: string, updates: Partial<TransferRequest>) {
    const data = await mockDb.updateTransferRequest(id, updates);
    return createApiResponse(data, true, 'Transfer request updated successfully');
  },

  async fulfillTransferRequest(id: string, fulfilledQuantity: number, status: 'fulfilled' | 'partial' | 'rejected', notes?: string) {
    const data = await mockDb.fulfillTransferRequest(id, fulfilledQuantity, status, notes);
    return createApiResponse(data, true, 'Transfer request fulfilled successfully');
  },

  // Analytics operations
  async getWarehouseMetrics() {
    const data = await mockDb.getWarehouseMetrics();
    return createApiResponse(data);
  },

  // Inventory operations
  async addInventoryItem(warehouseId: string, inventoryData: any) {
    const productData = {
      name: inventoryData.name,
      category: inventoryData.category as 'solar' | 'battery' | 'inverter' | 'accessory',
      salePrice: inventoryData.salePrice,
      inventoryValue: inventoryData.inventoryValue,
      stockLevel: inventoryData.stockLevel,
      maxCapacity: inventoryData.maxCapacity,
      status: inventoryData.status as 'regular' | 'returned' | 'refurbished',
    };
    
    const data = await mockDb.createProduct(productData);
    return createApiResponse(data, true, 'Inventory item added successfully');
  },

  async updateInventoryItem(warehouseId: string, itemId: string, inventoryData: any) {
    const data = await mockDb.updateProduct(itemId, inventoryData);
    return createApiResponse(data, true, 'Inventory item updated successfully');
  },

  async deleteInventoryItem(warehouseId: string, itemId: string) {
    await mockDb.deleteProduct(itemId);
    return createApiResponse(null, true, 'Inventory item deleted successfully');
  },
};

// Mock WebSocket for real-time updates
export class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {};
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private url: string) {
    this.connect();
  }

  private connect() {
    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true;
      this.emit('open', {});
      console.log('Mock WebSocket connected to:', this.url);
      
      // Start sending periodic updates
      this.startPeriodicUpdates();
    }, 1000);
  }

  private startPeriodicUpdates() {
    // Simulate random warehouse events
    const events = [
      'warehouse_updated',
      'inventory_updated', 
      'transfer_created',
      'stock_alert'
    ];

    const sendRandomEvent = () => {
      if (this.isConnected) {
        const eventType = events[Math.floor(Math.random() * events.length)];
        const mockEvent = {
          type: eventType,
          data: {
            id: `mock-${Date.now()}`,
            message: `Mock ${eventType} event`,
            warehouseId: 'main',
          },
          timestamp: new Date().toISOString(),
        };

        this.emit('message', { data: JSON.stringify(mockEvent) });
      }
    };

    // Send events every 30-60 seconds
    setInterval(sendRandomEvent, Math.random() * 30000 + 30000);
  }

  addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  send(data: string) {
    if (this.isConnected) {
      console.log('Mock WebSocket sending:', data);
      // Echo back a confirmation
      setTimeout(() => {
        this.emit('message', { 
          data: JSON.stringify({ 
            type: 'confirmation', 
            message: 'Message received',
            original: JSON.parse(data)
          })
        });
      }, 100);
    }
  }

  close() {
    this.isConnected = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.emit('close', { code: 1000, reason: 'Normal closure' });
  }

  get readyState() {
    return this.isConnected ? 1 : 0; // 1 = OPEN, 0 = CONNECTING
  }
}

// Mock API service with realistic behavior
export const useMockWarehouseApi = () => {
  const createWarehouse = async (warehouseData: Omit<Warehouse, 'id'>) => {
    try {
      const response = await mockWarehouseApi.createWarehouse(warehouseData);
      return response;
    } catch (error) {
      console.error('Mock API Error:', error);
      throw error;
    }
  };

  const updateWarehouse = async (id: string, updates: Partial<Warehouse>) => {
    try {
      const response = await mockWarehouseApi.updateWarehouse(id, updates);
      return response;
    } catch (error) {
      console.error('Mock API Error:', error);
      throw error;
    }
  };

  const deleteWarehouse = async (id: string) => {
    try {
      const response = await mockWarehouseApi.deleteWarehouse(id);
      return response;
    } catch (error) {
      console.error('Mock API Error:', error);
      throw error;
    }
  };

  const toggleWarehouseStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await mockWarehouseApi.toggleWarehouseStatus(id, isActive);
      return response;
    } catch (error) {
      console.error('Mock API Error:', error);
      throw error;
    }
  };

  const createTransferRequest = async (transferData: Omit<TransferRequest, 'id' | 'requestDate' | 'fulfilledQuantity' | 'status'>) => {
    try {
      const response = await mockWarehouseApi.createTransferRequest(transferData);
      return response;
    } catch (error) {
      console.error('Mock API Error:', error);
      throw error;
    }
  };

  const fulfillTransferRequest = async (id: string, fulfilledQuantity: number, status: 'fulfilled' | 'partial' | 'rejected', notes?: string) => {
    try {
      const response = await mockWarehouseApi.fulfillTransferRequest(id, fulfilledQuantity, status, notes);
      return response;
    } catch (error) {
      console.error('Mock API Error:', error);
      throw error;
    }
  };

  const addInventoryItem = async (warehouseId: string, inventoryData: any) => {
    try {
      const response = await mockWarehouseApi.addInventoryItem(warehouseId, inventoryData);
      return response;
    } catch (error) {
      console.error('Mock API Error:', error);
      throw error;
    }
  };

  return {
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    toggleWarehouseStatus,
    createTransferRequest,
    fulfillTransferRequest,
    addInventoryItem,
  };
};

// Mock data fetching hooks
export const useMockWarehouses = () => {
  const [data, setData] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const mutate = async () => {
    setIsLoading(true);
    try {
      const response = await mockWarehouseApi.getWarehouses();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    mutate();
  }, []);

  return { data, isLoading, error, mutate };
};

export const useMockProducts = () => {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const mutate = async () => {
    setIsLoading(true);
    try {
      const response = await mockWarehouseApi.getProducts();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    mutate();
  }, []);

  return { data, isLoading, error, mutate };
};

export const useMockTransferRequests = () => {
  const [data, setData] = useState<TransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const mutate = async () => {
    setIsLoading(true);
    try {
      const response = await mockWarehouseApi.getTransferRequests();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    mutate();
  }, []);

  return { data, isLoading, error, mutate };
};

export const useMockWarehouseMetrics = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const mutate = async () => {
    setIsLoading(true);
    try {
      const response = await mockWarehouseApi.getWarehouseMetrics();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    mutate();
  }, []);

  return { data, isLoading, error, mutate };
};

// Import statement for React hooks
import { useState, useEffect } from 'react';