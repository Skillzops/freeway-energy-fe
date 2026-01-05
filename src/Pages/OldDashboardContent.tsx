import React from "react";
import PageLayout from "./PageLayout";
import { MetricCard } from "@/Components/WareHouses/MetricCard";
import { WarehouseCard } from "@/Components/WareHouses/WarehouseCard";
import { useWarehouse } from "../contexts/WarehouseContext";
import { useWarehouseStats, useTransferRequests } from "../services/warehouseApi";
import { useInventory } from "../services/inventoryApi";
import { Link } from "react-router-dom";
import dashboardbadge from "@/assets/dashboard/dashboardbadge.svg";

// Icons
const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16.5 9.4L7.55 4.24C7.21 4.07 6.79 4.07 6.45 4.24L2.5 6.5v11l4 2.26c.34.17.76.17 1.1 0L16.5 15.5V4.24z" />
  </svg>
);

const WarehouseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
  </svg>
);

const ArrowLeftRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3L4 7l4 4" />
    <path d="m4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const OldDashboardContent = () => {
  const { warehouses, isLoading } = useWarehouse();
  const { data: stats, isLoading: statsLoading } = useWarehouseStats();
  const { data: transferRequests = [] } = useTransferRequests();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalItems = stats?.totalItems || warehouses.reduce((sum, warehouse) => sum + warehouse.totalItems, 0);
  const totalValue = stats?.totalValue || warehouses.reduce((sum, warehouse) => sum + warehouse.totalValue, 0);
  const pendingRequests = transferRequests.filter((req: any) => req.status === 'pending').length;

  return (
    <PageLayout pageName="Dashboard" badge={dashboardbadge}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-textBlack">Dashboard</h1>
            <p className="text-textDarkGrey">Overview of your warehouse operations</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Inventory Items"
            value={statsLoading ? "..." : totalItems.toLocaleString()}
            icon={<PackageIcon />}
            trend={{ value: "+12% from last month", isPositive: true }}
          />
          <MetricCard
            title="Total Warehouses"
            value={isLoading ? "..." : warehouses.length}
            icon={<WarehouseIcon />}
          />
          <MetricCard
            title="Pending Transfers"
            value={pendingRequests}
            icon={<ArrowLeftRightIcon />}
            trend={{ value: `${transferRequests.length} total requests`, isPositive: true }}
          />
          <MetricCard
            title="Total Inventory Value"
            value={statsLoading ? "..." : formatCurrency(totalValue)}
            icon={<TrendingUpIcon />}
            trend={{ value: "+8% from last month", isPositive: true }}
          />
        </div>

        {/* Warehouses */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-textBlack">Warehouses</h2>
            <Link
              to="/warehouses"
              className="border border-strokeGreyThree text-textBlack py-2 px-4 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <PlusIcon />
              View All Warehouses
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warehouses.slice(0, 3).map((warehouse) => (
                <WarehouseCard key={warehouse.id} warehouse={warehouse} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default OldDashboardContent;
