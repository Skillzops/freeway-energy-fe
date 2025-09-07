import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useWarehouseApi } from "../../services/warehouseApi";
import { toast } from "react-toastify";
import useBreakpoint from "../../hooks/useBreakpoint";
import type { TransferRequest } from "../../data/warehouseData";

interface FulfillRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: TransferRequest;
  onRequestUpdated?: () => void;
}

export function FulfillRequestModal({ open, onOpenChange, request, onRequestUpdated }: FulfillRequestModalProps) {
  const [fulfilledQuantity, setFulfilledQuantity] = useState(request?.requestedQuantity.toString() || "");
  const [status, setStatus] = useState<"fulfilled" | "partial" | "rejected">("fulfilled");
  const [notes, setNotes] = useState("");
  const isMobile = useBreakpoint("max", 640);
  const { fulfillTransferRequest } = useWarehouseApi();

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fulfilled = parseInt(fulfilledQuantity);
    if (isNaN(fulfilled) || fulfilled < 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (fulfilled > request.requestedQuantity) {
      toast.error("Fulfilled quantity cannot exceed requested quantity");
      return;
    }

    // Determine status based on fulfilled quantity
    let finalStatus = status;
    if (fulfilled === 0) {
      finalStatus = "rejected";
    } else if (fulfilled < request.requestedQuantity) {
      finalStatus = "partial";
    } else {
      finalStatus = "fulfilled";
    }

    try {
      await fulfillTransferRequest(request.id, fulfilled, finalStatus, notes);
      
      // Call the callback to refresh data
      if (onRequestUpdated) {
        onRequestUpdated();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to fulfill transfer request:', error);
      toast.error('Failed to fulfill transfer request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled": return "bg-success/10 text-success";
      case "partial": return "bg-warning/10 text-warning";
      case "rejected": return "bg-errorTwo/10 text-errorTwo";
      default: return "bg-gray-100 text-textDarkGrey";
    }
  };

  return (
    <Modal 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      size={isMobile ? "large" : "medium"}
      layout="right"
      leftHeaderComponents={
        <h2 className="text-lg font-semibold text-textBlack">Fulfill Transfer Request</h2>
      }
    >
      <div className="p-4 sm:p-6 h-full overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* Request Details */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-sm font-medium text-textBlack">Request ID:</span>
              <span className="text-sm text-textDarkGrey">{request.id}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-sm font-medium text-textBlack">Product:</span>
              <span className="text-sm text-textDarkGrey">Product {request.productId}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-sm font-medium text-textBlack">Requested:</span>
              <span className="text-sm font-semibold text-textBlack">{request.requestedQuantity} units</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-sm font-medium text-textBlack">Current Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label htmlFor="fulfilled-quantity" className="block text-sm font-medium text-textBlack">
                Fulfilled Quantity *
              </label>
              <input
                id="fulfilled-quantity"
                type="number"
                value={fulfilledQuantity}
                onChange={(e) => setFulfilledQuantity(e.target.value)}
                max={request.requestedQuantity}
                min="0"
                placeholder="Enter quantity to fulfill"
                className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              />
              <p className="text-xs text-textDarkGrey">
                Maximum: {request.requestedQuantity} units
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-textBlack">
                Status *
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "fulfilled" | "partial" | "rejected")}
                className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              >
                <option value="fulfilled">Fulfilled</option>
                <option value="partial">Partial</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-textBlack">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add fulfillment notes..."
                rows={isMobile ? 2 : 3}
                className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-6 border-t border-strokeGreyTwo mt-6">
              <button 
                type="button" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto px-4 py-2 sm:py-3 border border-strokeGreyThree text-textBlack rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
              >
                Update Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}