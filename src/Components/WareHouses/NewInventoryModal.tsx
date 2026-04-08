import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useInventoryApi, useInventoryCategories } from "../../services/inventoryApi";
import { useWarehouses } from "../../services/warehouseApi";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import useBreakpoint from "../../hooks/useBreakpoint";
import { useApiCall } from "../../utils/useApiCall";

interface NewInventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId?: string;
}

export function NewInventoryModal({ open, onOpenChange, warehouseId }: NewInventoryModalProps) {
  const { id } = useParams();
  const currentWarehouseId = warehouseId || id;
  const isMobile = useBreakpoint("max", 640);

  // Use exact same fields as main inventory creation
  const [formData, setFormData] = useState({
    class: "",
    inventoryCategoryId: "",
    inventorySubCategoryId: "",
    name: "",
    manufacturerName: "",
    dateOfManufacture: "",
    sku: "",
    numberOfStock: "",
    costOfItem: "",
    price: "",
    inventoryImage: null as File | null,
    warehouseId: currentWarehouseId || ""
  });

  const [availableSubCategories, setAvailableSubCategories] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { createInventoryItem: _createInventoryItem } = useInventoryApi();
  const { data: warehouses = [] } = useWarehouses();
  const { data: categories = [] } = useInventoryCategories();
  const { apiCall } = useApiCall();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // When category changes, update available subcategories
    if (field === 'inventoryCategoryId') {
      const selectedCategory = categories.find((cat: any) => cat.id === value);
      setAvailableSubCategories(selectedCategory?.subCategories || []);
      // Reset subcategory when category changes
      setFormData((prev) => ({
        ...prev,
        inventorySubCategoryId: ''
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, inventoryImage: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const _formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    if (numericValue) {
      const formatted = parseFloat(numericValue).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
      });
      return formatted;
    }
    return '';
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    setFormData((prev) => ({ ...prev, costOfItem: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    setFormData((prev) => ({ ...prev, price: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.class || !formData.inventoryCategoryId || !formData.inventorySubCategoryId || !formData.name || !formData.manufacturerName || !formData.numberOfStock || !formData.costOfItem || !formData.price || !formData.inventoryImage) {
      toast.error("Please fill in all required fields including image upload");
      return;
    }

    if (!currentWarehouseId) {
      toast.error("Warehouse ID is required");
      return;
    }

    const stockNum = parseInt(formData.numberOfStock);
    const costNum = parseFloat(formData.costOfItem);
    const priceNum = parseFloat(formData.price);

    if (isNaN(stockNum) || isNaN(costNum) || isNaN(priceNum)) {
      toast.error("Please enter valid numbers for stock, cost, and price");
      return;
    }

    setIsLoading(true);
    try {
      // Use same approach as main inventory system - FormData for file uploads
      const submissionData = new FormData();

      // Add all form fields to FormData
      submissionData.append('class', formData.class);
      submissionData.append('inventoryCategoryId', formData.inventoryCategoryId);
      submissionData.append('inventorySubCategoryId', formData.inventorySubCategoryId);
      submissionData.append('name', formData.name);
      submissionData.append('manufacturerName', formData.manufacturerName);
      submissionData.append('dateOfManufacture', formData.dateOfManufacture);
      submissionData.append('sku', formData.sku);
      submissionData.append('numberOfStock', formData.numberOfStock);
      submissionData.append('costOfItem', formData.costOfItem);
      submissionData.append('price', formData.price);
      submissionData.append('warehouseId', currentWarehouseId); // Add warehouse assignment

      // Add file if present
      if (formData.inventoryImage instanceof File) {
        submissionData.append('inventoryImage', formData.inventoryImage);
      }

      console.log('Creating inventory with FormData submission');

      // Use direct API call with FormData (same as main inventory)
      await apiCall({
        endpoint: "/v1/inventory/create",
        method: "post",
        data: submissionData,
        headers: { "Content-Type": "multipart/form-data" },
        successMessage: "Inventory created successfully!"
      });

      toast.success('Inventory item added successfully');

      // Reset form and close modal
      setFormData({
        class: "",
        inventoryCategoryId: "",
        inventorySubCategoryId: "",
        name: "",
        manufacturerName: "",
        dateOfManufacture: "",
        sku: "",
        numberOfStock: "",
        costOfItem: "",
        price: "",
        inventoryImage: null,
        warehouseId: currentWarehouseId || ""
      });
      setAvailableSubCategories([]);
      setImagePreview("");
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      toast.error('Failed to add inventory item');
    } finally {
      setIsLoading(false);
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
      }>

      <div className="p-4 sm:p-6 h-full overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Warehouse Selection */}
          <div className="space-y-2">
            <label htmlFor="warehouse" className="block text-sm font-medium text-textBlack">
              Warehouse *
            </label>
            <select
              id="warehouse"
              value={formData.warehouseId}
              onChange={(e) => handleInputChange('warehouseId', e.target.value)}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              required>

              <option value="">Select Warehouse</option>
              {warehouses.map((warehouse: any) =>
              <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.location}
                </option>
              )}
            </select>
          </div>

          {/* Inventory Class */}
          <div className="space-y-2">
            <label htmlFor="inventory-class" className="block text-sm font-medium text-textBlack">
              Choose Inventory Class *
            </label>
            <select
              id="inventory-class"
              value={formData.class}
              onChange={(e) => handleInputChange('class', e.target.value)}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              required>

              <option value="">Choose Inventory Class</option>
              <option value="REGULAR">REGULAR</option>
              <option value="RETURNED">RETURNED</option>
              <option value="REFURBISHED">REFURBISHED</option>
            </select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="item-category" className="block text-sm font-medium text-textBlack">
              Choose Item Category *
            </label>
            <select
              id="item-category"
              value={formData.inventoryCategoryId}
              onChange={(e) => {
                handleInputChange('inventoryCategoryId', e.target.value);
                // Update subcategories when category changes - use children array
                const selectedCategory = categories.find((cat: any) => cat.id === e.target.value);
                setAvailableSubCategories(selectedCategory?.children || []);
                setFormData((prev) => ({ ...prev, inventorySubCategoryId: '' }));
              }}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              required>

              <option value="">Choose Item Category</option>
              {categories.map((category: any) =>
              <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              )}
            </select>
          </div>

          {/* Sub Category - Always visible when category is selected */}
          {formData.inventoryCategoryId &&
          <div className="space-y-2">
              <label htmlFor="item-subcategory" className="block text-sm font-medium text-textBlack">
                Choose Item Sub Category *
              </label>
              <select
              id="item-subcategory"
              value={formData.inventorySubCategoryId}
              onChange={(e) => handleInputChange('inventorySubCategoryId', e.target.value)}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              required>

                <option value="">Choose Sub Category</option>
                {availableSubCategories.length > 0 ?
              availableSubCategories.map((subCategory: any) =>
              <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
              ) :

              <option value="" disabled>No subcategories available</option>
              }
              </select>
            </div>
          }

          {/* Item Name */}
          <div className="space-y-2">
            <label htmlFor="item-name" className="block text-sm font-medium text-textBlack">
              Item Name *
            </label>
            <input
              id="item-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Item Name"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              required />

          </div>

          {/* Manufacturer Name */}
          <div className="space-y-2">
            <label htmlFor="manufacturer-name" className="block text-sm font-medium text-textBlack">
              Manufacturer Name *
            </label>
            <input
              id="manufacturer-name"
              type="text"
              value={formData.manufacturerName}
              onChange={(e) => handleInputChange('manufacturerName', e.target.value)}
              placeholder="Manufacturer Name"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              required />

          </div>

          {/* Date of Manufacture */}
          <div className="space-y-2">
            <label htmlFor="date-of-manufacture" className="block text-sm font-medium text-textBlack">
              Date of Manufacture
            </label>
            <input
              id="date-of-manufacture"
              type="date"
              value={formData.dateOfManufacture}
              onChange={(e) => handleInputChange('dateOfManufacture', e.target.value)}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base" />

          </div>

          {/* SKU */}
          <div className="space-y-2">
            <label htmlFor="sku" className="block text-sm font-medium text-textBlack">
              SKU
            </label>
            <input
              id="sku"
              type="text"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              placeholder="SKU Code"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base" />

          </div>

          {/* Number of Stock */}
          <div className="space-y-2">
            <label htmlFor="number-of-stock" className="block text-sm font-medium text-textBlack">
              Number of Stock *
            </label>
            <input
              id="number-of-stock"
              type="number"
              value={formData.numberOfStock}
              onChange={(e) => handleInputChange('numberOfStock', e.target.value)}
              placeholder="Number of Stock"
              min="0"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              required />

          </div>

          {/* Cost of Item */}
          <div className="space-y-2">
            <label htmlFor="cost-of-item" className="block text-sm font-medium text-textBlack">
              Cost of Item *
            </label>
            <input
              id="cost-of-item"
              type="text"
              value={formData.costOfItem}
              onChange={handleCostChange}
              placeholder="₦0"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              required />

          </div>

          {/* Sale Price */}
          <div className="space-y-2">
            <label htmlFor="price-of-item" className="block text-sm font-medium text-textBlack">
              Sale Price *
            </label>
            <input
              id="price-of-item"
              type="text"
              value={formData.price}
              onChange={handlePriceChange}
              placeholder="₦0"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              required />

          </div>

          {/* Inventory Image */}
          <div className="space-y-2">
            <label htmlFor="inventory-image" className="block text-sm font-medium text-textBlack">
              Inventory Image <span className="text-red-500">*</span>
            </label>
            <input
              id="inventory-image"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              onChange={handleImageChange}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              required />

            {imagePreview &&
            <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
              </div>
            }
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto px-4 py-2 border border-strokeGreyThree text-textBlack rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">

              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base disabled:opacity-50">

              {isLoading ? "Adding..." : "Add Inventory Item"}
            </button>
          </div>
        </form>
      </div>
    </Modal>);

}
