import React, { useState } from "react";
import PageLayout from "./PageLayout";
import { TransferRequestModal } from "../Components/WareHouses/TransferRequestModal";
import { useTransferManagement } from "../hooks/useWarehouseHooks";
import type { TransferRequest } from "../data/warehouseData";
import useBreakpoint from "../hooks/useBreakpoint";
import transferBadge from "../assets/inventory/inventorybadge.png";

// Icons
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12,5 19,12 12,19"/>
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

export default function Transfers() {
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [newTransferModalOpen, setNewTransferModalOpen] = useState(false);
  
  const {
    transfers,
    transferMetrics,
    isLoading,
    statusFilter,
    warehouseFilter,
    setStatusFilter,
    setWarehouseFilter,
    warehouses,
    getWarehouseName,
    getProductName,
    refreshData,
  } = useTransferManagement();
  
  const isMobile = useBreakpoint("max", 640);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTransferClick = (transfer: TransferRequest) => {
    setSelectedTransfer(transfer);
    setTransferModalOpen(true);
  };

  const handleTransferUpdate = () => {
    refreshData();
  };

  if (isLoading) {
    return (
      <PageLayout pageName="Transfer Requests" badge={transferBadge}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textDarkGrey">Loading transfer requests...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageName="Transfer Requests" badge={transferBadge} className="w-full px-2 py-8 md:p-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-textBlack">Transfer Requests</h1>
            <p className="text-textDarkGrey text-sm sm:text-base">Manage warehouse transfer requests</p>
          </div>
          <button
            onClick={() => setNewTransferModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <PlusIcon />
            {isMobile ? "New Request" : "New Transfer Request"}
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 rounded-lg border border-strokeGreyThree">
            <div className="text-2xl font-bold text-textBlack">{transferMetrics.total}</div>
            <div className="text-sm text-textDarkGrey">Total Requests</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-strokeGreyThree">
            <div className="text-2xl font-bold text-yellow-600">{transferMetrics.pending}</div>
            <div className="text-sm text-textDarkGrey">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-strokeGreyThree">
            <div className="text-2xl font-bold text-green-600">{transferMetrics.fulfilled}</div>
            <div className="text-sm text-textDarkGrey">Fulfilled</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-strokeGreyThree">
            <div className="text-2xl font-bold text-red-600">{transferMetrics.rejected}</div>
            <div className="text-sm text-textDarkGrey">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex gap-2 items-center">
            <FilterIcon />
            <span className="text-sm font-medium text-textBlack">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-strokeGreyThree rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="partial">Partial</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="px-3 py-2 border border-strokeGreyThree rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((warehouse: any) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>

            <button
              onClick={refreshData}
              className="border border-strokeGreyThree text-textBlack py-2 px-4 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshIcon />
              Refresh
            </button>
          </div>
        </div>

        {/* Transfer Requests List */}
        <div className="bg-white rounded-lg border border-strokeGreyThree overflow-hidden">
          {transfers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-textDarkGrey mb-4">No transfer requests found</p>
              <button
                onClick={() => setNewTransferModalOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
              >
                Create Your First Transfer Request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                      Transfer Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map((transfer: TransferRequest) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-textBlack">
                        {transfer.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textDarkGrey">
                        <div className="flex items-center gap-2">
                          <span>{getWarehouseName(transfer.fromWarehouse)}</span>
                          <ArrowRightIcon />
                          <span>{getWarehouseName(transfer.toWarehouse)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textDarkGrey">
                        {getProductName(transfer.productId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textDarkGrey">
                        {transfer.fulfilledQuantity || 0} / {transfer.requestedQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transfer.status)}`}>
                          {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textDarkGrey">
                        {formatDate(transfer.requestDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleTransferClick(transfer)}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transfer Request Modal */}
        {selectedTransfer && (
          <TransferRequestModal
            open={transferModalOpen}
            onOpenChange={setTransferModalOpen}
            transferRequest={selectedTransfer}
            onUpdate={handleTransferUpdate}
          />
        )}
      </div>
    </PageLayout>
  );
}