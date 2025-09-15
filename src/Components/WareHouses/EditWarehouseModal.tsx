import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useWarehouse } from "../../contexts/WarehouseContext";
import type { Warehouse } from "../../data/warehouseData";

interface EditWarehouseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: Warehouse | null;
}

export function EditWarehouseModal({ open, onOpenChange, warehouse }: EditWarehouseModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [isMainWarehouse, setIsMainWarehouse] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateWarehouse } = useWarehouse();

  useEffect(() => {
    if (warehouse && open) {
      setName(warehouse.name);
      setLocation(warehouse.location);
      setIsMainWarehouse(warehouse.isMainWarehouse);
      setImagePreview(warehouse.image);
      setSelectedImage(null);
    }
  }, [warehouse, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!warehouse) return;

    setIsLoading(true);
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      
      // Append all warehouse data fields
      formData.append('name', name.trim());
      formData.append('location', location.trim());
      formData.append('isMainWarehouse', isMainWarehouse.toString());
      
      // Append the image file if a new one was selected
      if (selectedImage && selectedImage instanceof File) {
        formData.append('image', selectedImage);
      }

      await updateWarehouse(warehouse.id, formData);
      toast.success(`${name} has been updated successfully`);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update warehouse:', error);
      toast.error('Failed to update warehouse. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !warehouse) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-textBlack">Edit Warehouse</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-textDarkGrey hover:text-textBlack transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Warehouse Image */}
            <div>
              <label className="block text-sm font-medium text-textBlack mb-2">
                Warehouse Image
              </label>
              <div className="space-y-3">
                {imagePreview && (
                  <div className="w-full h-32 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-textDarkGrey file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>
            </div>

            {/* Warehouse Name */}
            <div>
              <label className="block text-sm font-medium text-textBlack mb-2">
                Warehouse Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter warehouse name"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-textBlack mb-2">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter warehouse location"
                required
              />
            </div>

            {/* Main Warehouse Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isMainWarehouse"
                checked={isMainWarehouse}
                onChange={(e) => setIsMainWarehouse(e.target.checked)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="isMainWarehouse" className="text-sm font-medium text-textBlack">
                Main Warehouse
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 px-4 py-2 border border-strokeGreyThree text-textBlack rounded-full hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primaryGradient text-white px-4 py-2 rounded-full hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Update Warehouse"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
