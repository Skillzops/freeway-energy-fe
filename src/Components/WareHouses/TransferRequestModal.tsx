import React, { useState } from 'react';
import { useTransferManagement } from '../../hooks/useWarehouseHooks';
import type { TransferRequest } from '../../data/warehouseData';

interface TransferRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferRequest: TransferRequest;
  onUpdate: () => void;
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const TransferRequestModal: React.FC<TransferRequestModalProps> = ({
  open,
  onOpenChange,
  transferRequest,
  onUpdate,
}) => {
  const [fulfilledQuantity, setFulfilledQuantity] = useState(
    transferRequest.fulfilledQuantity || 0
  );
  const [notes, setNotes] = useState(transferRequest.notes || '');
  const [rejectionReason, setRejectionReason] = useState('');

  const { fulfillTransferRequest, rejectTransferRequest, isLoading } = useTransferManagement();

  // Helper function to safely extract string values from objects
  const getDisplayValue = (value: any): string => {
    if (!value) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      // Handle common object structures
      if (value.name) return value.name;
      if (value.firstname && value.lastname) return `${value.firstname} ${value.lastname}`;
      if (value.email) return value.email;
      if (value.id) return value.id;
      return JSON.stringify(value);
    }
    return String(value);
  };

  const handleFulfill = async () => {
    try {
      await fulfillTransferRequest(transferRequest.id, fulfilledQuantity, notes);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to fulfill transfer request:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectTransferRequest(transferRequest.id, rejectionReason);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to reject transfer request:', error);
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-textBlack">Transfer Request Details</h2>
            <p className="text-textDarkGrey text-sm">
              ID: {(transferRequest as any).requestId || transferRequest.id}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-textDarkGrey hover:text-textBlack"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Transfer Details */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                From Warehouse
              </label>
              <p className="text-textDarkGrey">{getDisplayValue(transferRequest.fromWarehouse)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                To Warehouse
              </label>
              <p className="text-textDarkGrey">{getDisplayValue(transferRequest.toWarehouse)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Product
              </label>
              <p className="text-textDarkGrey">
                {getDisplayValue((transferRequest as any).inventory) ||
                 getDisplayValue((transferRequest as any).productName) ||
                 transferRequest.productId ||
                 (transferRequest as any).inventoryId ||
                 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Status
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transferRequest.status)}`}>
                {transferRequest.status.charAt(0).toUpperCase() + transferRequest.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Requested Quantity
              </label>
              <p className="text-textDarkGrey">{transferRequest.requestedQuantity}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Fulfilled Quantity
              </label>
              <p className="text-textDarkGrey">{transferRequest.fulfilledQuantity || 0}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textBlack mb-1">
              Request Date
            </label>
            <p className="text-textDarkGrey">
              {formatDate((transferRequest as any).createdAt || transferRequest.requestDate)}
            </p>
          </div>

          {transferRequest.notes && (
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Notes
              </label>
              <p className="text-textDarkGrey">{getDisplayValue(transferRequest.notes)}</p>
            </div>
          )}

          {transferRequest.rejectionReason && (
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Rejection Reason
              </label>
              <p className="text-red-600">{getDisplayValue(transferRequest.rejectionReason)}</p>
            </div>
          )}
        </div>

        {/* Actions for pending requests */}
        {transferRequest.status === 'pending' && (
          <div className="border-t border-strokeGreyThree pt-6">
            <h3 className="text-lg font-medium text-textBlack mb-4">Actions</h3>
            
            {/* Fulfill Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-textBlack mb-3">Fulfill Request</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-textBlack mb-1">
                    Fulfilled Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={transferRequest.requestedQuantity}
                    value={fulfilledQuantity}
                    onChange={(e) => setFulfilledQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter quantity to fulfill"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textBlack mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Add any notes about the fulfillment"
                  />
                </div>
                <button
                  onClick={handleFulfill}
                  disabled={isLoading || fulfilledQuantity <= 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckIcon />
                  Fulfill Request
                </button>
              </div>
            </div>

            {/* Reject Section */}
            <div>
              <h4 className="text-md font-medium text-textBlack mb-3">Reject Request</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-textBlack mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Explain why this request is being rejected"
                  />
                </div>
                <button
                  onClick={handleReject}
                  disabled={isLoading || !rejectionReason.trim()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <XIcon />
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-strokeGreyThree">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-strokeGreyThree text-textBlack rounded-full hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};