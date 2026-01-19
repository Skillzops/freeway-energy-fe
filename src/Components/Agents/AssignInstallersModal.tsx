import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useApiCall, useGetRequest } from "../../utils/useApiCall";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import rootStore from "../../stores/rootStore";
import ListPagination from "../PaginationComponent/ListPagination";

interface AssignInstallersModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentID: string;
  onSuccess?: () => void;
}

const DEBOUNCE_MS = 400;
const MIN_CHARS = 3;

const AssignInstallersModal: React.FC<AssignInstallersModalProps> = ({
  isOpen,
  onClose,
  agentID,
  onSuccess,
}) => {
  const [selectedInstallers, setSelectedInstallers] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(25);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const effectiveSearch = debouncedSearch.length >= MIN_CHARS ? debouncedSearch : "";
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveSearch, entriesPerPage]);

  const { agentAssignmentStore } = rootStore;
  const { apiCall } = useApiCall();

  // Build URL with optional search
  const installersUrl = useMemo(() => {
    const base = `/v1/agents?category=INSTALLER&page=${currentPage}&limit=${entriesPerPage}`;
    return effectiveSearch ? `${base}&search=${encodeURIComponent(effectiveSearch)}` : base;
  }, [currentPage, entriesPerPage, effectiveSearch]);

  // Fetch installers data
  const {
    data: installersData,
    isLoading,
    error,
    errorStates,
    mutate: refreshInstallers,
  } = useGetRequest(installersUrl, isOpen, 60000);

  const handleInstallerSelect = (installerId: string) => {
    setSelectedInstallers((prev) =>
      prev.includes(installerId) ? prev.filter((id) => id !== installerId) : [...prev, installerId]
    );
  };

  const handleSubmit = async () => {
    try {
      const installerIds = selectedInstallers;

      await apiCall({
        endpoint: `/v1/agents/${agentID}/assign-agent-installer`,
        method: "post",
        data: { installerIds },
        successMessage: "Installers assigned successfully",
      });

      const selectedInstallerObjects =
        installersData?.agents?.filter((installer: any) => selectedInstallers.includes(installer.id)) ||
        [];

      agentAssignmentStore.addInstallers(agentID, selectedInstallerObjects);

      onSuccess?.();
      onClose();
      setSelectedInstallers([]);
      setSearch("");
      setDebouncedSearch("");
    } catch (error) {
      void 0;
    }
  };

  const isFormValid = selectedInstallers.length > 0;

  const totalShown = installersData?.agents?.length || 0;
  const totalAll = installersData?.total ?? totalShown;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} layout="right" bodyStyle="pb-44 w-full">
        <div className="flex flex-col items-center bg-white">
          <div className="flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleGrayGradientLeft">
            <h2 className="text-xl text-textBlack font-semibold font-secondary">Assign Installers to Agent</h2>
          </div>

          <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
            <DataStateWrapper
              isLoading={isLoading}
              error={error}
              errorStates={errorStates}
              refreshData={refreshInstallers}
              errorMessage="Failed to fetch installers"
            >
              <div className="w-full">
                {/* Search Row */}
                <div className="mb-1">
                  <label className="block text-xs text-textGrey mb-1 font-medium">Search installers</label>
                  <div className="relative">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Type at least 3 letters (name or email)…"
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
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {search.trim().length > 0 && search.trim().length < MIN_CHARS && (
                    <p className="mt-1 text-[11px] text-textGrey">Keep typing… search starts after {MIN_CHARS} letters.</p>
                  )}
                </div>

                {/* Summary */}
                <div className="mb-4 flex mt-3 items-center gap-2">
                  <div className="w-2 h-2 bg-[#A58730] rounded-full"></div>
                  <p className="text-xs text-textGrey">
                    {selectedInstallers.length} installer{selectedInstallers.length !== 1 ? "s" : ""} selected
                  </p>
                  <span className="text-xs text-textGrey">• Showing {totalShown} of {totalAll}</span>
                </div>

                {/* List */}
                <div className="w-full max-h-96 overflow-y-auto border border-strokeGreyTwo rounded-lg bg-white shadow-sm [scrollbar-gutter:stable]">
                  {installersData?.agents?.map((agent: any) => {
                    const selected = selectedInstallers.includes(agent.id);
                    return (
                      <div
                        key={agent.id}
                        className={`flex items-center justify-between p-4 border-b border-strokeGreyTwo cursor-pointer transition-all duration-200 ${selected
                            ? "bg-gradient-to-r from-[#FEF5DA] to-[#F8CB48]/20 border-l-4 border-l-[#A58730] shadow-sm"
                            : "hover:bg-gray-50 hover:shadow-sm"
                          }`}
                        onClick={() => handleInstallerSelect(agent.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${selected ? "bg-[#A58730] border-[#A58730] shadow-sm" : "border-strokeGreyTwo bg-white hover:border-[#A58730]/50"
                              }`}
                          >
                            {selected && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className={`text-sm font-semibold ${selected ? "text-[#A58730]" : "text-textBlack"}`}>
                              {agent.user.firstname} {agent.user.lastname}
                            </p>
                            <p className="text-xs text-textGrey font-medium">{agent.user.email}</p>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-textDarkGrey">{agent.user.location || "No location"}</div>
                      </div>
                    );
                  })}

                  {(!installersData?.agents || installersData.agents.length === 0) && (
                    <div className="flex items-center justify-center p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                            <path d="M20 7L10 17L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="text-sm text-textGrey font-medium">
                          {effectiveSearch ? "No installers match your search" : "No installers available"}
                        </p>
                        <p className="text-xs text-textGrey">
                          {effectiveSearch ? "Try a different keyword" : "Installers will appear here once they are created"}
                        </p>
                      </div>
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
                      label="installers"
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

                {/* Actions */}
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
                    className={`flex-1 py-3.5 px-4 text-sm font-semibold rounded-2xl transition-all duration-200 ${isFormValid ? "bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white hover:opacity-90 shadow-lg hover:shadow-xl" : "bg-gray-100 text-textDarkGrey cursor-not-allowed shadow-sm"
                      }`}
                  >
                    Assign {selectedInstallers.length} Installer{selectedInstallers.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </DataStateWrapper>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssignInstallersModal;
