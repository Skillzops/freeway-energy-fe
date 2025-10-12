import { useState } from "react";
import PageLayout from "./PageLayout";
import { MetricCard } from "@/Components/WareHouses/MetricCard";
import { WarehouseCard } from "@/Components/WareHouses/WarehouseCard";
import { PaginationInfo } from "@/Components/WareHouses/PaginationInfo";
import { NewWarehouseModal } from "@/Components/WareHouses/NewWarehouseModal";
import { useWarehouseStats } from "../services/warehouseApi";
import { useWarehouseManagement } from "../hooks/useWarehouseHooks";
import useBreakpoint from "../hooks/useBreakpoint";
import warehouseBadge from "@/assets/inventory/inventorybadge.png";

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
  const [showFilters, setShowFilters] = useState(false);

  // Use the warehouse management hook for filtering and pagination
  const {
    warehouses: filteredWarehouses,
    allWarehouses,
    isLoading,
    searchTerm,
    statusFilter,
    typeFilter,
    locationFilter,
    setStatusFilter,
    setTypeFilter,
    setLocationFilter,
    handleSearch,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    setPageSize,
    refreshData
  } = useWarehouseManagement();

  const { data: stats, isLoading: statsLoading } = useWarehouseStats();
  const isMobile = useBreakpoint("max", 640);

  // Ensure warehouses is always an array
  const warehousesArray = Array.isArray(allWarehouses) ? allWarehouses : [];

  // Calculate totals from warehouses data
  const totalItems = warehousesArray.reduce((sum, warehouse) => sum + warehouse.totalItems, 0);
  const totalValue = warehousesArray.reduce((sum, warehouse) => sum + warehouse.totalValue, 0);

  // Use stats from API if available, otherwise calculate from warehouses
  const warehouseCount = stats?.totalWarehouses || warehousesArray.length;
  const totalInventoryItems = stats?.totalItems || totalItems;
  const totalInventoryValue = stats?.totalValue || totalValue;

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
            className="bg-primaryGradient text-white px-6 py-3 rounded-full hover:opacity-90 transition-all flex items-center gap-2"
          >
            <PlusIcon />
            New Warehouse
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="All Warehouses"
            value={statsLoading ? "..." : warehouseCount}
            icon={<WarehouseIcon />}
          />
          <MetricCard
            title="Total Items"
            value={statsLoading ? "..." : totalInventoryItems.toLocaleString()}
            icon={<PackageIcon />}
          />
          <MetricCard
            title="Total Value"
            value={statsLoading ? "..." : formatCurrency(totalInventoryValue)}
            icon={<TrendingUpIcon />}
          />
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <input
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search warehouses..."
                  className="pl-10 pr-4 py-2 border border-strokeGreyThree rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textDarkGrey">
                  <SearchIcon />
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`border border-strokeGreyThree text-textBlack py-2 px-4 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                showFilters ? 'bg-primary/10 border-primary' : ''
              }`}
            >
              <FilterIcon />
              Filters
            </button>
            <button
              onClick={refreshData}
              className="border border-strokeGreyThree text-textBlack py-2 px-4 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <RefreshIcon />
              Refresh Table
            </button>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border border-strokeGreyThree">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-textBlack mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-textBlack mb-2">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">All Types</option>
                    <option value="main">Main Warehouse</option>
                    <option value="regular">Regular Warehouse</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-textBlack mb-2">Location</label>
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Filter by location..."
                    className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setTypeFilter('');
                    setLocationFilter('');
                    handleSearch('');
                  }}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Warehouses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-textDarkGrey">Loading warehouses...</p>
            </div>
          ) : filteredWarehouses.length === 0 && allWarehouses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-textDarkGrey mb-4">No warehouses found</p>
              <button
                onClick={() => setNewWarehouseOpen(true)}
                className="bg-primaryGradient text-white px-4 py-2 rounded-full hover:opacity-90 transition-all"
              >
                Create Your First Warehouse
              </button>
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-textDarkGrey mb-4">
                No warehouses match your current filters
              </p>
              <button
                onClick={() => {
                  setStatusFilter('');
                  setTypeFilter('');
                  setLocationFilter('');
                  handleSearch('');
                }}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredWarehouses.map((warehouse) => (
              <WarehouseCard key={warehouse.id} warehouse={warehouse} />
            ))
          )}
        </div>

        {filteredWarehouses.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <PaginationInfo
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={pageSize}
              totalItems={filteredWarehouses.length}
            />

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-textDarkGrey">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-strokeGreyThree rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              <span className="text-sm text-textDarkGrey">per page</span>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-strokeGreyThree rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded text-sm ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'border border-strokeGreyThree hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-strokeGreyThree rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
        <NewWarehouseModal
          open={newWarehouseOpen}
          onOpenChange={setNewWarehouseOpen}
        />
      </div>
    </PageLayout>
  );
}
