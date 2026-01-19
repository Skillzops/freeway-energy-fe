import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useGetRequest, useApiCall } from "../../utils/useApiCall";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import rootStore from "../../stores/rootStore";
import ListPagination from "../PaginationComponent/ListPagination";

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
  const [selectedCustomerMap, setSelectedCustomerMap] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(25);


  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const { agentAssignmentStore } = rootStore;
  const { apiCall } = useApiCall();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const effectiveSearch = debouncedSearch.length >= 3 ? debouncedSearch : "";

  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveSearch, entriesPerPage]);


  const customersUrl = useMemo(() => {
    const base = `/v1/customers?page=${currentPage}&limit=${entriesPerPage}`;
    return effectiveSearch
      ? `${base}&search=${encodeURIComponent(effectiveSearch)}`
      : base;
  }, [currentPage, entriesPerPage, effectiveSearch]);

  const {
    data: customersData,
    isLoading,
    error,
    errorStates,
    mutate: refreshCustomers
  } = useGetRequest(customersUrl, isOpen, 60000);
  const customerStats = useGetRequest("/v1/customers/stats", isOpen, 60000);

  const customers = customersData?.customers ?? [];
  const totalShown = customers.length;
  const totalAll = customersData?.total ?? totalShown;
  const totalSystem = customerStats?.data?.totalCustomerCount ?? totalAll;

  const handleCustomerSelect = (customer: any) => {
    const customerId = customer.id;
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
    setSelectedCustomerMap((prev) => {
      if (prev[customerId]) {
        const next = { ...prev };
        delete next[customerId];
        return next;
      }
      return { ...prev, [customerId]: customer };
    });
  };

  const handleSubmit = async () => {
    try {
      const customerIds = selectedCustomers;

      await apiCall({
        endpoint: `/v1/agents/${agentID}/assign-customers`,
        method: "post",
        data: { customerIds },
        successMessage: "Customers assigned successfully"
      });

      const selectedCustomerObjects = Object.values(selectedCustomerMap);
      agentAssignmentStore.addCustomers(agentID, selectedCustomerObjects);

      onSuccess?.();
      onClose();
      setSelectedCustomers([]);
      setSelectedCustomerMap({});
      setSearchTerm("");
    } catch (error) {
      void 0;
    }
  };

  const isFormValid = selectedCustomers?.length > 0;

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
          <div className="w-full max-w-[560px] mx-auto">
            <DataStateWrapper
              isLoading={isLoading}
              error={error}
              errorStates={errorStates}
              refreshData={refreshCustomers}
              errorMessage="Failed to fetch customers"
            >
              <div className="mb-4">
                <label className="block text-xs text-textGrey mb-1">
                  Search by customer name (type at least 3 letters)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g., Joh, Ade, Chi..."
                    className="w-full rounded-xl border border-strokeGreyTwo px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A58730]/30"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-textGrey text-sm px-2"
                      aria-label="Clear search"
                      title="Clear"
                    >
                      ×
                    </button>
                  )}
                </div>
                {debouncedSearch && debouncedSearch.length < 3 && (
                  <p className="text-[11px] text-textGrey mt-1">
                    Keep typing… need at least 3 letters to filter.
                  </p>
                )}
              </div>

              <div className="mb-3">
                <p className="text-sm text-textDarkGrey mb-2 font-medium">
                  Select customers to assign to this agent:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-2 h-2 bg-[#A58730] rounded-full" />
                  <p className="text-xs text-textGrey">
                    {selectedCustomers.length} customer
                    {selectedCustomers.length !== 1 ? "s" : ""} selected
                  </p>
                  <span className="text-xs text-textGrey">
                    • Total customers: {totalSystem}
                  </span>
                </div>
              </div>

              <div className="max-h-96 overflow-y-scroll border border-strokeGreyTwo rounded-lg bg-white [scrollbar-gutter:stable]">
                {customers.map((customer: any) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className={`
                      flex items-center justify-between p-3 border-b border-strokeGreyTwo cursor-pointer transition-colors
                      border-l-4
                      ${selectedCustomers.includes(customer.id)
                        ? "bg-gradient-to-r from-[#FEF5DA] to-[#F8CB48]/20 border-l-[#A58730]"
                        : "hover:bg-gray-50 border-l-transparent"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selectedCustomers.includes(customer.id)
                            ? "bg-[#A58730] border-[#A58730]"
                            : "border-strokeGreyTwo bg-white"
                          }`}
                      >
                        {selectedCustomers.includes(customer.id) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>

                      <div>
                        <p
                          className={`text-sm font-medium ${selectedCustomers.includes(customer.id)
                              ? "text-[#A58730]"
                              : "text-textBlack"
                            }`}
                        >
                          {customer.firstname} {customer.lastname}
                        </p>
                        <p className="text-xs text-textGrey">{customer.email}</p>
                      </div>
                    </div>

                    <div className="text-xs text-textGrey">
                      {customer.location || "No location"}
                    </div>
                  </div>
                ))}

                {!isLoading && customers.length === 0 && (
                  <div className="p-6 text-center text-sm text-textGrey">
                    {effectiveSearch
                      ? `No customers match “${effectiveSearch}”.`
                      : "No customers available."}
                  </div>
                )}
              </div>

              {totalAll > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <ListPagination
                    totalItems={totalAll}
                    itemsPerPage={entriesPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    label="customers"
                  />
                  <div className="flex items-center gap-2 text-xs text-textGrey">
                    <span>Rows per page</span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                      className="rounded-lg border border-strokeGreyTwo px-2 py-1 text-xs text-textDarkGrey"
                    >
                      {[25, 50, 100].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 text-sm font-medium text-textDarkGrey bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleSubmit();
                  }}
                  disabled={!isFormValid}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-2xl transition-colors ${isFormValid
                      ? "bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white hover:opacity-90 shadow-lg"
                      : "bg-gray-100 text-textDarkGrey cursor-not-allowed"
                    }`}
                >
                  Assign {selectedCustomers.length} Customer
                  {selectedCustomers.length !== 1 ? "s" : ""}
                </button>
              </div>
            </DataStateWrapper>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AssignCustomersModal;
