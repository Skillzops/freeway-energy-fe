import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useGetRequest } from "../../utils/useApiCall";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import rootStore from "../../stores/rootStore";

interface AssignCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentID: string;
  onSuccess?: () => void;
}

const AssignCustomersModal: React.FC<AssignCustomersModalProps> = ({
  isOpen,
  onClose,
  agentID,
  onSuccess
}) => {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);

  const { agentAssignmentStore } = rootStore;

  // Fetch customers data
  const {
    data: customersData,
    isLoading,
    error,
    errorStates,
    mutate: refreshCustomers
  } = useGetRequest(
    `/v1/customers?page=${currentPage}&limit=${entriesPerPage}`,
    isOpen,
    60000
  );

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSubmit = async () => {
    try {
      // Get the selected customer objects
      const selectedCustomerObjects = customersData?.customers?.filter((customer: any) => 
        selectedCustomers.includes(customer.id)
      ) || [];

      // Add customers to the store
      agentAssignmentStore.addCustomers(agentID, selectedCustomerObjects);

      console.log('Assigned customers:', selectedCustomerObjects, 'to agent:', agentID);

      onSuccess?.();
      onClose();
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error assigning customers:', error);
    }
  };

  const isFormValid = selectedCustomers.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      layout="right"
      bodyStyle="pb-44"
    >
      <div className="flex flex-col items-center bg-white">
        <div className="flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleGrayGradientLeft">
          <h2 className="text-xl text-textBlack font-semibold font-secondary">
            Assign Customers to Agent
          </h2>
        </div>
        
        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          <DataStateWrapper
            isLoading={isLoading}
            error={error}
            errorStates={errorStates}
            refreshData={refreshCustomers}
            errorMessage="Failed to fetch customers"
          >
            <div className="w-full">
              <div className="mb-6">
                <p className="text-sm text-textDarkGrey mb-2 font-medium">
                  Select customers to assign to this agent:
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#A58730] rounded-full"></div>
                  <p className="text-xs text-textGrey">
                    {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto border border-strokeGreyTwo rounded-lg bg-white">
                {customersData?.customers?.map((customer: any) => (
                  <div
                    key={customer.id}
                    className={`flex items-center justify-between p-3 border-b border-strokeGreyTwo cursor-pointer transition-colors ${
                      selectedCustomers.includes(customer.id) 
                        ? 'bg-gradient-to-r from-[#FEF5DA] to-[#F8CB48]/20 border-l-4 border-l-[#A58730]' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleCustomerSelect(customer.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedCustomers.includes(customer.id)
                          ? 'bg-[#A58730] border-[#A58730]'
                          : 'border-strokeGreyTwo bg-white'
                      }`}>
                        {selectedCustomers.includes(customer.id) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          selectedCustomers.includes(customer.id) ? 'text-[#A58730]' : 'text-textBlack'
                        }`}>
                          {customer.firstname} {customer.lastname}
                        </p>
                        <p className="text-xs text-textGrey">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-xs text-textGrey">
                      {customer.location || 'No location'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 text-sm font-medium text-textDarkGrey bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-2xl transition-colors ${
                    isFormValid 
                      ? 'bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white hover:opacity-90 shadow-lg' 
                      : 'bg-gray-100 text-textDarkGrey cursor-not-allowed'
                  }`}
                >
                  Assign {selectedCustomers.length} Customer{selectedCustomers.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </DataStateWrapper>
        </div>
      </div>
    </Modal>
  );
};

export default AssignCustomersModal; 