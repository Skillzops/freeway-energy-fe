import React, { useState } from "react";
import PageLayout from "./PageLayout";
import { MetricCard } from "../Components/WareHouses/MetricCard";
import { WarehouseCard } from "../Components/WareHouses/WarehouseCard";
import { PaginationInfo } from "../Components/WareHouses/PaginationInfo";
import { NewWarehouseModal } from "../Components/WareHouses/NewWarehouseModal";
import { useWarehouse } from "../contexts/WarehouseContext";
import { useMockWarehouseMetrics } from "../services/mockWarehouseApi";
import useBreakpoint from "../hooks/useBreakpoint";
import warehouseBadge from "../assets/inventory/inventorybadge.png";

// Icons (you may need to adjust these based on your icon system)
const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16.5 9.4L7.55 4.24C7.21 4.07 6.79 4.07 6.45 4.24L2.5 6.5v11l4 2.26c.34.17.76.17 1.1 0L16.5 15.5V4.24z"/>
    <path d="M7.5 4.21v15.58"/>
    <path d="M16.5 9.4v6.1"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const WarehouseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18"/>
    <path d="M5 21V7l8-4v18"/>
    <path d="M19 21V11l-6-4"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default function Warehouses() {
  const [newWarehouseOpen, setNewWarehouseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { warehouses, isLoading, error } = useWarehouse();
  const { data: metrics, isLoading: metricsLoading } = useMockWarehouseMetrics();
  const isMobile = useBreakpoint("max", 640);
  
  // Calculate totals from warehouses data
  const totalItems = warehouses.reduce((sum, warehouse) => sum + warehouse.totalItems, 0);
  const totalValue = warehouses.reduce((sum, warehouse) => sum + warehouse.totalValue, 0);
  
  // Use metrics from API if available, otherwise calculate from warehouses
  const warehouseCount = metrics?.totalWarehouses || warehouses.length;
  const totalInventoryItems = metrics?.totalItems || totalItems;
  const totalInventoryValue = metrics?.totalValue || totalValue;

  // Filter warehouses based on search
  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageLayout pageName="Warehouses" badge={warehouseBadge}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textDarkGrey">Loading warehouses...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageLayout pageName="Warehouses" badge={warehouseBadge}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-errorTwo mb-4">Failed to load warehouses</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="Warehouses" badge={warehouseBadge} className="w-full px-2 py-8 md:p-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-textBlack">Warehouses</h1>
            <p className="text-textDarkGrey text-sm sm:text-base">Manage your warehouse network</p>
          </div>
          <button
            onClick={() => setNewWarehouseOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <PlusIcon />
            {isMobile ? "New" : "New Warehouse"}
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="All Warehouses"
            value={metricsLoading ? "..." : warehouseCount}
            icon={<WarehouseIcon />}
          />
          <MetricCard
            title="Total Items"
            value={metricsLoading ? "..." : totalInventoryItems.toLocaleString()}
            icon={<PackageIcon />}
          />
          <MetricCard
            title="Total Value"
            value={metricsLoading ? "..." : formatCurrency(totalInventoryValue)}
            icon={<TrendingUpIcon />}
          />
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              
              <input 
                placeholder="Search warehouses..." 
                className="pl-10 pr-4 py-2 border border-strokeGreyThree rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textDarkGrey">
                <SearchIcon />
              </div>
            </div>
          </div>
          <button className="border border-strokeGreyThree text-textBlack py-2 px-4 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <FilterIcon />
            Filters
          </button>
          <button className="border border-strokeGreyThree text-textBlack py-2 px-4 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <RefreshIcon />
            Refresh Table
          </button>
        </div>

        {/* Warehouses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-textDarkGrey mb-4">
                {searchTerm ? "No warehouses match your search" : "No warehouses found"}
              </p>
              <button
                onClick={() => setNewWarehouseOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
              >
                Create Your First Warehouse
              </button>
            </div>
          ) : (
            filteredWarehouses.map((warehouse) => (
              <WarehouseCard key={warehouse.id} warehouse={warehouse} />
            ))
          )}
        </div>

        {filteredWarehouses.length > 0 && (
          <PaginationInfo
            currentPage={1}
            totalPages={Math.ceil(filteredWarehouses.length / 6)}
            itemsPerPage={6}
            totalItems={filteredWarehouses.length}
          />
        )}
        <NewWarehouseModal
          open={newWarehouseOpen}
          onOpenChange={setNewWarehouseOpen}
        />
      </div>
    </PageLayout>
  );
}