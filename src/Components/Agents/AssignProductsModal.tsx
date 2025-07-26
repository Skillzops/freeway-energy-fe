import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useGetRequest, useApiCall } from "../../utils/useApiCall";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import rootStore from "../../stores/rootStore";

interface AssignProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentID: string;
  onSuccess?: () => void;
}

const AssignProductsModal: React.FC<AssignProductsModalProps> = ({
  isOpen,
  onClose,
  agentID,
  onSuccess
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);

  const { agentAssignmentStore } = rootStore;
  const { apiCall } = useApiCall();

  // Fetch products data
  const {
    data: productsData,
    isLoading,
    error,
    errorStates,
    mutate: refreshProducts
  } = useGetRequest(
    `/v1/products?page=${currentPage}&limit=${entriesPerPage}`,
    isOpen,
    60000
  );

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async () => {
    try {
      // Get the selected product IDs
      const productIds = selectedProducts;

      // Call the API to assign products
      await apiCall({
        endpoint: `/v1/agents/${agentID}/assign-products`,
        method: 'post',
        data: { productIds },
        successMessage: 'Products assigned successfully',
      });

      // Get the selected product objects for store
      const selectedProductObjects = productsData?.updatedResults?.filter((product: any) => 
        selectedProducts.includes(product.id)
      ) || [];

      // Add products to the store for UI updates
      agentAssignmentStore.addProducts(agentID, selectedProductObjects);

      onSuccess?.();
      onClose();
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error assigning products:', error);
    }
  };

  const isFormValid = selectedProducts.length > 0;

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
            Assign Products to Agent
          </h2>
        </div>
        
        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          <DataStateWrapper
            isLoading={isLoading}
            error={error}
            errorStates={errorStates}
            refreshData={refreshProducts}
            errorMessage="Failed to fetch products"
          >
            <div className="w-full">
              <div className="mb-6">
                <p className="text-sm text-textDarkGrey mb-2 font-medium">
                  Select products to assign to this agent:
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#A58730] rounded-full"></div>
                  <p className="text-xs text-textGrey">
                    {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto border border-strokeGreyTwo rounded-lg bg-white shadow-sm">
                {productsData?.updatedResults?.map((product: any) => (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-4 border-b border-strokeGreyTwo cursor-pointer transition-all duration-200 ${
                      selectedProducts.includes(product.id) 
                        ? 'bg-gradient-to-r from-[#FEF5DA] to-[#F8CB48]/20 border-l-4 border-l-[#A58730] shadow-sm' 
                        : 'hover:bg-gray-50 hover:shadow-sm'
                    }`}
                    onClick={() => handleProductSelect(product.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedProducts.includes(product.id)
                          ? 'bg-[#A58730] border-[#A58730] shadow-sm'
                          : 'border-strokeGreyTwo bg-white hover:border-[#A58730]/50'
                      }`}>
                        {selectedProducts.includes(product.id) && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className={`text-sm font-semibold ${
                          selectedProducts.includes(product.id) ? 'text-[#A58730]' : 'text-textBlack'
                        }`}>
                          {product.name}
                        </p>
                        <p className="text-xs text-textGrey font-medium">
                          {product.category?.name || 'No category'}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-textDarkGrey">
                      ₦{product.priceRange?.minimumInventoryBatchPrice?.toLocaleString() || '0'}
                    </div>
                  </div>
                ))}
                {(!productsData?.updatedResults || productsData.updatedResults.length === 0) && (
                  <div className="flex items-center justify-center p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                          <path d="M20 7L10 17L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-sm text-textGrey font-medium">No products available</p>
                      <p className="text-xs text-textGrey">Products will appear here once they are created</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 px-4 text-sm font-semibold text-textDarkGrey bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className={`flex-1 py-3.5 px-4 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                    isFormValid 
                      ? 'bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white hover:opacity-90 shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 text-textDarkGrey cursor-not-allowed shadow-sm'
                  }`}
                >
                  Assign {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </DataStateWrapper>
        </div>
      </div>
    </Modal>
  );
};

export default AssignProductsModal; 