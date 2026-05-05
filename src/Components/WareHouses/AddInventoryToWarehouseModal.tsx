import React, { useState, useEffect as _useEffect } from 'react';
import { useInventoryApi, useInventoryCategories } from '../../services/inventoryApi';
import { useWarehouses } from '../../services/warehouseApi';
import { toast } from 'react-toastify';

interface AddInventoryToWarehouseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId?: string;
  onSuccess?: () => void;
}

const PlusIcon = () =>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>;


export const AddInventoryToWarehouseModal: React.FC<AddInventoryToWarehouseModalProps> = ({
  open,
  onOpenChange,
  warehouseId,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    quantity: 0,
    unitPrice: 0,
    minStockLevel: 0,
    maxStockLevel: 100,
    warehouseId: warehouseId || '',
    sku: '',
    barcode: '',
    supplier: '',
    location: ''
  });
  const [availableSubCategories, setAvailableSubCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: warehouses = [] } = useWarehouses();
  const { data: categories = [] } = useInventoryCategories();
  const { createInventoryItem } = useInventoryApi();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // When category changes, update available subcategories
    if (field === 'category') {
      const selectedCategory = categories.find((cat: any) => cat.id === value);
      setAvailableSubCategories(selectedCategory?.children || []); // Use children array
      // Reset subcategory when category changes
      setFormData((prev) => ({
        ...prev,
        subCategory: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.warehouseId || formData.quantity <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure warehouseId is properly included
      const inventoryPayload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subCategory: formData.subCategory,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        minStockLevel: formData.minStockLevel,
        maxStockLevel: formData.maxStockLevel,
        warehouseId: formData.warehouseId, // Critical: Links to warehouse
        sku: formData.sku,
        barcode: formData.barcode,
        supplier: formData.supplier,
        location: formData.location
      };

      console.log('Adding inventory to warehouse:', inventoryPayload);

      await createInventoryItem(inventoryPayload);

      toast.success('Inventory item added to warehouse successfully');

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        subCategory: '',
        quantity: 0,
        unitPrice: 0,
        minStockLevel: 0,
        maxStockLevel: 100,
        warehouseId: warehouseId || '',
        sku: '',
        barcode: '',
        supplier: '',
        location: ''
      });
      setAvailableSubCategories([]);

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      toast.error('Failed to add inventory item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-textBlack">Add Inventory to Warehouse</h2>
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
              Warehouse <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.warehouseId}
              onChange={(e) => handleInputChange('warehouseId', e.target.value)}
              className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required>

              <option value="">Select a warehouse</option>
              {warehouses.map((warehouse: any) =>
              <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.location}
                </option>
              )}
            </select>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter item name"
                required />

            </div>

            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">

                <option value="">Select category</option>
                {categories.map((category: any) =>
                <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Sub Category */}
          {formData.category && availableSubCategories.length > 0 &&
          <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Sub Category
              </label>
              <select
              value={formData.subCategory}
              onChange={(e) => handleInputChange('subCategory', e.target.value)}
              className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">

                <option value="">Select sub category</option>
                {availableSubCategories.map((subCategory: any) =>
              <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </option>
              )}
              </select>
            </div>
          }

          {/* SKU and Barcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter SKU" />

            </div>

            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Barcode
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter barcode" />

            </div>
          </div>

          {/* Quantity and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter quantity"
                required />

            </div>

            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Unit Price (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange('unitPrice', Number(e.target.value))}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter unit price" />

            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Minimum Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => handleInputChange('minStockLevel', Number(e.target.value))}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Minimum stock level" />

            </div>

            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Maximum Stock Level
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxStockLevel}
                onChange={(e) => handleInputChange('maxStockLevel', Number(e.target.value))}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Maximum stock level" />

            </div>
          </div>

          {/* Supplier and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter supplier name" />

            </div>

            <div>
              <label className="block text-sm font-medium text-textBlack mb-1">
                Location in Warehouse
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g., Aisle A, Shelf 3" />

            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-textBlack mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Enter item description" />

          </div>

          {/* Total Value Display */}
          {formData.quantity > 0 && formData.unitPrice > 0 &&
          <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-textDarkGrey">Total Value</div>
              <div className="text-lg font-semibold text-textBlack">
                ₦{(formData.quantity * formData.unitPrice).toLocaleString()}
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

              <PlusIcon />
              {isLoading ? 'Adding...' : 'Add to Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>);

};
