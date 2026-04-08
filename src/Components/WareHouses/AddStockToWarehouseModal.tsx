import React, { useState } from 'react';
import { useInventoryApi as _useInventoryApi, useInventory } from '../../services/inventoryApi';
import { useWarehouses } from '../../services/warehouseApi';
import { useApiCall } from '../../utils/useApiCall';
import { toast } from 'react-toastify';

interface AddStockToWarehouseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId?: string;
  onSuccess?: () => void;
}

const PackageIcon = () =>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16.5 9.4L7.55 4.24C7.21 4.07 6.79 4.07 6.45 4.24L2.5 6.5v11l4 2.26c.34.17.76.17 1.1 0L16.5 15.5V4.24z" />
    <path d="M7.5 4.21v15.58" />
    <path d="M16.5 9.4v6.1" />
  </svg>;


export const AddStockToWarehouseModal: React.FC<AddStockToWarehouseModalProps> = ({
  open,
  onOpenChange,
  warehouseId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    inventoryId: '',
    warehouseId: warehouseId || '',
    numberOfStock: 0,
    costOfItem: '',
    price: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data: warehouses = [] } = useWarehouses();
  const { data: inventory = [] } = useInventory();
  const { apiCall } = useApiCall();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    return numericValue;
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCurrency(e.target.value);
    setFormData((prev) => ({ ...prev, costOfItem: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCurrency(e.target.value);
    setFormData((prev) => ({ ...prev, price: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.inventoryId || !formData.warehouseId || formData.numberOfStock <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Use inventory batch create endpoint to add stock to warehouse
      await apiCall({
        endpoint: "/v1/inventory/batch/create",
        method: "post",
        data: {
          inventoryId: formData.inventoryId,
          warehouseId: formData.warehouseId,
          numberOfStock: formData.numberOfStock,
          costOfItem: formData.costOfItem,
          price: formData.price
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        successMessage: "Stock added to warehouse successfully!"
      });

      // Reset form
      setFormData({
        inventoryId: '',
        warehouseId: warehouseId || '',
        numberOfStock: 0,
        costOfItem: '',
        price: ''
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add stock to warehouse:', error);
      toast.error('Failed to add stock to warehouse. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedInventoryItem = inventory.find((item: any) => item.id === formData.inventoryId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-textBlack">Add Stock to Warehouse</h2>
            <p className="text-textDarkGrey text-sm">Add existing inventory items to warehouse</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-textDarkGrey hover:text-textBlack">

            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warehouse Selection */}
          <div>
            <label className="block text-sm font-medium text-textBlack mb-1">
              Target Warehouse <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.warehouseId}
              onChange={(e) => handleInputChange('warehouseId', e.target.value)}
              className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required>

              <option value="">Select target warehouse</option>
              {warehouses.map((warehouse: any) =>
              <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.location}
                </option>
              )}
            </select>
          </div>

          {/* Inventory Item Selection */}
          <div>
            <label className="block text-sm font-medium text-textBlack mb-1">
              Inventory Item <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.inventoryId}
              onChange={(e) => handleInputChange('inventoryId', e.target.value)}
              className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required>

              <option value="">Select inventory item</option>
              {inventory.map((item: any) =>
              <option key={item.id} value={item.id}>
                  {item.name} - {item.category || 'No category'}
                </option>
              )}
            </select>
          </div>

          {/* Selected Item Info */}
          {selectedInventoryItem &&
          <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-textBlack mb-2">Selected Item Details</h4>
              <div className="text-sm text-textDarkGrey space-y-1">
                <p><strong>Name:</strong> {selectedInventoryItem.name}</p>
                <p><strong>Category:</strong> {selectedInventoryItem.category || 'N/A'}</p>
                <p><strong>Current Stock:</strong> {selectedInventoryItem.numberOfStock || selectedInventoryItem.quantity || 0}</p>
              </div>
            </div>
          }

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium text-textBlack mb-1">
              Number of Stock to Add <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.numberOfStock}
              onChange={(e) => handleInputChange('numberOfStock', Number(e.target.value))}
              className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Enter quantity to add"
              required />

          </div>

          {/* Pricing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Cost of Item (₦)
              </label>
              <input
                type="text"
                value={formData.costOfItem}
                onChange={handleCostChange}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter cost price" />

            </div>

            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Sale Price (₦)
              </label>
              <input
                type="text"
                value={formData.price}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter sale price" />

            </div>
          </div>

          {/* Total Value Display */}
          {formData.numberOfStock > 0 && formData.price &&
          <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-textDarkGrey">Total Value of Stock Addition</div>
              <div className="text-lg font-semibold text-textBlack">
                ₦{(formData.numberOfStock * parseFloat(formData.price || '0')).toLocaleString()}
              </div>
            </div>
          }

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-strokeGreyThree">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-strokeGreyThree text-textBlack rounded-lg hover:bg-gray-50 transition-colors">

              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">

              <PackageIcon />
              {isLoading ? 'Adding Stock...' : 'Add Stock to Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>);

};
