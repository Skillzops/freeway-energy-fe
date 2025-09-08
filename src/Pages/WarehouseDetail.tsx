import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageLayout from "./PageLayout";
import { MetricCard } from "../Components/WareHouses/MetricCard";
import { PaginationInfo } from "../Components/WareHouses/PaginationInfo";
import { NewInventoryModal } from "../Components/WareHouses/NewInventoryModal";
import { NewRequestModal } from "../Components/WareHouses/NewRequestModal";
import { FulfillRequestModal } from "../Components/WareHouses/FulfillRequestModal";
import { ViewInventoryModal } from "../Components/WareHouses/ViewInventoryModal";
import { useWarehouses, useTransferRequests } from "../services/warehouseApi";
import { useWarehouseInventory } from "../services/inventoryApi";
import { AddInventoryToWarehouseModal } from "../Components/WareHouses/AddInventoryToWarehouseModal";
import { AddStockToWarehouseModal } from "../Components/WareHouses/AddStockToWarehouseModal";
import type { TransferRequest, Product } from "../data/warehouseData";
import useBreakpoint from "../hooks/useBreakpoint";
import { toast } from "react-toastify";
import warehouseBadge from "../assets/inventory/inventorybadge.png";

// Icons
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 19-7-7 7-7"/>
    <path d="m19 12H5"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16.5 9.4L7.55 4.24C7.21 4.07 6.79 4.07 6.45 4.24L2.5 6.5v11l4 2.26c.34.17.76.17 1.1 0L16.5 15.5V4.24z"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="m12 17.02.01 0"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/>
    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m22 2-7 20-4-9-9-4Z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

