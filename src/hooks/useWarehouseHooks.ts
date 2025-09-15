import { useState, useEffect, useCallback } from 'react';
import { useWarehouseApi, useWarehouses, useProducts, useTransferRequests, useWarehouseStats, useWarehouseManagers } from '../services/warehouseApi';
import { useInventory } from '../services/inventoryApi';
import { toast } from 'react-toastify';
import type { Warehouse, Product, TransferRequest } from '../data/warehouseData';

// Export the useWarehouseManagers hook for external use
export { useWarehouseManagers } from '../services/warehouseApi';

// Real-time warehouse management hook
export const useWarehouseManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: warehouses = [], mutate: mutateWarehouses } = useWarehouses();
  const warehouseApi = useWarehouseApi();

  // Search functionality
  const filteredWarehouses = warehouses.filter((warehouse: Warehouse) =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredWarehouses.length / pageSize);
  const paginatedWarehouses = filteredWarehouses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const createWarehouse = async (warehouseData: Omit<Warehouse, 'id'>) => {
    setIsLoading(true);
    try {
      await warehouseApi.createWarehouse(warehouseData);
      await mutateWarehouses(); // Refresh data
      toast.success('Warehouse created successfully');
    } catch (error) {
      toast.error('Failed to create warehouse');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWarehouse = async (id: string, updates: Partial<Warehouse>) => {
    setIsLoading(true);
    try {
      await warehouseApi.updateWarehouse(id, updates);
      await mutateWarehouses(); // Refresh data
      toast.success('Warehouse updated successfully');
    } catch (error) {
      toast.error('Failed to update warehouse');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWarehouse = async (id: string) => {
    setIsLoading(true);
    try {
      await warehouseApi.deleteWarehouse(id);
      await mutateWarehouses(); // Refresh data
      toast.success('Warehouse deleted successfully');
    } catch (error) {
      toast.error('Failed to delete warehouse');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWarehouseStatus = async (id: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      await warehouseApi.toggleWarehouseStatus(id, isActive);
      await mutateWarehouses(); // Refresh data
      toast.success(`Warehouse ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update warehouse status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const activateWarehouse = async (id: string) => {
    setIsLoading(true);
    try {
      await warehouseApi.activateWarehouse(id);
      await mutateWarehouses(); // Refresh data
      toast.success('Warehouse activated successfully');
    } catch (error) {
      toast.error('Failed to activate warehouse');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateWarehouse = async (id: string) => {
    setIsLoading(true);
    try {
      await warehouseApi.deactivateWarehouse(id);
      await mutateWarehouses(); // Refresh data
      toast.success('Warehouse deactivated successfully');
    } catch (error) {
      toast.error('Failed to deactivate warehouse');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    warehouses: paginatedWarehouses,
    allWarehouses: warehouses,
    isLoading,
    searchTerm,
    currentPage,
    totalPages,
    pageSize,
    handleSearch,
    handlePageChange,
    setPageSize,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    toggleWarehouseStatus,
    activateWarehouse,
    deactivateWarehouse,
    refreshData: mutateWarehouses,
  };
};

// Real-time inventory management hook
export const useInventoryManagement = (warehouseId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: products = [], mutate: mutateProducts } = useInventory();
  const warehouseApi = useWarehouseApi();

  // Filter products based on search and filters
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesStatus = !statusFilter || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate inventory metrics
  const inventoryMetrics = {
    totalItems: products.reduce((sum: number, product: Product) => sum + product.stockLevel, 0),
    totalValue: products.reduce((sum: number, product: Product) => sum + product.inventoryValue, 0),
    lowStockItems: products.filter((product: Product) => (product.stockLevel / product.maxCapacity) < 0.3).length,
    categories: [...new Set(products.map((product: Product) => product.category))],
  };

  const addInventoryItem = async (inventoryData: any) => {
    if (!warehouseId) {
      toast.error('Warehouse ID is required');
      return;
    }

    setIsLoading(true);
    try {
      await warehouseApi.addInventoryItem(warehouseId, inventoryData);
      await mutateProducts(); // Refresh data
      toast.success('Inventory item added successfully');
    } catch (error) {
      toast.error('Failed to add inventory item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInventoryItem = async (itemId: string, updates: any) => {
    if (!warehouseId) {
      toast.error('Warehouse ID is required');
      return;
    }

    setIsLoading(true);
    try {
      await warehouseApi.updateInventoryItem(warehouseId, itemId, updates);
      await mutateProducts(); // Refresh data
      toast.success('Inventory item updated successfully');
    } catch (error) {
      toast.error('Failed to update inventory item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInventoryItem = async (itemId: string) => {
    if (!warehouseId) {
      toast.error('Warehouse ID is required');
      return;
    }

    setIsLoading(true);
    try {
      await warehouseApi.deleteInventoryItem(warehouseId, itemId);
      await mutateProducts(); // Refresh data
      toast.success('Inventory item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete inventory item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products: filteredProducts,
    allProducts: products,
    inventoryMetrics,
    isLoading,
    searchTerm,
    categoryFilter,
    statusFilter,
    setSearchTerm,
    setCategoryFilter,
    setStatusFilter,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    refreshData: mutateProducts,
  };
};

// Real-time transfer management hook
export const useTransferManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  const { data: transfers = [], mutate: mutateTransfers } = useTransferRequests();
  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [] } = useInventory();
  const warehouseApi = useWarehouseApi();

  // Filter transfers
  const filteredTransfers = transfers.filter((transfer: TransferRequest) => {
    const matchesStatus = !statusFilter || transfer.status === statusFilter;
    const matchesWarehouse = !warehouseFilter || 
      transfer.fromWarehouse === warehouseFilter || 
      transfer.toWarehouse === warehouseFilter;
    return matchesStatus && matchesWarehouse;
  });

  // Calculate transfer metrics
  const transferMetrics = {
    total: transfers.length,
    pending: transfers.filter((t: TransferRequest) => t.status === 'pending').length,
    partial: transfers.filter((t: TransferRequest) => t.status === 'partial').length,
    fulfilled: transfers.filter((t: TransferRequest) => t.status === 'fulfilled').length,
    rejected: transfers.filter((t: TransferRequest) => t.status === 'rejected').length,
  };

  const createTransferRequest = async (transferData: Omit<TransferRequest, 'id' | 'requestDate' | 'fulfilledQuantity' | 'status'>) => {
    setIsLoading(true);
    try {
      await warehouseApi.createTransferRequest(transferData);
      await mutateTransfers(); // Refresh data
      toast.success('Transfer request created successfully');
    } catch (error) {
      toast.error('Failed to create transfer request');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fulfillTransferRequest = async (id: string, quantity?: number, notes?: string) => {
    setIsLoading(true);
    try {
      await warehouseApi.fulfillTransferRequest(id, quantity, notes);
      await mutateTransfers(); // Refresh data
      toast.success('Transfer request fulfilled successfully');
    } catch (error) {
      toast.error('Failed to fulfill transfer request');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectTransferRequest = async (id: string, reason?: string) => {
    setIsLoading(true);
    try {
      await warehouseApi.rejectTransferRequest(id, reason);
      await mutateTransfers(); // Refresh data
      toast.success('Transfer request rejected successfully');
    } catch (error) {
      toast.error('Failed to reject transfer request');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransferRequest = async (id: string, updates: Partial<TransferRequest>) => {
    setIsLoading(true);
    try {
      await warehouseApi.updateTransferRequest(id, updates);
      await mutateTransfers(); // Refresh data
      toast.success('Transfer request updated successfully');
    } catch (error) {
      toast.error('Failed to update transfer request');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getWarehouseName = (id: string) => {
    return warehouses.find((w: any) => w.id === id)?.name || 'Unknown Warehouse';
  };

  const getProductName = (id: string) => {
    return products.find((p: any) => p.id === id)?.name || 'Unknown Product';
  };

  return {
    transfers: filteredTransfers,
    allTransfers: transfers,
    transferMetrics,
    warehouses,
    products,
    isLoading,
    statusFilter,
    warehouseFilter,
    setStatusFilter,
    setWarehouseFilter,
    createTransferRequest,
    fulfillTransferRequest,
    rejectTransferRequest,
    updateTransferRequest,
    getWarehouseName,
    getProductName,
    refreshData: mutateTransfers,
  };
};

// Real-time dashboard metrics hook
export const useDashboardMetrics = () => {
  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();
  const { data: products = [], isLoading: productsLoading } = useInventory();
  const { data: transfers = [], isLoading: transfersLoading } = useTransferRequests();
  const { data: stats, isLoading: statsLoading } = useWarehouseStats();

  const isLoading = warehousesLoading || productsLoading || transfersLoading || statsLoading;

  // Use API stats if available, otherwise calculate from local data
  const metrics = stats || {
    warehouses: {
      total: warehouses.length,
      active: warehouses.filter((w: Warehouse) => w.isActive).length,
      inactive: warehouses.filter((w: Warehouse) => !w.isActive).length,
      mainWarehouses: warehouses.filter((w: Warehouse) => w.isMainWarehouse).length,
    },
    inventory: {
      totalItems: products.reduce((sum: number, product: Product) => sum + product.stockLevel, 0),
      totalValue: products.reduce((sum: number, product: Product) => sum + product.inventoryValue, 0),
      lowStockItems: products.filter((product: Product) => (product.stockLevel / product.maxCapacity) < 0.3).length,
      categories: [...new Set(products.map((product: Product) => product.category))].length,
    },
    transfers: {
      total: transfers.length,
      pending: transfers.filter((t: TransferRequest) => t.status === 'pending').length,
      partial: transfers.filter((t: TransferRequest) => t.status === 'partial').length,
      fulfilled: transfers.filter((t: TransferRequest) => t.status === 'fulfilled').length,
      rejected: transfers.filter((t: TransferRequest) => t.status === 'rejected').length,
    },
  };

  // Calculate trends (this would typically come from historical data)
  const trends = {
    warehousesGrowth: '+5%',
    inventoryGrowth: '+12%',
    transfersGrowth: '+8%',
    valueGrowth: '+15%',
  };

  return {
    metrics,
    trends,
    isLoading,
    warehouses: warehouses.slice(0, 6), // Show only first 6 for dashboard
    recentTransfers: transfers.slice(0, 5), // Show only recent 5 transfers
  };
};

// Real-time notifications hook
export const useWarehouseNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { data: transfers = [] } = useTransferRequests();
  const { data: products = [] } = useInventory();

  useEffect(() => {
    const newNotifications = [];

    // Check for pending transfer requests
    const pendingTransfers = transfers.filter((t: TransferRequest) => t.status === 'pending');
    if (pendingTransfers.length > 0) {
      newNotifications.push({
        id: 'pending-transfers',
        type: 'warning',
        title: 'Pending Transfer Requests',
        message: `You have ${pendingTransfers.length} pending transfer requests`,
        action: '/transfers',
      });
    }

    // Check for low stock items
    const lowStockItems = products.filter((product: Product) => (product.stockLevel / product.maxCapacity) < 0.3);
    if (lowStockItems.length > 0) {
      newNotifications.push({
        id: 'low-stock',
        type: 'error',
        title: 'Low Stock Alert',
        message: `${lowStockItems.length} items are running low on stock`,
        action: '/inventory',
      });
    }

    // Check for partial fulfillments
    const partialTransfers = transfers.filter((t: TransferRequest) => t.status === 'partial');
    if (partialTransfers.length > 0) {
      newNotifications.push({
        id: 'partial-transfers',
        type: 'info',
        title: 'Partial Fulfillments',
        message: `${partialTransfers.length} transfer requests are partially fulfilled`,
        action: '/transfers',
      });
    }

    setNotifications(newNotifications);
  }, [transfers, products]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    dismissNotification,
    hasNotifications: notifications.length > 0,
  };
};

// Bulk operations hook
export const useBulkOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const warehouseApi = useWarehouseApi();

  const selectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAll = (items: any[]) => {
    setSelectedItems(items.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const bulkUpdateWarehouseStatus = async (warehouseIds: string[], isActive: boolean) => {
    setIsLoading(true);
    try {
      await Promise.all(
        warehouseIds.map(id => warehouseApi.toggleWarehouseStatus(id, isActive))
      );
      toast.success(`${warehouseIds.length} warehouses updated successfully`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to update warehouses');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeleteWarehouses = async (warehouseIds: string[]) => {
    setIsLoading(true);
    try {
      await Promise.all(
        warehouseIds.map(id => warehouseApi.deleteWarehouse(id))
      );
      toast.success(`${warehouseIds.length} warehouses deleted successfully`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to delete warehouses');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedItems,
    isLoading,
    selectItem,
    selectAll,
    clearSelection,
    bulkUpdateWarehouseStatus,
    bulkDeleteWarehouses,
    hasSelection: selectedItems.length > 0,
  };
};

// Export functionality hook
// Warehouse manager operations hook
export const useWarehouseManagerOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const warehouseApi = useWarehouseApi();

  const assignManagers = async (warehouseId: string, userIds: string[]) => {
    setIsLoading(true);
    try {
      await warehouseApi.assignWarehouseManagers(warehouseId, userIds);
      toast.success('Warehouse managers assigned successfully');
    } catch (error) {
      toast.error('Failed to assign warehouse managers');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unassignManager = async (managerId: string) => {
    setIsLoading(true);
    try {
      await warehouseApi.unassignWarehouseManager(managerId);
      toast.success('Warehouse manager unassigned successfully');
    } catch (error) {
      toast.error('Failed to unassign warehouse manager');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    assignManagers,
    unassignManager,
  };
};

export const useWarehouseExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportWarehouses = async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    setIsExporting(true);
    try {
      // This would typically call an API endpoint that generates the export
      const response = await fetch(`/v1/warehouses/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `warehouses-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Export completed successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast.error('Failed to export data');
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const exportInventory = async (warehouseId: string, format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    setIsExporting(true);
    try {
      const response = await fetch(`/v1/warehouses/${warehouseId}/inventory/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${warehouseId}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Inventory export completed successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast.error('Failed to export inventory');
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportWarehouses,
    exportInventory,
  };
};