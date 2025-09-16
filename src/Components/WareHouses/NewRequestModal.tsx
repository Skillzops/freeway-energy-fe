import React, { useState, useEffect } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useWarehouses, useWarehouseApi } from "../../services/warehouseApi";
import { useWarehouseInventory } from "../../services/inventoryApi";
import { toast } from "react-toastify";
import useBreakpoint from "../../hooks/useBreakpoint";

interface NewRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWarehouseId?: string; // Add current warehouse context
}

export function NewRequestModal({ open, onOpenChange, currentWarehouseId }: NewRequestModalProps) {
  const [fromWarehouse, setFromWarehouse] = useState("");
  const [toWarehouse, setToWarehouse] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const isMobile = useBreakpoint("max", 640);

  // Fetch data using API
  const { data: warehouses = [] } = useWarehouses();
  const { data: inventory = [] } = useWarehouseInventory(fromWarehouse || null);
  const { createTransferRequest } = useWarehouseApi();

  // Get current warehouse and main warehouse
  const currentWarehouse = warehouses.find((w: any) => w.id === currentWarehouseId);
  const mainWarehouse = warehouses.find((w: any) => w.isMainWarehouse);
  const isCurrentWarehouseMain = currentWarehouse?.isMainWarehouse;

  // Set default warehouses based on current warehouse type
  useEffect(() => {
    if (open && currentWarehouse && mainWarehouse) {
      if (isCurrentWarehouseMain) {
        // Main warehouse requesting to branch: from=main, to=selectable branch
        setFromWarehouse(mainWarehouse.id);
        setToWarehouse("");
      } else {
        // Branch warehouse requesting from main: from=main, to=current branch
        setFromWarehouse(mainWarehouse.id);
        setToWarehouse(currentWarehouse.id);
      }
      setProductId("");
      setQuantity("");
      setNotes("");
    }
  }, [open, currentWarehouse, mainWarehouse, isCurrentWarehouseMain]);

  const availableToWarehouses = isCurrentWarehouseMain 
    ? warehouses.filter((w: any) => !w.isMainWarehouse) // Branch warehouses for main
    : []; // No selection needed for branch warehouses

  const selectedFromWarehouse = warehouses.find((w: any) => w.id === fromWarehouse);
  const selectedToWarehouse = warehouses.find((w: any) => w.id === toWarehouse);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromWarehouse || !toWarehouse || !productId || !quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      await createTransferRequest({
        fromWarehouse,
        toWarehouse,
        productId,
        requestedQuantity: quantityNum,
        notes,
      });

      // Reset form and close modal
      setFromWarehouse("");
      setToWarehouse("");
      setProductId("");
      setQuantity("");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create transfer request:', error);
      toast.error('Failed to create transfer request');
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      size={isMobile ? "large" : "medium"}
      layout="right"
      leftHeaderComponents={
        <h2 className="text-lg font-semibold text-textBlack">Create Transfer Request</h2>
      }
    >
      <div className="p-4 sm:p-6 h-full overflow-y-auto">
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-sm font-medium text-textBlack">From:</span>
              <span className="text-sm text-textDarkGrey">
                {selectedFromWarehouse?.name || "Main Warehouse"} (Main)
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-sm font-medium text-textBlack">To:</span>
              <span className="text-sm text-textDarkGrey">
                {isCurrentWarehouseMain 
                  ? (selectedToWarehouse?.name || "Select destination warehouse below")
                  : `${currentWarehouse?.name || "Current Warehouse"} (Branch)`
                }
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Source Warehouse - Always Main, Not Editable */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-textBlack">
              Source Warehouse
            </label>
            <div className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg bg-gray-50 text-textDarkGrey text-sm sm:text-base">
              {mainWarehouse?.name || "Main Warehouse"} (Main)
            </div>
          </div>

          {/* Destination Warehouse - Conditional based on current warehouse type */}
          {isCurrentWarehouseMain ? (
            <div className="space-y-2">
              <label htmlFor="to-warehouse" className="block text-sm font-medium text-textBlack">
                Destination Warehouse *
              </label>
              <select
                id="to-warehouse"
                value={toWarehouse}
                onChange={(e) => setToWarehouse(e.target.value)}
                className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
                required
              >
                <option value="">Select destination warehouse</option>
                {availableToWarehouses.map((warehouse: any) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} (Branch)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-textBlack">
                Destination Warehouse
              </label>
              <div className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg bg-gray-50 text-textDarkGrey text-sm sm:text-base">
                {currentWarehouse?.name || "Current Warehouse"} (Branch)
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="product" className="block text-sm font-medium text-textBlack">
              Inventory Item *
            </label>
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              disabled={!fromWarehouse}
            >
              <option value="">
                {!fromWarehouse ? "Select source warehouse first" : "Select inventory item"}
              </option>
              {inventory.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name} - Available: {item.totalRemainingQuantities || 0}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="quantity" className="block text-sm font-medium text-textBlack">
              Quantity *
            </label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min="1"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-textBlack">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
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
              Send Request
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
