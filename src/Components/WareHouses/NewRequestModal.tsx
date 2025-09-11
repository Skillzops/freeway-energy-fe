import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useWarehouses, useWarehouseApi } from "../../services/warehouseApi";
import { useWarehouseInventory } from "../../services/inventoryApi";
import { toast } from "react-toastify";
import useBreakpoint from "../../hooks/useBreakpoint";

interface NewRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewRequestModal({ open, onOpenChange }: NewRequestModalProps) {
  const [fromWarehouse, setFromWarehouse] = useState(""); // Allow selecting any warehouse
  const [toWarehouse, setToWarehouse] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const isMobile = useBreakpoint("max", 640);

  // Fetch data using API
  const { data: warehouses = [] } = useWarehouses();
  const { data: inventory = [] } = useWarehouseInventory(fromWarehouse || null); // Fetch inventory for selected warehouse
  const { createTransferRequest } = useWarehouseApi();

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

  const selectedFromWarehouse = warehouses.find((w: any) => w.id === fromWarehouse);
  const availableToWarehouses = warehouses.filter((w: any) => w.id !== fromWarehouse);

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
                {selectedFromWarehouse?.name || "Select source warehouse below"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-sm font-medium text-textBlack">To:</span>
              <span className="text-sm text-textDarkGrey">Select destination warehouse below</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label htmlFor="from-warehouse" className="block text-sm font-medium text-textBlack">
              Source Warehouse *
            </label>
            <select
              id="from-warehouse"
              value={fromWarehouse}
              onChange={(e) => {
                setFromWarehouse(e.target.value);
                setProductId(""); // Reset product selection when warehouse changes
              }}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            >
              <option value="">Select source warehouse</option>
              {warehouses.map((warehouse: any) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} {warehouse.isMainWarehouse ? "(Main)" : "(Branch)"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="to-warehouse" className="block text-sm font-medium text-textBlack">
              Destination Warehouse *
            </label>
            <select
              id="to-warehouse"
              value={toWarehouse}
              onChange={(e) => setToWarehouse(e.target.value)}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            >
              <option value="">Select destination warehouse</option>
              {availableToWarehouses.map((warehouse: any) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} {warehouse.isMainWarehouse ? "(Main)" : "(Branch)"}
                </option>
              ))}
            </select>
          </div>

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