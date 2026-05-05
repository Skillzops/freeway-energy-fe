import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useApiCall, useGetRequest } from "../../utils/useApiCall";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import ListPagination from "../PaginationComponent/ListPagination";
import { copyToClipboard } from "../../utils/helpers";

interface AssignDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentID: string;
  onSuccess?: () => void;
}

const AssignDevicesModal: React.FC<AssignDevicesModalProps> = ({
  isOpen,
  onClose,
  agentID,
  onSuccess
}) => {
  const { apiCall } = useApiCall();
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [serialInput, setSerialInput] = useState<string>("");
  const [mode, setMode] = useState<"ATOMIC" | "PARTIAL">("PARTIAL");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<{
    batchId?: string | null;
    mode?: string | null;
    message?: string | null;
    results: {serial: string;success: boolean;error?: string | null;}[];
    successCount: number;
    failureCount: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage] = useState<number>(50);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [_uploadName, setUploadName] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const effectiveSearch = debouncedSearch.length >= 3 ? debouncedSearch : "";

  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveSearch, entriesPerPage]);

  const devicesUrl = useMemo(() => {
    const base = `/v1/device?page=${currentPage}&limit=${entriesPerPage}`;
    return effectiveSearch ? `${base}&search=${encodeURIComponent(effectiveSearch)}` : base;
  }, [currentPage, entriesPerPage, effectiveSearch]);

  const {
    data: devicesData,
    isLoading,
    error,
    errorStates,
    mutate: refreshDevices
  } = useGetRequest(devicesUrl, isOpen, 60000);

  const devices = devicesData?.devices ?? [];
  const isAvailableDevice = (device: any) => {
    const status = device?.assignmentStatus || device?.status || device?.assignedStatus;
    const normalized = status ? status.toString().toLowerCase() : "";
    if (normalized.includes("assigned") || normalized.includes("in_use") || normalized.includes("allocated")) {
      return false;
    }
    if (device?.assignedAgentId || device?.assignedAgent || device?.assignedTo) return false;
    if (device?.isAssigned === true) return false;
    return true;
  };
  const availableDevices = devices.filter(isAvailableDevice);
  const totalShown = availableDevices.length;
  const totalAll = devicesData?.total ?? totalShown;

  const normalizedManualSerials = useMemo(() => {
    if (!serialInput.trim()) return [];
    const raw = serialInput.
    split(/[\n,]+/g).
    map((item) => item.trim()).
    filter(Boolean).
    map((item) => item.toUpperCase());
    return Array.from(new Set(raw));
  }, [serialInput]);

  const mergedSerials = useMemo(() => {
    const merged = [...selectedSerials, ...normalizedManualSerials].
    map((item) => item.trim().toUpperCase()).
    filter(Boolean);
    return Array.from(new Set(merged));
  }, [selectedSerials, normalizedManualSerials]);

  const normalizeSerial = (serial: string) => serial.trim().toUpperCase();

  const toggleDevice = (serialNumber: string) => {
    const normalized = normalizeSerial(serialNumber);
    setSelectedSerials((prev) =>
    prev.includes(normalized) ?
    prev.filter((serial) => serial !== normalized) :
    [...prev, normalized]
    );
  };

  const isBulk = mergedSerials.length > 1;
  const isFormValid = mergedSerials.length > 0;

  const resetForm = () => {
    setSelectedSerials([]);
    setSerialInput("");
    setMode("PARTIAL");
    setSearch("");
    setDebouncedSearch("");
    setUploadName("");
    setSubmitResult(null);
  };

  const clearSuccessfulSerials = (serialsToClear: string[]) => {
    if (serialsToClear.length === 0) return;
    const toClear = new Set(serialsToClear.map(normalizeSerial));
    setSelectedSerials((prev) => prev.filter((serial) => !toClear.has(normalizeSerial(serial))));
    setSerialInput((prev) => {
      if (!prev.trim()) return prev;
      const remaining = prev.
      split(/[\n,]+/g).
      map((item) => item.trim()).
      filter(Boolean).
      filter((item) => !toClear.has(normalizeSerial(item)));
      return remaining.length > 0 ? remaining.join("\n") : "";
    });
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    const serialsToSubmit = [...mergedSerials];
    setSelectedSerials([]);
    setSerialInput("");
    setIsSubmitting(true);
    try {
      if (isBulk) {
        const response = await apiCall({
          endpoint: "/v1/devices/assignments/assign-bulk",
          method: "post",
          data: {
            deviceSerials: serialsToSubmit,
            agentId: agentID,
            mode
          },
          successMessage: "Devices assigned successfully"
        });
        const payload = response?.data ?? response ?? {};
        const results = (payload?.results || payload?.data?.results || []).map((item: any) => ({
          serial: item?.device?.serialNumber || item?.deviceSerial || item?.serial || item?.device || "",
          success: Boolean(item?.success),
          error: item?.error ?? item?.message ?? item?.reason ?? null
        }));
        const successCount =
        payload?.successCount ?? results.filter((item: any) => item.success).length;
        const failureCount =
        payload?.failureCount ?? results.filter((item: any) => !item.success).length;
        setSubmitResult({
          batchId: payload?.batchId || payload?.data?.batchId || null,
          mode: payload?.mode || payload?.data?.mode || mode,
          message: payload?.message || payload?.data?.message || "Request completed.",
          results,
          successCount,
          failureCount
        });
        const successfulSerials = results.
        filter((item: any) => item.success).
        map((item: any) => item.serial).
        filter(Boolean);
        const shouldClearAll = successfulSerials.length === 0 && failureCount === 0;
        clearSuccessfulSerials(shouldClearAll ? serialsToSubmit : successfulSerials);
      } else {
        const response = await apiCall({
          endpoint: "/v1/devices/assignments/assign",
          method: "post",
          data: {
            deviceSerial: serialsToSubmit[0],
            agentId: agentID
          },
          successMessage: "Device assigned successfully"
        });
        const payload = response?.data ?? response ?? {};
        const backendMessage = payload?.message || payload?.data?.message || "Request completed.";
        const successValue =
        payload?.success ?? payload?.data?.success ?? true;
        setSubmitResult({
          batchId: payload?.batchId || payload?.data?.batchId || null,
          mode: payload?.mode || payload?.data?.mode || "SINGLE",
          message: backendMessage,
          results: [
          {
            serial: payload?.device?.serialNumber || serialsToSubmit[0],
            success: Boolean(successValue),
            error: payload?.error || payload?.data?.error || null
          }],

          successCount: successValue ? 1 : 0,
          failureCount: successValue ? 0 : 1
        });
        if (successValue) {
          clearSuccessfulSerials([serialsToSubmit[0]]);
        }
      }

      onSuccess?.();
    } catch (error: any) {
      const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Request failed";
      setSubmitResult({
        batchId: null,
        mode,
        message,
        results: [],
        successCount: 0,
        failureCount: mergedSerials.length
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleFileUpload = (file?: File | null) => {
  //   if (!file) return;
  //   setUploadName(file.name);
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const text = String(reader.result || "");
  //     setSerialInput((prev) => (prev ? `${prev}\n${text}` : text));
  //   };
  //   reader.readAsText(file);
  // };

  const downloadFailedCsv = () => {
    if (!submitResult || submitResult.results.length === 0) return;
    const rows = [
    "serial,error",
    ...submitResult.results.map((r) => `${r.serial},${r.error || ""}`)];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "device-assignments-results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} layout="right" bodyStyle="pb-44">
      <div className="flex flex-col items-center bg-white">
        <div className="flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleGrayGradientLeft">
          <h2 className="text-xl text-textBlack font-semibold font-secondary">
            Assign Devices to Agent
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          <div className="w-full max-w-[680px] mx-auto flex flex-col gap-4">
            <DataStateWrapper
              isLoading={isLoading}
              error={error}
              errorStates={errorStates}
              refreshData={refreshDevices}
              errorMessage="Failed to fetch devices">

              <div className="mb-1">
                <label className="block text-xs text-textGrey mb-1 font-medium">
                  Paste serial numbers (comma or new line separated)
                </label>
                <textarea
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  rows={4}
                  placeholder="SR27/SR/2501202191, SR27/SR/2501202194"
                  className="w-full rounded-xl border border-strokeGreyTwo px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A58730]/30" />

                {/* <div className="mt-2 flex items-center gap-3">
                   <label className="text-xs text-textGrey font-medium cursor-pointer hover:text-[#7A5B10] transition-colors">
                     Upload CSV
                     <input
                       type="file"
                       accept=".csv,text/csv"
                       onChange={(e) => handleFileUpload(e.target.files?.[0])}
                       className="hidden"
                     />
                   </label>
                   {uploadName && (
                     <span className="text-xs text-textGrey">{uploadName}</span>
                   )}
                  </div> */}
                <p className="mt-1 text-[11px] text-textGrey">
                  {mergedSerials.length} serial{mergedSerials.length !== 1 ? "s" : ""} detected
                </p>
              </div>

              <div className="mb-1">
                <label className="block text-xs text-textGrey mb-1 font-medium">
                  Search devices
                </label>
                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Type at least 3 letters (serial number or model)…"
                    className="w-full h-10 pl-9 pr-9 rounded-xl border border-strokeGreyTwo focus:outline-none focus:ring-2 focus:ring-[#A58730]/30 focus:border-[#A58730] text-sm" />

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-textGrey"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">

                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  {search &&
                  <button
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-textGrey px-2 py-1 text-xs rounded-md hover:bg-gray-100"
                    onClick={() => {
                      setSearch("");
                      setDebouncedSearch("");
                      setCurrentPage(1);
                    }}>

                      Clear
                    </button>
                  }
                </div>
                {search.trim().length > 0 && search.trim().length < 3 &&
                <p className="mt-1 text-[11px] text-textGrey">
                    Keep typing… search starts after 3 letters.
                  </p>
                }
              </div>

              <div className="mb-4 flex mt-3 items-center gap-2">
                <div className="w-2 h-2 bg-[#A58730] rounded-full" />
                <p className="text-xs text-textGrey">
                  {mergedSerials.length} device
                  {mergedSerials.length !== 1 ? "s" : ""} selected
                </p>
                <span className="text-xs text-textGrey">
                  • Showing {totalShown} of {totalAll}
                </span>
              </div>

              <div className="max-h-[480px] overflow-y-auto border border-strokeGreyTwo rounded-lg bg-white shadow-sm">
                {availableDevices.map((device: any) => {
                  const serial = device?.serialNumber || device?.serial || device?.serial_number;
                  const normalizedSerial = serial ? serial.trim().toUpperCase() : "";
                  const selected = normalizedSerial && selectedSerials.includes(normalizedSerial);

                  return (
                    <div
                      key={device.id || serial}
                      className={`flex items-center justify-between p-4 border-b border-strokeGreyTwo cursor-pointer transition-all duration-200 ${
                      selected ?
                      "bg-gradient-to-r from-[#FEF5DA] to-[#F8CB48]/20 border-l-4 border-l-[#A58730] shadow-sm" :
                      "hover:bg-gray-50 hover:shadow-sm"}`
                      }
                      onClick={() => serial && toggleDevice(serial)}>

                      <div className="flex items-center gap-4">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          selected ?
                          "bg-[#A58730] border-[#A58730] shadow-sm" :
                          "border-strokeGreyTwo bg-white hover:border-[#A58730]/50"}`
                          }>

                          {selected &&
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          }
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className={`text-sm font-semibold ${selected ? "text-[#A58730]" : "text-textBlack"}`}>
                            {serial || "Unknown serial"}
                          </p>
                          <p className="text-xs text-textGrey font-medium">
                            {device?.hardwareModel || "Unknown model"}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-textDarkGrey">
                        {device?.installationStatus || "N/A"}
                      </div>
                    </div>);

                })}

                {(!availableDevices || availableDevices.length === 0) &&
                <div className="flex items-center justify-center p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                          <path d="M20 7L10 17L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="text-sm text-textGrey font-medium">
                        {effectiveSearch ?
                      "No unassigned devices match your search" :
                      "No unassigned devices available"}
                      </p>
                      <p className="text-xs text-textGrey">
                        {effectiveSearch ?
                      "Try a different keyword" :
                      "Unassigned devices will appear here once they are created"}
                      </p>
                    </div>
                  </div>
                }
              </div>

              <div className="flex items-center justify-between px-2 py-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-textGrey">
                    Showing <span className="font-semibold">{devices.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1}</span> to{" "}
                    <span className="font-semibold">
                      {devices.length === 0 ?
                      0 :
                      Math.min((currentPage - 1) * entriesPerPage + devices.length, totalAll)}
                    </span>{" "}
                    of <span className="font-semibold">{totalAll}</span> Devices
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-textGrey">Page</span>
                  <ListPagination
                    currentPage={currentPage}
                    totalItems={totalAll}
                    itemsPerPage={entriesPerPage}
                    onPageChange={setCurrentPage}
                    label="Devices" />

                </div>
              </div>

              {isBulk ?
              <div className="mt-4">
                  <label className="block text-xs text-textGrey mb-1">
                    Bulk mode
                  </label>
                  <select
                  value={mode}
                  onChange={(e) =>
                  setMode(e.target.value === "PARTIAL" ? "PARTIAL" : "ATOMIC")
                  }
                  className="w-full rounded-xl border border-strokeGreyTwo px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A58730]/30">

                    <option value="ATOMIC">ATOMIC (all or nothing)</option>
                    <option value="PARTIAL">PARTIAL (best effort)</option>
                  </select>
                </div> :
              null}

              {submitResult ?
              <div className="mt-4 border border-strokeGreyTwo rounded-xl p-4 bg-[#F9FAFB]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-textBlack">Assignment Results</p>
                    {submitResult.batchId ?
                  <span className="text-xs text-textGrey">Batch: {submitResult.batchId}</span> :
                  null}
                  </div>
                  {submitResult.message ?
                <p className="text-xs text-textGrey mb-2">{submitResult.message}</p> :
                null}
                  <p className="text-xs text-textGrey">
                    Success: {submitResult.successCount} • Failed: {submitResult.failureCount}
                  </p>
                  {submitResult.results.length > 0 &&
                <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <button
                      type="button"
                      onClick={() =>
                      copyToClipboard(
                        submitResult.results.
                        map((r) => `${r.serial},${r.error ?? ""}`).
                        join("\n")
                      )
                      }
                      className="px-3 py-1 rounded-full border border-[#E5D9B8] bg-[#FFF7E2] text-[11px] font-semibold text-[#7A5B10] hover:bg-[#FCECC6] transition-colors">

                          Copy result list
                        </button>
                        <button
                      type="button"
                      onClick={downloadFailedCsv}
                      className="px-3 py-1 rounded-full border border-[#E5D9B8] bg-[#FFF7E2] text-[11px] font-semibold text-[#7A5B10] hover:bg-[#FCECC6] transition-colors">

                          Download CSV
                        </button>
                      </div>
                      <div className="mt-2 max-h-40 overflow-y-auto text-xs text-textDarkGrey">
                        {submitResult.results.map((result, idx) =>
                    <div key={`${result.serial}-${idx}`} className="flex justify-between border-b border-strokeGreyTwo py-1">
                            <span>{result.serial || "Unknown"}</span>
                            <span className="text-textGrey">
                              {result.success ? "Added" : result.error || "Failed"}
                            </span>
                          </div>
                    )}
                      </div>
                    </div>
                }
                </div> :
              null}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="flex-1 py-3.5 px-4 text-sm font-semibold text-textDarkGrey bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-200 shadow-sm">

                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className={`flex-1 py-3.5 px-4 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                  isFormValid && !isSubmitting ?
                  "bg-gradient-to-r from-primary-hex to-primary-shade-1 text-white hover:opacity-90 shadow-lg hover:shadow-xl" :
                  "bg-gray-100 text-textDarkGrey cursor-not-allowed shadow-sm"}`
                  }>

                  {isSubmitting ? "Assigning..." : `Assign ${mergedSerials.length} Device${mergedSerials.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            </DataStateWrapper>
          </div>
        </div>
      </div>
    </Modal>);

};

export default AssignDevicesModal;
