import { useState } from "react";
import { Modal } from "../ModalComponent/Modal";

interface ViewRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: any; // Using any to handle API response structure
  warehouseName?: string;
  productName?: string;
}

export function ViewRequestModal({ 
  open, 
  onOpenChange, 
  request, 
  warehouseName,
  productName 
}: ViewRequestModalProps) {
  const [activeTab, setActiveTab] = useState("details");

  if (!request) return null;

  // Helper function to safely extract string values from objects
  const getDisplayValue = (value: any): string => {
    if (!value) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      // Handle common object structures
      if (value.name) return value.name;
      if (value.firstname && value.lastname) return `${value.firstname} ${value.lastname}`;
      if (value.email) return value.email;
      if (value.id) return value.id;
      return JSON.stringify(value);
    }
    return String(value);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-gold/10 text-gold border-gold/20';
      case 'partial':
        return 'bg-brightBlue/10 text-brightBlue border-brightBlue/20';
      case 'rejected':
        return 'bg-errorTwo/10 text-errorTwo border-errorTwo/20';
      default:
        return 'bg-strokeGreyThree text-textDarkGrey border-strokeGreyThree';
    }
  };

  const tabs = [
    { id: "details", label: "Details" },
    { id: "timeline", label: "Timeline" },
  ];

  const timelineEvents = [
    {
      date: request.createdAt || request.requestDate,
      title: "Request Created",
      description: `Transfer request created for ${request.requestedQuantity || 0} units`,
      status: "completed"
    },
    ...(request.status?.toLowerCase() === 'fulfilled' && request.updatedAt ? [{
      date: request.updatedAt,
      title: "Request Fulfilled",
      description: `${request.fulfilledQuantity || 0} units fulfilled`,
      status: "completed"
    }] : []),
    ...(request.status?.toLowerCase() === 'rejected' && request.updatedAt ? [{
      date: request.updatedAt,
      title: "Request Rejected",
      description: getDisplayValue(request.rejectionReason) !== 'N/A' ? getDisplayValue(request.rejectionReason) : "Request was rejected",
      status: "rejected"
    }] : [])
  ];

  return (
    <Modal 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      size="large"
      layout="right"
      leftHeaderComponents={
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(request.status)}`}>
            {(request.status || 'pending').toUpperCase()}
          </span>
          <h2 className="text-lg font-semibold text-textBlack">
            Request #{request.requestId || request.id}
          </h2>
        </div>
      }
      rightHeaderComponents={
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-strokeGreyThree text-textDarkGrey hover:bg-strokeGreyTwo"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Request Overview */}
            <div className="bg-strokeGreyThree rounded-lg p-4">
              <h3 className="text-lg font-semibold text-textBlack mb-4">Request Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-textDarkGrey">Request ID</label>
                  <p className="text-textBlack font-medium">{request.requestId || request.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-textDarkGrey">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs border mt-1 ${getStatusColor(request.status)}`}>
                    {(request.status || 'pending').toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-textDarkGrey">From Warehouse</label>
                  <p className="text-textBlack">{getDisplayValue(request.fromWarehouse) !== 'N/A' ? getDisplayValue(request.fromWarehouse) : warehouseName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-textDarkGrey">To Warehouse</label>
                  <p className="text-textBlack">{getDisplayValue(request.toWarehouse)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-textDarkGrey">Product</label>
                  <p className="text-textBlack">
                    {productName ||
                     getDisplayValue(request.inventory) ||
                     getDisplayValue(request.productName) ||
                     request.productId ||
                     request.inventoryId ||
                     'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-textDarkGrey">Request Date</label>
                  <p className="text-textBlack">{formatDate(request.createdAt || request.requestDate)}</p>
                </div>
              </div>
            </div>

            {/* Quantity Information */}
            <div className="bg-strokeGreyThree rounded-lg p-4">
              <h3 className="text-lg font-semibold text-textBlack mb-4">Quantity Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-textDarkGrey">Requested Quantity</label>
                  <p className="text-2xl font-bold text-textBlack">{request.requestedQuantity || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-textDarkGrey">Fulfilled Quantity</label>
                  <p className="text-2xl font-bold text-success">{request.fulfilledQuantity || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-textDarkGrey">Remaining</label>
                  <p className="text-2xl font-bold text-errorTwo">
                    {(request.requestedQuantity || 0) - (request.fulfilledQuantity || 0)}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-textDarkGrey mb-1">
                  <span>Fulfillment Progress</span>
                  <span>
                    {request.requestedQuantity > 0 
                      ? Math.round(((request.fulfilledQuantity || 0) / request.requestedQuantity) * 100)
                      : 0
                    }%
                  </span>
                </div>
                <div className="w-full bg-strokeGreyTwo rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${request.requestedQuantity > 0 
                        ? Math.min(((request.fulfilledQuantity || 0) / request.requestedQuantity) * 100, 100)
                        : 0
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(request.notes || request.rejectionReason || request.requestedBy || request.fulfilledBy) && (
              <div className="bg-strokeGreyThree rounded-lg p-4">
                <h3 className="text-lg font-semibold text-textBlack mb-4">Additional Information</h3>
                <div className="space-y-3">
                  {request.requestedBy && (
                    <div>
                      <label className="text-sm font-medium text-textDarkGrey">Requested By</label>
                      <p className="text-textBlack">{getDisplayValue(request.requestedBy)}</p>
                    </div>
                  )}
                  {request.fulfilledBy && (
                    <div>
                      <label className="text-sm font-medium text-textDarkGrey">Fulfilled By</label>
                      <p className="text-textBlack">{getDisplayValue(request.fulfilledBy)}</p>
                    </div>
                  )}
                  {request.notes && (
                    <div>
                      <label className="text-sm font-medium text-textDarkGrey">Notes</label>
                      <p className="text-textBlack bg-white p-3 rounded border">{getDisplayValue(request.notes)}</p>
                    </div>
                  )}
                  {request.rejectionReason && (
                    <div>
                      <label className="text-sm font-medium text-textDarkGrey">Rejection Reason</label>
                      <p className="text-errorTwo bg-white p-3 rounded border border-errorTwo/20">{getDisplayValue(request.rejectionReason)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-textBlack">Request Timeline</h3>
            <div className="space-y-4">
              {timelineEvents.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      event.status === 'completed' ? 'bg-success' : 
                      event.status === 'rejected' ? 'bg-errorTwo' : 'bg-strokeGreyTwo'
                    }`}></div>
                    {index < timelineEvents.length - 1 && (
                      <div className="w-px h-8 bg-strokeGreyTwo mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-textBlack">{event.title}</h4>
                        <p className="text-sm text-textDarkGrey">{event.description}</p>
                      </div>
                      <span className="text-xs text-textGrey">{formatDate(event.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
