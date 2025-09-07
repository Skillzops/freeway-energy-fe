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
  assignedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
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
  fulfilledQuantity?: number;
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

import mainWarehouseImg from '../assets/Images/logo.png';
import branchWarehouse1Img from '../assets/inventory/inventorybadge.png';
import branchWarehouse2Img from '../assets/products/productsbadge.png';

export const warehouses: Warehouse[] = [
  {
    id: 'main',
    name: 'Main Warehouse',
    location: 'Lagos, Nigeria',
    totalItems: 34,
    totalValue: 2456000,
    isMainWarehouse: true,
    image: mainWarehouseImg,
    isActive: true
  },
  {
    id: 'lagos-south',
    name: 'Lagos South Branch',
    location: 'Victoria Island, Lagos',
    totalItems: 12,
    totalValue: 890000,
    isMainWarehouse: false,
    image: branchWarehouse1Img,
    isActive: true
  },
  {
    id: 'abuja',
    name: 'Abuja Branch',
    location: 'Abuja, FCT',
    totalItems: 8,
    totalValue: 645000,
    isMainWarehouse: false,
    image: branchWarehouse2Img,
    isActive: true
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Solar Change - SF - 306',
    category: 'solar',
    salePrice: 68000,
    inventoryValue: 12240000,
    stockLevel: 180,
    maxCapacity: 180,
    status: 'regular'
  },
  {
    id: '2',
    name: 'Solar Change - SF - 315',
    category: 'solar',
    salePrice: 78000,
    inventoryValue: 145782000,
    stockLevel: 1869,
    maxCapacity: 1869,
    status: 'regular'
  },
  {
    id: '3',
    name: 'Solar Home System Fan | SE 26',
    category: 'accessory',
    salePrice: 136000,
    inventoryValue: 126072000,
    stockLevel: 927,
    maxCapacity: 927,
    status: 'regular'
  },
  {
    id: '4',
    name: 'Solar Change - SF - 316',
    category: 'solar',
    salePrice: 78000,
    inventoryValue: 78000,
    stockLevel: 1,
    maxCapacity: 1,
    status: 'regular'
  },
  {
    id: '5',
    name: 'Solar Change - SF - 317',
    category: 'solar',
    salePrice: 78000,
    inventoryValue: 78000,
    stockLevel: 1,
    maxCapacity: 1,
    status: 'regular'
  },
  {
    id: '6',
    name: 'Solar Change - SF - 318',
    category: 'solar',
    salePrice: 78000,
    inventoryValue: 78000,
    stockLevel: 1,
    maxCapacity: 1,
    status: 'regular'
  }
];

export const transferRequests: TransferRequest[] = [
  {
    id: 'tr-001',
    fromWarehouse: 'main',
    toWarehouse: 'lagos-south',
    productId: '1',
    requestedQuantity: 10,
    fulfilledQuantity: 8,
    status: 'partial',
    requestDate: '2025-01-15',
    notes: 'Urgent request for customer order'
  },
  {
    id: 'tr-002',
    fromWarehouse: 'main',
    toWarehouse: 'abuja',
    productId: '2',
    requestedQuantity: 5,
    fulfilledQuantity: 0,
    status: 'pending',
    requestDate: '2025-01-14'
  },
  {
    id: 'tr-003',
    fromWarehouse: 'main',
    toWarehouse: 'lagos-south',
    productId: '3',
    requestedQuantity: 15,
    fulfilledQuantity: 15,
    status: 'fulfilled',
    requestDate: '2025-01-13'
  }
];