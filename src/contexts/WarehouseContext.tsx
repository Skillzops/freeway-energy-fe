import React, { createContext, useContext, ReactNode } from 'react';
import type { Warehouse } from '../data/warehouseData';
import { useWarehouses, useWarehouseApi } from '../services/warehouseApi';
import { toast } from 'react-toastify';

interface WarehouseContextType {
  warehouses: Warehouse[];
  isLoading: boolean;
  error: any;
  mutate: () => void;
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => Promise<void>;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  toggleWarehouseStatus: (id: string) => Promise<void>;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export function WarehouseProvider({ children }: { children: ReactNode }) {
  // Use real API endpoints
  const { data: warehouses = [], isLoading, error, mutate } = useWarehouses();
  
  // Get real API functions
  const {
    createWarehouse,
    updateWarehouse: updateWarehouseApi,
    deleteWarehouse: deleteWarehouseApi,
    toggleWarehouseStatus: toggleWarehouseStatusApi,
  } = useWarehouseApi();

  const addWarehouse = async (warehouse: Omit<Warehouse, 'id'>) => {
    try {
      await createWarehouse(warehouse);
      // Revalidate the data after successful creation
      await mutate();
    } catch (error: any) {
      console.error('Failed to create warehouse:', error);
      throw error; // Let the API service handle the toast messages
    }
  };

  const updateWarehouse = async (id: string, updates: Partial<Warehouse>) => {
    try {
      await updateWarehouseApi(id, updates);
      // Revalidate the data after successful update
      await mutate();
    } catch (error: any) {
      console.error('Failed to update warehouse:', error);
      throw error; // Let the API service handle the toast messages
    }
  };

  const deleteWarehouse = async (id: string) => {
    try {
      await deleteWarehouseApi(id);
      // Revalidate the data after successful deletion
      await mutate();
    } catch (error: any) {
      console.error('Failed to delete warehouse:', error);
      throw error; // Let the API service handle the toast messages
    }
  };

  const toggleWarehouseStatus = async (id: string) => {
    try {
      const warehouse = warehouses.find((w: Warehouse) => w.id === id);
      if (warehouse) {
        await toggleWarehouseStatusApi(id, !warehouse.isActive);
        // Revalidate the data after successful status toggle
        await mutate();
      }
    } catch (error: any) {
      console.error('Failed to toggle warehouse status:', error);
      throw error; // Let the API service handle the toast messages
    }
  };

  return (
    <WarehouseContext.Provider value={{
      warehouses,
      isLoading,
      error,
      mutate,
      addWarehouse,
      updateWarehouse,
      deleteWarehouse,
      toggleWarehouseStatus,
    }}>
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouse() {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
}