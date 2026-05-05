import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import useBreakpoint from "../../hooks/useBreakpoint";
import type { Product as _Product } from "../../data/warehouseData";

interface ViewInventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any; // Using any to handle API response structure
}

export function ViewInventoryModal({ open, onOpenChange, product }: ViewInventoryModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const _isMobile = useBreakpoint("max", 640);

  if (!product) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const batchHistory = [
  { sn: 1, dateTime: "2024-01-15 10:30 AM", stockNumber: 50, stockValue: formatCurrency(3400000) },
  { sn: 2, dateTime: "2024-01-10 02:15 PM", stockNumber: 75, stockValue: formatCurrency(5100000) },
  { sn: 3, dateTime: "2024-01-05 09:45 AM", stockNumber: 100, stockValue: formatCurrency(6800000) },
  { sn: 4, dateTime: "2024-01-01 11:20 AM", stockNumber: 125, stockValue: formatCurrency(8500000) }];


  const tabs = [
  { id: "details", label: "Details" },
  { id: "stats", label: "Stats" },
  { id: "batch-history", label: "Batch History" }];


  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      size="large"
      layout="right"
      leftHeaderComponents={
      <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs border border-strokeGreyThree`}>
            {(product.status || 'active').toUpperCase()}
          </span>
          <h2 className="text-lg font-semibold text-textBlack">{product.name}</h2>
        </div>
      }>

      <div className="p-4 sm:p-6 h-full overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-strokeGreyTwo">
            {tabs.map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ?
              "border-primary text-primary bg-yellow-50" :
              "border-transparent text-textDarkGrey hover:text-textBlack"}`
              }>

                {tab.label}
                {tab.id === "batch-history" &&
              <span className="ml-2 px-2 py-1 bg-gray-200 text-xs rounded-full">14</span>
              }
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "details" &&
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                    {product.image ?
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading product image:', product.image);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }} /> :

                  null}
                    <div className={`text-center ${product.image ? 'hidden' : ''}`}>
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">
                        📷
                      </div>
                      <p className="text-sm text-textDarkGrey">
                        {product.image ? 'Error loading image' : 'No image available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2 text-textBlack">
                      <span className="w-4 h-4 rounded-full bg-primary"></span>
                      ITEM DETAILS
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-textDarkGrey">Name</span>
                        <span className="text-textBlack">{product.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-textDarkGrey">Class</span>
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                          {(product.status || 'active').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-textDarkGrey">Category</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          {(
                        product.category?.name ||
                        product.categoryName ||
                        product.inventoryCategory?.name ||
                        product.inventoryCategoryName ||
                        product.category ||
                        'UNCATEGORIZED').
                        toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-textDarkGrey">Sale Price</span>
                        <span className="text-success font-medium">
                          {formatCurrency(product.salePrice?.minimumInventoryBatchPrice || product.salePrice?.maximumInventoryBatchPrice || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-textDarkGrey">Stock Level</span>
                        <span className="text-textBlack">
                          {product.totalRemainingQuantities || 0}/{product.totalInitialQuantities || product.totalRemainingQuantities || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          {activeTab === "stats" &&
          <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-strokeGreyTwo rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      📦
                    </div>
                    <div>
                      <p className="text-sm text-textDarkGrey">Total Initial Quantities</p>
                      <p className="text-2xl font-bold text-textBlack">{product.totalInitialQuantities || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-strokeGreyTwo rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      📦
                    </div>
                    <div>
                      <p className="text-sm text-textDarkGrey">Remaining Quantities</p>
                      <p className="text-2xl font-bold text-textBlack">{product.totalRemainingQuantities || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-strokeGreyTwo rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      💰
                    </div>
                    <div>
                      <p className="text-sm text-textDarkGrey">Total Value</p>
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency((product.salePrice?.minimumInventoryBatchPrice || product.salePrice?.maximumInventoryBatchPrice || 0) * (product.totalRemainingQuantities || 0))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-strokeGreyTwo rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      📊
                    </div>
                    <div>
                      <p className="text-sm text-textDarkGrey">Stock Percentage</p>
                      <p className="text-2xl font-bold text-textBlack">
                        {Math.round((product.totalRemainingQuantities || 0) / (product.totalInitialQuantities || product.totalRemainingQuantities || 1) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          {activeTab === "batch-history" &&
          <div className="space-y-4">
              <h3 className="text-lg font-semibold text-textBlack">Batch History</h3>
              <div className="bg-white border border-strokeGreyTwo rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-strokeGreyTwo">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-textBlack">S/N</th>
                        <th className="text-left py-3 px-4 font-medium text-textBlack">Date & Time</th>
                        <th className="text-left py-3 px-4 font-medium text-textBlack">Stock Number</th>
                        <th className="text-left py-3 px-4 font-medium text-textBlack">Stock Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchHistory.map((batch) =>
                    <tr key={batch.sn} className="border-b border-strokeGreyTwo">
                          <td className="py-3 px-4 text-textDarkGrey">{batch.sn}</td>
                          <td className="py-3 px-4 text-textDarkGrey">{batch.dateTime}</td>
                          <td className="py-3 px-4 text-textDarkGrey">{batch.stockNumber}</td>
                          <td className="py-3 px-4 text-success font-medium">{batch.stockValue}</td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </Modal>);

}
