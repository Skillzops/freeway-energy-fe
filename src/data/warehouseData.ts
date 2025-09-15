export interface Product {
  id: string;
  name: string;
  category: 'solar' | 'battery' | 'inverter' | 'accessory';
  salePrice: number;
  inventoryValue: number;
  stockLevel: number;
  maxCapacity: number;
  status: 'regular' | 'returned' | 'refurbished';
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  totalItems: number;
  totalValue: number;
  isMainWarehouse: boolean;
  image: string;
  isActive?: boolean;
  managers?: WarehouseManager[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseManager {
  id: string;
  userId: string;
  warehouseId: string;
  createdAt: string;
  user?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    status: string;
  };
}

export interface WarehouseStats {
  totalWarehouses: number;
  activeWarehouses: number;
  inactiveWarehouses: number;
  mainWarehouses: number;
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  pendingTransfers: number;
  fulfilledTransfers: number;
  rejectedTransfers: number;
}

export interface TransferRequest {
  id: string;
  fromWarehouse: string;
  toWarehouse: string;
  productId: string;
  requestedQuantity: number;
  fulfilledQuantity: number;
  status: 'pending' | 'partial' | 'fulfilled' | 'rejected';
  requestDate: string;
  fulfilledDate?: string;
  rejectedDate?: string;
  notes?: string;
  rejectionReason?: string;
  requestedBy?: string;
  fulfilledBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Mock data removed - now using real APIs