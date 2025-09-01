import React, { useState } from "react";
import PageLayout from "./PageLayout";
import { MetricCard } from "../Components/WareHouses/MetricCard";
import { PaginationInfo } from "../Components/WareHouses/PaginationInfo";
import { FulfillRequestModal } from "../Components/WareHouses/FulfillRequestModal";
import { NewRequestModal } from "../Components/WareHouses/NewRequestModal";
import { useMockTransferRequests, useMockWarehouses, useMockProducts } from "../services/mockWarehouseApi";
import type { TransferRequest } from "../data/warehouseData";
import useBreakpoint from "../hooks/useBreakpoint";
import { toast } from "react-toastify";
import warehouseBadge from "../assets/inventory/inventorybadge.png";

// Icons
const ArrowLeftRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3L4 7l4 4"/>
    <path d="m4 7h16"/>
    <path d="m16 21 4-4-4-4"/>
    <path d="M20 17H4"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="m12 17.02.01 0"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
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

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

export default function Transfers() {
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [fulfillRequestOpen, setFulfillRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useBreakpoint("max", 640);

  // Fetch data using mock API
  const { data: transferRequests = [], isLoading, error } = useMockTransferRequests();
  const { data: warehouses = [] } = useMockWarehouses();
  const { data: products = [] } = useMockProducts();

  // Filter transfers based on search
  const filteredTransfers = transferRequests.filter((request: TransferRequest) =>
    request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getWarehouseName(request.fromWarehouse).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getWarehouseName(request.toWarehouse).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getProductName(request.productId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = transferRequests.filter((req: TransferRequest) => req.status === 'pending').length;
  const partialRequests = transferRequests.filter((req: TransferRequest) => req.status === 'partial').length;
  const fulfilledRequests = transferRequests.filter((req: TransferRequest) => req.status === 'fulfilled').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled": return "text-success bg-success/10";
      case "partial": return "text-warning bg-warning/10";
      case "pending": return "text-primary bg-primary/10";
      case "rejected": return "text-errorTwo bg-errorTwo/10";
      default: return "text-textDarkGrey bg-gray-100";
    }
  };

  const getWarehouseName = (id: string) => {
    return warehouses.find((w: any) => w.id === id)?.name || "Unknown";
  };

  const getProductName = (id: string) => {
    return products.find((p: any) => p.id === id)?.name || "Unknown";
  };

  const handleFulfillRequest = (request: TransferRequest) => {
    setSelectedRequest(request);
    setFulfillRequestOpen(true);
  };

  const handleViewRequest = (request: TransferRequest) => {
    setSelectedRequest(request);
    toast.info(`Viewing transfer request ${request.id}`);
  };

  const handleRequestUpdated = () => {
    // This would trigger a data refresh in a real implementation
    setFulfillRequestOpen(false);
    setSelectedRequest(undefined);
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageLayout pageName="Transfer Requests" badge={warehouseBadge}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textDarkGrey">Loading transfer requests...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageLayout pageName="Transfer Requests" badge={warehouseBadge}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-errorTwo mb-4">Failed to load transfer requests</p>
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
    <PageLayout pageName="Transfer Requests" badge={warehouseBadge} className="w-full px-2 py-8 md:p-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-textBlack">Transfer Requests</h1>
            <p className="text-textDarkGrey text-sm sm:text-base">Manage warehouse transfer requests</p>
          </div>
          <button
            onClick={() => setNewRequestOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm sm:text-base"
          >
            <PlusIcon />
            {isMobile ? "New" : "New Request"}
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Requests"
            value={transferRequests.length}
            icon={<ArrowLeftRightIcon />}
          />
          <MetricCard
            title="Pending"
            value={pendingRequests}
            icon={<ClockIcon />}
            trend={pendingRequests > 0 ? { value: "Needs attention", isPositive: false } : undefined}
          />
          <MetricCard
            title="Partial"
            value={partialRequests}
            icon={<AlertTriangleIcon />}
          />
          <MetricCard
            title="Fulfilled"
            value={fulfilledRequests}
            icon={<CheckCircleIcon />}
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex-1 max-w-full sm:max-w-sm">
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search requests..."
                className="pl-10 pr-4 py-2 border border-strokeGreyThree rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textDarkGrey">
                <SearchIcon />
              </div>
            </div>
          </div>
          <button className="border border-strokeGreyThree text-textBlack py-2 px-3 sm:px-4 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm">
            <FilterIcon />
            {!isMobile && "Filters"}
          </button>
        </div>

        {/* Requests Table */}
        <div className="bg-white border-[0.4px] border-strokeGreyTwo rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-strokeGreyTwo">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-textBlack">Request ID</th>
                  <th className="text-left py-3 px-4 font-medium text-textBlack">From</th>
                  <th className="text-left py-3 px-4 font-medium text-textBlack">To</th>
                  <th className="text-left py-3 px-4 font-medium text-textBlack">Inventory Item</th>
                  <th className="text-left py-3 px-4 font-medium text-textBlack">Requested</th>
                  <th className="text-left py-3 px-4 font-medium text-textBlack">Fulfilled</th>
                  <th className="text-left py-3 px-4 font-medium text-textBlack">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-textBlack">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-textBlack">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center">
                      <p className="text-textDarkGrey">
                        {searchTerm ? "No requests match your search" : "No transfer requests found"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((request: TransferRequest) => (
                    <tr key={request.id} className="border-b border-strokeGreyTwo">
                      <td className="py-3 px-4 font-medium text-textBlack">{request.id}</td>
                      <td className="py-3 px-4 text-textDarkGrey">{getWarehouseName(request.fromWarehouse)}</td>
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
                          <button className="border border-strokeGreyThree text-textBlack py-1 px-3 rounded-full text-sm flex items-center gap-1 hover:bg-gray-50 transition-colors">
                            <EyeIcon />
                            View
                          </button>
                          {request.status !== 'fulfilled' && request.status !== 'rejected' && (
                            <button
                              onClick={() => handleFulfillRequest(request)}
                              className="bg-primary text-white py-1 px-3 rounded-full text-sm flex items-center gap-1 hover:bg-primary/90 transition-colors"
                            >
                              <CheckIcon />
                              Fulfill
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <PaginationInfo
            currentPage={1}
            totalPages={Math.ceil(transferRequests.length / 10)}
            itemsPerPage={10}
            totalItems={transferRequests.length}
          />
        </div>
      </div>
    </PageLayout>
  );
}