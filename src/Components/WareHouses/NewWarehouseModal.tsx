import React, { useState, useRef } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useWarehouse } from "../../contexts/WarehouseContext";
import { toast } from "react-toastify";
import useBreakpoint from "../../hooks/useBreakpoint";

interface NewWarehouseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export function NewWarehouseModal({ open, onOpenChange }: NewWarehouseModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isMainWarehouse, setIsMainWarehouse] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addWarehouse } = useWarehouse();
  const isMobile = useBreakpoint("max", 640);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !location) {
      toast.error("Please fill in the required fields");
      return;
    }

    // Add warehouse to context
    addWarehouse({
      name,
      location,
      totalItems: 0,
      totalValue: 0,
      isMainWarehouse,
      isActive: true,
      image: imagePreview || '/assets/Images/logo.png', // Default image if none selected
    });

    toast.success(`${name} has been added successfully`);

    // Reset form and close modal
    setName("");
    setLocation("");
    setDescription("");
    setIsMainWarehouse(false);
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      size={isMobile ? "large" : "medium"}
      layout={isMobile ? "default" : "right"}
      leftHeaderComponents={
        <h2 className="text-lg font-semibold text-textBlack">New Warehouse</h2>
      }
    >
      <div className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-textBlack">
              Warehouse Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter warehouse name"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-textBlack">
              Location *
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-textBlack">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter warehouse description..."
              rows={isMobile ? 2 : 3}
              className="w-full px-3 py-2 sm:py-3 border border-strokeGreyThree rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-textBlack">
              Warehouse Image
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Warehouse preview"
                  className={`w-full ${isMobile ? 'h-24' : 'h-32'} object-cover rounded-lg border border-strokeGreyThree`}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-errorTwo text-white p-1 rounded-full hover:bg-errorTwo/90 transition-colors"
                >
                  <XIcon />
                </button>
              </div>
            ) : (
              <div
                className={`w-full ${isMobile ? 'h-24' : 'h-32'} border-2 border-dashed border-strokeGreyThree rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <div className="text-textDarkGrey mb-2 flex justify-center">
                    <UploadIcon />
                  </div>
                  <p className="text-xs sm:text-sm text-textDarkGrey">
                    {isMobile ? "Upload image" : "Click to upload image"}
                  </p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="main-warehouse"
              type="checkbox"
              checked={isMainWarehouse}
              onChange={(e) => setIsMainWarehouse(e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-100 border-strokeGreyThree rounded focus:ring-primary/20 focus:ring-2"
            />
            <label htmlFor="main-warehouse" className="text-sm text-textBlack">
              Set as main warehouse
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto px-4 py-2 border border-strokeGreyThree text-textBlack rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              Create Warehouse
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}