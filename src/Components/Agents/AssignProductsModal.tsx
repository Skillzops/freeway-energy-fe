import React, { useEffect, useMemo, useState } from "react";
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

const DEBOUNCE_MS = 400;
const MIN_CHARS = 3; 

const AssignProductsModal: React.FC<AssignProductsModalProps> = ({
  isOpen,
  onClose,
  agentID,
  onSuccess
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(50);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const { agentAssignmentStore } = rootStore;
  const { apiCall } = useApiCall();

  // Only use search param if >= MIN_CHARS
  const effectiveSearch = debouncedSearch.length >= MIN_CHARS ? debouncedSearch : "";

  const productsUrl = useMemo(() => {
    const base = `/v1/products?page=${currentPage}&limit=${entriesPerPage}`;
    return effectiveSearch ? `${base}&search=${encodeURIComponent(effectiveSearch)}` : base;
  }, [currentPage, entriesPerPage, effectiveSearch]);

  const {
    data: productsData,
    isLoading,
    error,
    errorStates,
    mutate: refreshProducts
  } = useGetRequest(productsUrl, isOpen, 60000);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async () => {
    try {
      await apiCall({
        endpoint: `/v1/agents/${agentID}/assign-products`,
        method: "post",
        data: { productIds: selectedProducts },
        successMessage: "Products assigned successfully"
      });

      const selectedProductObjects =
        productsData?.updatedResults?.filter((p: any) =>
          selectedProducts.includes(p.id)
        ) || [];

      agentAssignmentStore.addProducts(agentID, selectedProductObjects);

      onSuccess?.();
      onClose();
      setSelectedProducts([]);
      setSearch("");
      setDebouncedSearch("");
    } catch (error) {
      void 0;
    }
  };

  const isFormValid = selectedProducts.length > 0;

  const totalShown = productsData?.updatedResults?.length || 0;
  const totalAll = productsData?.totalPages ?? totalShown; 

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      layout="right"
      bodyStyle="pb-44 w-full"
    >
      <div className="flex flex-col items-center bg-white w-full">
        <div className="flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleGrayGradientLeft">
          <h2 className="text-xl text-textBlack font-semibold font-secondary">
            Assign Products to Agent
          </h2>
        </div>

        <div className="flex-1 flex-col items-center justify-center w-full px-4 md:px-6 gap-4 py-6">
          <DataStateWrapper
            isLoading={isLoading}
            error={error}
            errorStates={errorStates}
            refreshData={refreshProducts}
            errorMessage="Failed to fetch products"
          >
            <div className="w-full">
              <div className="mb-1">
                <label className="block text-xs text-textGrey mb-1 font-medium">
                  Search products
                </label>
                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Type at least 3 letters (name or category)…"
                    className="w-full h-10 pl-9 pr-9 rounded-xl border border-strokeGreyTwo focus:outline-none focus:ring-2 focus:ring-[#A58730]/30 focus:border-[#A58730] text-sm"
                  />
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-textGrey"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  {search && (
                    <button
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-textGrey px-2 py-1 text-xs rounded-md hover:bg-gray-100"
                      onClick={() => {
                        setSearch("");
                        setDebouncedSearch("");
                        setCurrentPage(1);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {search.trim().length > 0 && search.trim().length < MIN_CHARS && (
                  <p className="mt-1 text-[11px] text-textGrey">
                    Keep typing… search starts after {MIN_CHARS} letters.
                  </p>
                )}
              </div>
              <div className="mb-4 flex mt-3 items-center gap-2">
                <div className="w-2 h-2 bg-[#A58730] rounded-full" />
                <p className="text-xs text-textGrey">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
                </p>
                <span className="text-xs text-textGrey">
                  • Showing {totalShown} of {totalAll}
                </span>
              </div>

              <div className="max-h-[480px] overflow-y-auto border border-strokeGreyTwo rounded-lg bg-white shadow-sm">
                {productsData?.updatedResults?.map((product: any) => {
                  const selected = selectedProducts.includes(product.id);
                  const price = product?.priceRange?.minimumInventoryBatchPrice ?? 0;

                  return (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-4 border-b border-strokeGreyTwo cursor-pointer transition-all duration-200 ${
                        selected
                          ? "bg-gradient-to-r from-[#FEF5DA] to-[#F8CB48]/20 border-l-4 border-l-[#A58730] shadow-sm"
                          : "hover:bg-gray-50 hover:shadow-sm"
                      }`}
                      onClick={() => handleProductSelect(product.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            selected
                              ? "bg-[#A58730] border-[#A58730] shadow-sm"
                              : "border-strokeGreyTwo bg-white hover:border-[#A58730]/50"
                          }`}
                        >
                          {selected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className={`text-sm font-semibold ${selected ? "text-[#A58730]" : "text-textBlack"}`}>
                            {product.name}
                          </p>
                          <p className="text-xs text-textGrey font-medium">
                            {product?.category?.name || "No category"}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-textDarkGrey tabular-nums">
                        ₦{Number(price).toLocaleString()}
                      </div>
                    </div>
                  );
                })}

                {(!productsData?.updatedResults || productsData.updatedResults.length === 0) && (
                  <div className="flex items-center justify-center p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                          <path d="M20 7L10 17L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-sm text-textGrey font-medium">
                        {effectiveSearch
                          ? "No products match your search"
                          : "No products available"}
                      </p>
                      <p className="text-xs text-textGrey">
                        {effectiveSearch
                          ? "Try a different keyword"
                          : "Products will appear here once they are created"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
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
                      ? "bg-gradient-to-r from-primary-hex to-primary-shade-1 text-white hover:opacity-90 shadow-lg hover:shadow-xl"
                      : "bg-gray-100 text-textDarkGrey cursor-not-allowed shadow-sm"
                  }`}
                >
                  Assign {selectedProducts.length} Product
                  {selectedProducts.length !== 1 ? "s" : ""}
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
