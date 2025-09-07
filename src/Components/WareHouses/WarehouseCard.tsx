import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Warehouse } from "../../data/warehouseData";
import { useWarehouse } from "../../contexts/WarehouseContext";
import { WarehouseManagerModal } from "./WarehouseManagerModal";
import { toast } from "react-toastify";
import useBreakpoint from "../../hooks/useBreakpoint";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";

interface WarehouseCardProps {
  warehouse: Warehouse;
}

export function WarehouseCard({ warehouse }: WarehouseCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
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
        // Settings functionality
        toast.info('Settings feature coming soon');
        break;
      case 3:
        handleArchive();
        break;
      case 4:
        handleDelete();
        break;
    }
  };

  return (
    <div 
      className={`group flex flex-col items-center justify-between sm:justify-normal w-full max-w-[450px] h-max sm:h-[400px] px-[10px] py-[25px] sm:py-[20px] gap-2.5 border-[0.4px] border-strokeGreyTwo bg-white hover:border-strokeCream hover:cursor-pointer hover:bg-[#f6f7f8] transition-colors duration-300 ease-in-out rounded-[20px] ${
        !warehouse.isActive ? 'opacity-60' : ''
      }`}
      onClick={() => {
        if (!isMobile) navigate(`/warehouses/${warehouse.id}`);
      }}
    >
      {/* Notification Badge */}
      {warehouse.totalItems > 0 && (
        <div className="flex items-center justify-center bg-[#FDEEC2] w-max h-[24px] pl-3 pr-0.5 gap-2 text-textDarkGrey text-[11px] font-medium md:font-normal rounded-full">
          Warehouse Active
          <span className="flex items-center justify-center w-[20px] h-[20px] bg-chalk shadow-innerCustom text-xs font-medium text-primary rounded-full">
            {warehouse.totalItems}
          </span>
        </div>
      )}

      {/* Warehouse Image and Info */}
      <div className="flex flex-col items-center justify-center pb-4 sm:p-0 flex-1">
        <div className="w-[143px] h-[143px] sm:w-[128px] sm:h-[128px] overflow-hidden rounded-lg mb-4">
          <img
            src={warehouse.image}
            alt={`${warehouse.name} Image`}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="font-secondary font-bold text-lg sm:text-xl text-textBlack uppercase">
            {warehouse.name}
          </h2>
          <p className="text-sm text-textDarkGrey">{warehouse.location}</p>
          
          {/* Warehouse Details */}
          <div className="space-y-1 mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-textDarkGrey">Total Value:</span>
              <span className="font-medium text-success">
                {formatCurrency(warehouse.totalValue)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-textDarkGrey">Type:</span>
              <span className={`px-2 py-1 rounded-full ${
                warehouse.isMainWarehouse 
                  ? 'bg-warning/10 text-warning' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {warehouse.isMainWarehouse ? 'Main' : 'Branch'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-textDarkGrey">Status:</span>
              <span className={`px-2 py-1 rounded-full ${
                warehouse.isActive 
                  ? 'bg-success/10 text-success' 
                  : 'bg-errorTwo/10 text-errorTwo'
              }`}>
                {warehouse.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {/* Manager Count */}
            {warehouse.managers && warehouse.managers.length > 0 && (
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-textDarkGrey">Managers:</span>
                <span className="font-medium text-primary">
                  {warehouse.managers.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Action Button */}
      {isMobile && (
        <div className="flex gap-2 w-full">
          <ProceedButton
            type="button"
            onClick={() => navigate(`/warehouses/${warehouse.id}`)}
            className="w-14 h-14"
            disabled={false}
          />
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
              className="w-14 h-14 border border-strokeGreyThree text-textBlack rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              ⋯
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 bottom-full mb-1 bg-white border border-strokeGreyThree rounded-lg shadow-lg z-10 min-w-[120px]">
                {dropDownItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownClick(index);
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-textBlack hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Actions */}
      {!isMobile && (
        <div className="flex gap-2 w-full mt-4">
          <Link 
            to={`/warehouses/${warehouse.id}`}
            className="flex-1 bg-primary text-white text-center py-2 px-4 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View Details
          </Link>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
              className="border border-strokeGreyThree text-textBlack py-2 px-3 rounded-full text-sm hover:bg-gray-50 transition-colors"
            >
              ⋯
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 bottom-full mb-1 bg-white border border-strokeGreyThree rounded-lg shadow-lg z-10 min-w-[120px]">
                {dropDownItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownClick(index);
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-textBlack hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manager Modal */}
      <WarehouseManagerModal
        open={managerModalOpen}
        onOpenChange={setManagerModalOpen}
        warehouseId={warehouse.id}
        warehouseName={warehouse.name}
      />
    </div>
  );
}