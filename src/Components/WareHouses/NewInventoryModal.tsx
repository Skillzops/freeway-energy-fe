import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useMockWarehouseApi } from "../../services/mockWarehouseApi";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import useBreakpoint from "../../hooks/useBreakpoint";

interface NewInventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId?: string;
}

export function NewInventoryModal({ open, onOpenChange, warehouseId }: NewInventoryModalProps) {
  const { id } = useParams();
  const currentWarehouseId = warehouseId || id;
  const isMobile = useBreakpoint("max", 640);
  
  const [inventoryClass, setInventoryClass] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [numberOfStock, setNumberOfStock] = useState("");
  const [costOfItem, setCostOfItem] = useState("");
  const [priceOfItem, setPriceOfItem] = useState("");

  const { addInventoryItem } = useMockWarehouseApi();

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    if (!numericValue) return "";
    const formatted = parseInt(numericValue).toLocaleString();
    return `₦${formatted}`;
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setCostOfItem(formatted);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setPriceOfItem(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inventoryClass || !itemCategory || !itemName || !manufacturerName || !numberOfStock || !costOfItem || !priceOfItem) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!currentWarehouseId) {
      toast.error("Warehouse ID is required");
      return;
    }

    const stockNum = parseInt(numberOfStock);
    const costNum = parseFloat(costOfItem.replace(/[^\d.]/g, ''));
    const priceNum = parseFloat(priceOfItem.replace(/[^\d.]/g, ''));

    if (isNaN(stockNum) || isNaN(costNum) || isNaN(priceNum)) {
      toast.error("Please enter valid numbers for stock, cost, and price");
      return;
    }

    try {
      const inventoryData = {
        name: itemName,
        category: itemCategory,
        status: inventoryClass,
        manufacturerName,
        stockLevel: stockNum,
        maxCapacity: stockNum,
        salePrice: priceNum,
        inventoryValue: costNum * stockNum,
      };

      await addInventoryItem(currentWarehouseId, inventoryData);

      // Reset form and close modal
      setInventoryClass("");
      setItemCategory("");
      setItemName("");
      setManufacturerName("");
      setNumberOfStock("");
      setCostOfItem("");
      setPriceOfItem("");
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      toast.error('Failed to add inventory item');
    }
  };

  return (
    <Modal 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      size={isMobile ? "large" : "medium"}
      layout="right"
      leftHeaderComponents={
        <h2 className="text-lg font-semibold text-textBlack">New Inventory Item</h2>
      }
    >
      <div className="p-4 sm:p-6 h-full overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label htmlFor="inventory-class" className="block text-sm font-medium text-textBlack">
              Choose Inventory Class *
            </label>
            <select
              id="inventory-class"
              value={inventoryClass}
              onChange={(e) => setInventoryClass(e.target.value)}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            >
              <option value="">Choose Inventory Class</option>
              <option value="regular">Regular</option>
              <option value="returned">Returned</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="item-category" className="block text-sm font-medium text-textBlack">
              Choose Item Category *
            </label>
            <select
              id="item-category"
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            >
              <option value="">Choose Item Category</option>
              <option value="solar">Solar</option>
              <option value="battery">Battery</option>
              <option value="inverter">Inverter</option>
              <option value="accessory">Accessory</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="item-name" className="block text-sm font-medium text-textBlack">
              Item Name *
            </label>
            <input
              id="item-name"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item Name"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="manufacturer-name" className="block text-sm font-medium text-textBlack">
              Manufacturer Name *
            </label>
            <input
              id="manufacturer-name"
              type="text"
              value={manufacturerName}
              onChange={(e) => setManufacturerName(e.target.value)}
              placeholder="Manufacturer Name"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="number-of-stock" className="block text-sm font-medium text-textBlack">
              Number of Stock *
            </label>
            <input
              id="number-of-stock"
              type="number"
              value={numberOfStock}
              onChange={(e) => setNumberOfStock(e.target.value)}
              placeholder="Number of Stock"
              min="0"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cost-of-item" className="block text-sm font-medium text-textBlack">
              Cost of Item *
            </label>
            <input
              id="cost-of-item"
              type="text"
              value={costOfItem}
              onChange={handleCostChange}
              placeholder="₦0"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price-of-item" className="block text-sm font-medium text-textBlack">
              Price of Item *
            </label>
            <input
              id="price-of-item"
              type="text"
              value={priceOfItem}
              onChange={handlePriceChange}
              placeholder="₦0"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
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
              Add Item
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}