export default function WarehouseDetail() {
  const { id } = useParams();
  const [newInventoryOpen, setNewInventoryOpen] = useState(false);
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [fulfillRequestOpen, setFulfillRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [viewInventoryOpen, setViewInventoryOpen] = useState(false);
  const isMobile = useBreakpoint("max", 640);
  const isTablet = useBreakpoint("max", 1024);
  
  // Fetch warehouse data using mock API
  const { data: warehouses = [], isLoading: warehouseLoading, error: warehouseError } = useWarehouses();
  const { data: inventory = [], isLoading: inventoryLoading, mutate: mutateInventory } = useWarehouseInventory(id || null);
  const { data: transfers = [], isLoading: transfersLoading } = useTransferRequests();
  
  const warehouse = warehouses.find((w: any) => w.id === id);

  // Show loading state
  if (warehouseLoading) {
    return (
      <PageLayout pageName="Loading..." badge={warehouseBadge}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textDarkGrey">Loading warehouse details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show error state
  if (warehouseError || !warehouse) {
    return (
      <PageLayout pageName="Warehouse Not Found" badge={warehouseBadge}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-errorTwo mb-4">Warehouse not found or failed to load</p>
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage === 100) return { label: "100%", color: "text-success" };
    if (percentage >= 75) return { label: `${Math.round(percentage)}%`, color: "text-success" };
    if (percentage >= 50) return { label: `${Math.round(percentage)}%`, color: "text-warning" };
    return { label: `${Math.round(percentage)}%`, color: "text-errorTwo" };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled": return "text-success bg-success/10";
      case "partial": return "text-warning bg-warning/10";
      case "pending": return "text-primary bg-primary/10";
      case "rejected": return "text-errorTwo bg-errorTwo/10";
      default: return "text-textDarkGrey bg-gray-100";
    }
  };

  const getWarehouseName = (warehouseId: string) => {
    // In a real implementation, you might want to fetch warehouse names from API
    return `Warehouse ${warehouseId}`;
  };

  // Ensure all data is arrays
  const inventoryArray = Array.isArray(inventory) ? inventory : [];
  const transfersArray = Array.isArray(transfers) ? transfers : [];

  const getProductName = (productId: string) => {
    const product = inventoryArray.find((p: Product) => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const lowStockItems = inventoryArray.filter((product: Product) => (product.stockLevel / product.maxCapacity) < 0.3);
  const totalItems = inventoryArray.reduce((sum: number, product: Product) => sum + product.stockLevel, 0);
  const totalValue = inventoryArray.reduce((sum: number, product: Product) => sum + product.inventoryValue, 0);

  // Get requests for this warehouse
  const incomingRequests = transfersArray.filter((req: TransferRequest) => req.fromWarehouse === warehouse.id);
  const outgoingRequests = transfersArray.filter((req: TransferRequest) => req.toWarehouse === warehouse.id);
  const pendingIncoming = incomingRequests.filter((req: TransferRequest) => req.status === 'pending').length;

  const handleFulfillRequest = (request: TransferRequest) => {
    setSelectedRequest(request);
    setFulfillRequestOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewInventoryOpen(true);
  };

  const handleRequestUpdated = () => {
    // This would trigger a data refresh in a real implementation
    // For now, we'll just close the modal
    setFulfillRequestOpen(false);
    setSelectedRequest(undefined);
  };

  return (
    <PageLayout pageName={warehouse.name} badge={warehouseBadge} className="w-full px-2 py-8 md:p-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            to="/warehouses"
            className="flex items-center gap-2 text-textDarkGrey hover:text-textBlack transition-colors w-fit"
          >
            <ArrowLeftIcon />
            <span className="text-sm sm:text-base">Back to Warehouses</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-textBlack">{warehouse.name}</h1>
                {warehouse.isMainWarehouse && (
                  <div className="bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-medium">
                    Main Warehouse
                  </div>
                )}
              </div>
              <p className="text-textDarkGrey text-sm sm:text-base">{warehouse.location}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button className="border border-strokeGreyThree text-textBlack py-2 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm">
                <RefreshIcon />
                {!isMobile && "Refresh"}
              </button>
              {!warehouse.isMainWarehouse && (
                <button
                  onClick={() => setNewRequestOpen(true)}
                  className="bg-primary text-white py-2 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors text-sm"
                >
                  <SendIcon />
                  {isMobile ? "Request" : "Request from Main"}
                </button>
              )}
              <button
                onClick={() => setNewInventoryOpen(true)}
                className="bg-primary text-white py-2 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors text-sm"
              >
                <PlusIcon />
                {isMobile ? "Add Item" : "New Inventory Item"}
              </button>
              <button
                onClick={() => setAddStockOpen(true)}
                className="bg-green-600 text-white py-2 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-green-700 transition-colors text-sm"
              >
                <PlusIcon />
                {isMobile ? "Add Stock" : "Add Stock to Warehouse"}
              </button>
            </div>
          </div>
        </div>

        {/* Warehouse Image */}
        <div className="bg-white border-[0.4px] border-strokeGreyTwo rounded-[20px] overflow-hidden">
          <div className="aspect-video sm:aspect-[3/1] lg:aspect-[4/1]">
            <img
              src={warehouse.image}
              alt={warehouse.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Items"
            value={inventoryLoading ? "..." : totalItems.toLocaleString()}
            icon={<PackageIcon />}
          />
          <MetricCard
            title="Total Value"
            value={inventoryLoading ? "..." : formatCurrency(totalValue)}
            icon={<TrendingUpIcon />}
          />
          <MetricCard
            title="Low Stock Items"
            value={inventoryLoading ? "..." : lowStockItems.length}
            icon={<AlertTriangleIcon />}
            trend={lowStockItems.length > 0 ? { value: "Needs attention", isPositive: false } : undefined}
          />
          {warehouse.isMainWarehouse && (
            <MetricCard
              title="Pending Requests"
              value={transfersLoading ? "..." : pendingIncoming}
              icon={<ClockIcon />}
              trend={pendingIncoming > 0 ? { value: "Needs fulfillment", isPositive: false } : undefined}
            />
          )}
        </div>

        {/* Incoming Requests for Main Warehouse */}
        {warehouse.isMainWarehouse && incomingRequests.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-textBlack">Incoming Requests</h2>
              <Link 
                to="/transfers"
                className="border border-strokeGreyThree text-textBlack py-2 px-4 rounded-full hover:bg-gray-50 transition-colors"
              >
                View All Requests
              </Link>
            </div>

            <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-strokeGreyTwo">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-textBlack">Request ID</th>
                      <th className="text-left py-3 px-4 font-medium text-textBlack">From Warehouse</th>
                      <th className="text-left py-3 px-4 font-medium text-textBlack">Inventory Item</th>
                      <th className="text-left py-3 px-4 font-medium text-textBlack">Requested</th>
                      <th className="text-left py-3 px-4 font-medium text-textBlack">Fulfilled</th>
                      <th className="text-left py-3 px-4 font-medium text-textBlack">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-textBlack">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-textBlack">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingRequests.map((request: TransferRequest) => (
                      <tr key={request.id} className="border-b border-strokeGreyTwo">
                        <td className="py-3 px-4 font-medium text-textBlack">{request.id}</td>
                        <td className="py-3 px-4 text-textDarkGrey">{getWarehouseName(request.toWarehouse)}</td>
                        <td className="py-3 px-4 text-textDarkGrey">{getProductName(request.productId)}</td>
                        <td className="py-3 px-4 text-textDarkGrey">{request.requestedQuantity}</td>
                        <td className="py-3 px-4 text-textDarkGrey">{request.fulfilledQuantity}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-textDarkGrey">{new Date(request.requestDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                // In a real app, this would open a view modal
                                toast.info(`Viewing request ${request.id}`);
                              }}
                              className="border border-strokeGreyThree text-textBlack py-1 px-3 rounded-full text-sm flex items-center gap-1 hover:bg-gray-50 transition-colors"
                            >
                              <EyeIcon />
                              View
                            </button>
                            {request.status !== 'fulfilled' && request.status !== 'rejected' && (
                              <button
                                onClick={() => handleFulfillRequest(request)}
                                className="bg-primary text-white py-1 px-3 rounded-full text-sm flex items-center gap-1 hover:bg-primary/90 transition-colors"
                              >
                                <CheckCircleIcon />
                                Fulfill
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationInfo
                currentPage={1}
                totalPages={Math.ceil(incomingRequests.length / 10)}
                itemsPerPage={10}
                totalItems={incomingRequests.length}
              />
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-textBlack">Inventory</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none border border-strokeGreyThree text-textBlack py-2 px-3 sm:px-4 rounded-full hover:bg-gray-50 transition-colors text-sm">
                {isMobile ? "Reset" : "Reset Filters"}
              </button>
              <button className="flex-1 sm:flex-none border border-strokeGreyThree text-textBlack py-2 px-3 sm:px-4 rounded-full hover:bg-gray-50 transition-colors text-sm">
                {isMobile ? "Refresh" : "Refresh Table"}
              </button>
            </div>
          </div>

          <div className="bg-white border-[0.4px] border-strokeGreyTwo rounded-[20px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-strokeGreyTwo">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-textBlack">S/N</th>
                    <th className="text-left py-3 px-4 font-medium text-textBlack">Item Picture</th>
                    <th className="text-left py-3 px-4 font-medium text-textBlack">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-textBlack">Class</th>
                    <th className="text-left py-3 px-4 font-medium text-textBlack">Sale Price</th>
                    <th className="text-left py-3 px-4 font-medium text-textBlack">Inventory Value</th>
                    <th className="text-left py-3 px-4 font-medium text-textBlack">Stock Level</th>
                    <th className="text-left py-3 px-4 font-medium text-textBlack">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-textDarkGrey">Loading inventory...</p>
                      </td>
                    </tr>
                  ) : inventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center">
                        <p className="text-textDarkGrey">No inventory items found</p>
                      </td>
                    </tr>
                  ) : (
                    inventoryArray.map((product: Product, index: number) => {
                      const stockStatus = getStockStatus(product.stockLevel, product.maxCapacity);
                      return (
                        <tr key={product.id} className="border-b border-strokeGreyTwo">
                          <td className="py-3 px-4 text-textDarkGrey">{index + 1}</td>
                          <td className="py-3 px-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs">📷</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-textBlack">{product.name}</td>
                          <td className="py-3 px-4">
                            <span className="border border-strokeGreyThree px-2 py-1 rounded-full text-xs capitalize">
                              {product.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-success font-medium">
                            {formatCurrency(product.salePrice)}
                          </td>
                          <td className="py-3 px-4 text-success font-medium">
                            {formatCurrency(product.inventoryValue)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-textDarkGrey">
                                {product.stockLevel}/{product.maxCapacity}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs bg-success text-white`}>
                                {stockStatus.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="border border-strokeGreyThree text-textBlack py-1 px-3 rounded-full text-sm flex items-center gap-1 hover:bg-gray-50 transition-colors"
                            >
                              <EyeIcon />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <PaginationInfo
              currentPage={1}
              totalPages={Math.ceil(inventory.length / 10)}
              itemsPerPage={10}
              totalItems={inventory.length}
            />
          </div>
        </div>

        {/* Modals */}
        <NewInventoryModal
          open={newInventoryOpen}
          onOpenChange={setNewInventoryOpen}
          warehouseId={id}
        />
        <AddStockToWarehouseModal
          open={addStockOpen}
          onOpenChange={setAddStockOpen}
          warehouseId={id}
          onSuccess={() => mutateInventory()}
        />
        <NewRequestModal
          open={newRequestOpen}
          onOpenChange={setNewRequestOpen}
        />
        <FulfillRequestModal
          open={fulfillRequestOpen}
          onOpenChange={setFulfillRequestOpen}
          request={selectedRequest}
          onRequestUpdated={handleRequestUpdated}
        />
        <ViewInventoryModal
          open={viewInventoryOpen}
          onOpenChange={setViewInventoryOpen}
          product={selectedProduct}
        />
      </div>
    </PageLayout>
  );
}