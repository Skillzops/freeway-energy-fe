import React, { createContext, useContext, ReactNode } from 'react';
import type { Warehouse } from '../data/warehouseData';
import { useMockWarehouses, useMockWarehouseApi } from '../services/mockWarehouseApi';
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
  // Use mock API while waiting for real endpoints
  const { data: warehouses = [], isLoading, error, mutate } = useMockWarehouses();
  
  // Get mock API functions
  const {
    createWarehouse,
    updateWarehouse: updateWarehouseApi,
    deleteWarehouse: deleteWarehouseApi,
    toggleWarehouseStatus: toggleWarehouseStatusApi,
  } = useMockWarehouseApi();

  const addWarehouse = async (warehouse: Omit<Warehouse, 'id'>) => {
    try {
      const response = await createWarehouse(warehouse);
      // Revalidate the data after successful creation
      await mutate();
      toast.success(response.message || 'Warehouse created successfully');
    } catch (error: any) {
      console.error('Failed to create warehouse:', error);
      toast.error(error.response?.data?.message || 'Failed to create warehouse');
    }
  };

  const updateWarehouse = async (id: string, updates: Partial<Warehouse>) => {
    try {
      const response = await updateWarehouseApi(id, updates);
      // Revalidate the data after successful update
      await mutate();
      toast.success(response.message || 'Warehouse updated successfully');
    } catch (error: any) {
      console.error('Failed to update warehouse:', error);
      toast.error(error.response?.data?.message || 'Failed to update warehouse');
    }
  };

  const deleteWarehouse = async (id: string) => {
    try {
      const response = await deleteWarehouseApi(id);
      // Revalidate the data after successful deletion
      await mutate();
      toast.success(response.message || 'Warehouse deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete warehouse:', error);
      toast.error(error.response?.data?.message || 'Failed to delete warehouse');
    }
  };

  const toggleWarehouseStatus = async (id: string) => {
    try {
      const warehouse = warehouses.find((w: Warehouse) => w.id === id);
      if (warehouse) {
        const response = await toggleWarehouseStatusApi(id, !warehouse.isActive);
        // Revalidate the data after successful status toggle
        await mutate();
        toast.success(response.message || `Warehouse ${!warehouse.isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Failed to toggle warehouse status:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle warehouse status');
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