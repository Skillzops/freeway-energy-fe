import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Warehouse } from "../../data/warehouseData";
import { useWarehouse } from "../../contexts/WarehouseContext";
import { WarehouseManagerModal } from "./WarehouseManagerModal";
import { EditWarehouseModal } from "./EditWarehouseModal";
import { toast } from "react-toastify";
import useBreakpoint from "../../hooks/useBreakpoint";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";

interface WarehouseCardProps {
  warehouse: Warehouse;
}

export function WarehouseCard({ warehouse }: WarehouseCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { updateWarehouse, deleteWarehouse, toggleWarehouseStatus } = useWarehouse();
  const isMobile = useBreakpoint("max", 640);
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleToggleStatus = async () => {
    try {
      await toggleWarehouseStatus(warehouse.id);
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
    setDropdownOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${warehouse.name}"? This action cannot be undone.`)) {
      try {
        await deleteWarehouse(warehouse.id);
      } catch (error) {
        console.error('Failed to delete warehouse:', error);
      }
    }
    setDropdownOpen(false);
  };

  const handleArchive = async () => {
    try {
      await updateWarehouse(warehouse.id, { isActive: false });
    } catch (error) {
      console.error('Failed to archive warehouse:', error);
    }
    setDropdownOpen(false);
  };

  const dropDownItems = [
    warehouse.isActive ? 'Deactivate' : 'Activate',
    'Manage Managers',
    'Edit Warehouse',
    'Settings',
    'Archive',
    'Delete'
  ];

  const handleDropdownClick = (index: number) => {
    switch (index) {
      case 0:
        handleToggleStatus();
        break;
      case 1:
        setManagerModalOpen(true);
        break;
      case 2:
        setEditModalOpen(true);
        break;
      case 3:
        // Settings functionality
        toast.info('Settings feature coming soon');
        break;
      case 4:
        handleArchive();
        break;
      case 5:
        handleDelete();
        break;
    }
  };

  return (
    <>
      <div 
        className={`group flex flex-col w-full h-auto border border-border bg-card hover:bg-accent/5 hover:cursor-pointer transition-colors duration-300 ease-in-out rounded-[20px] overflow-hidden ${
          !warehouse.isActive ? 'opacity-60' : ''
        }`}
        onClick={() => {
          if (!isMobile) navigate(`/warehouses/${warehouse.id}`);
        }}
      >
        {/* Warehouse Image */}
        <div className="w-full h-48 sm:h-56 relative">
          <img
            src={warehouse.image}
            alt={`${warehouse.name} Image`}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1 sm:gap-2">
            <div className="bg-card/90 text-card-foreground border border-border shadow-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
              {warehouse.totalItems} Items
            </div>
            {!warehouse.isActive && (
              <div className="bg-destructive text-destructive-foreground px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
                Inactive
              </div>
            )}
          </div>
        </div>
        
        {/* Warehouse Info */}
        <div className="text-center space-y-2 px-4 py-4">
          <h2 className="font-secondary font-bold text-base sm:text-lg text-foreground uppercase line-clamp-2">
            {warehouse.name}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{warehouse.location}</p>
          
          {/* Warehouse Details */}
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Value:</span>
              <span className="font-medium text-success text-right">
                {formatCurrency(warehouse.totalValue)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Type:</span>
              <span className={`px-2 py-1 rounded-full text-[10px] ${
                warehouse.isMainWarehouse 
                  ? 'bg-warning/10 text-warning' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {warehouse.isMainWarehouse ? 'Main' : 'Branch'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status:</span>
              <span className={`px-2 py-1 rounded-full text-[10px] ${
                warehouse.isActive 
                  ? 'bg-success/10 text-success' 
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {warehouse.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {/* Manager Count */}
            {warehouse.managers && warehouse.managers.length > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Managers:</span>
                <span className="font-medium text-primary">
                  {warehouse.managers.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {isMobile ? (
          <div className="flex gap-2 w-full px-4 pb-4">
            <ProceedButton
              type="button"
              onClick={() => navigate(`/warehouses/${warehouse.id}`)}
              className="flex-1 h-12"
              disabled={false}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditModalOpen(true);
              }}
              className="w-12 h-12 border border-strokeGreyThree text-textBlack rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m18 2 4 4-14 14H4v-4L18 2z"/>
              </svg>
            </button>
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="w-12 h-12 border border-strokeGreyThree text-textBlack rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                ⋯
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 bottom-full mb-1 bg-white border border-strokeGreyThree rounded-lg shadow-lg z-10 min-w-[120px]">
                  {dropDownItems.filter((_, index) => index !== 2).map((item, originalIndex) => {
                    const actualIndex = originalIndex >= 2 ? originalIndex + 1 : originalIndex;
                    return (
                      <button
                        key={actualIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDropdownClick(actualIndex);
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-textBlack hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-2 w-full px-4 pb-4">
            <Link 
              to={`/warehouses/${warehouse.id}`}
              className="flex-1 bg-primaryGradient text-white text-center py-2 px-4 rounded-full text-sm font-medium hover:opacity-90 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              View Details
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditModalOpen(true);
              }}
              className="w-10 h-10 border border-strokeGreyThree text-textBlack rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m18 2 4 4-14 14H4v-4L18 2z"/>
              </svg>
            </button>
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="w-10 h-10 border border-strokeGreyThree text-textBlack rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                ⋯
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 bottom-full mb-1 bg-white border border-strokeGreyThree rounded-lg shadow-lg z-10 min-w-[120px]">
                  {dropDownItems.filter((_, index) => index !== 2).map((item, originalIndex) => {
                    const actualIndex = originalIndex >= 2 ? originalIndex + 1 : originalIndex;
                    return (
                      <button
                        key={actualIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDropdownClick(actualIndex);
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-textBlack hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals moved outside the card */}
      <WarehouseManagerModal
        open={managerModalOpen}
        onOpenChange={setManagerModalOpen}
        warehouse={warehouse}
      />
      
      <EditWarehouseModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        warehouse={warehouse}
      />
    </>
  );
}
