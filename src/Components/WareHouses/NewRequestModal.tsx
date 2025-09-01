import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useMockWarehouses, useMockProducts, useMockWarehouseApi } from "../../services/mockWarehouseApi";
import { toast } from "react-toastify";
import useBreakpoint from "../../hooks/useBreakpoint";

interface NewRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewRequestModal({ open, onOpenChange }: NewRequestModalProps) {
  const [fromWarehouse, setFromWarehouse] = useState("main"); // Default to main warehouse
  const [toWarehouse, setToWarehouse] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const isMobile = useBreakpoint("max", 640);

  // Fetch data using mock API
  const { data: warehouses = [] } = useMockWarehouses();
  const { data: products = [] } = useMockProducts();
  const { createTransferRequest } = useMockWarehouseApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!toWarehouse || !productId || !quantity) {
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
      setFromWarehouse("main");
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

  const mainWarehouse = warehouses.find((w: any) => w.isMainWarehouse);
  const branchWarehouses = warehouses.filter((w: any) => !w.isMainWarehouse);

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      size={isMobile ? "large" : "medium"}
      layout="right"
      leftHeaderComponents={
        <h2 className="text-lg font-semibold text-textBlack">Request from Main Warehouse</h2>
      }
    >
      <div className="p-4 sm:p-6 h-full overflow-y-auto">
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-sm font-medium text-textBlack">From:</span>
              <span className="text-sm text-textDarkGrey">{mainWarehouse?.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-sm font-medium text-textBlack">To:</span>
              <span className="text-sm text-textDarkGrey">Select destination warehouse below</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
              {branchWarehouses.map((warehouse: any) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
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
            >
              <option value="">Select inventory item</option>
              {products.map((product: any) => (
                <option key={product.id} value={product.id}>
                  {product.name} - Available: {product.stockLevel}
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