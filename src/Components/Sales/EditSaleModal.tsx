import { useEffect, useMemo, useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { IoChevronDown } from "react-icons/io5";

type EditSaleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
  saleData: any;
  refreshSingleSale?: () => Promise<any>;
  refreshTable?: () => Promise<any>;
};

const EditSaleModal = ({
  isOpen,
  onClose,
  saleId,
  saleData,
  refreshSingleSale,
  refreshTable,
}: EditSaleModalProps) => {
  const { apiCall } = useApiCall();

  const initialCustomerId =
    saleData?.sale?.customer?.id || saleData?.sale?.customerId || "";
  const initialCustomerName = `${saleData?.sale?.customer?.firstname || ""} ${
    saleData?.sale?.customer?.lastname || ""
  }`.trim();

  const initialDeviceSerials = useMemo<string[]>(() => {
    const serials: string[] = (saleData?.devices || [])
      .map((device: any) => String(device?.serialNumber || "").trim())
      .filter((serial: string) => Boolean(serial));

    return Array.from(new Set<string>(serials));
  }, [saleData]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedDeviceSerials, setSelectedDeviceSerials] = useState<string[]>(
    []
  );
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCustomerId(initialCustomerId);
    setSelectedDeviceSerials(initialDeviceSerials);
    setIsDevicesOpen(false);
    setReason("");
    setCustomerSearch("");
  }, [isOpen, initialCustomerId, initialDeviceSerials]);

  const customerQuery = (customerSearch || "").trim();
  const customerUrl = isOpen
    ? `/v1/customers?limit=50&search=${encodeURIComponent(customerQuery)}`
    : null;
  const { data: customersResponse, isLoading: customersLoading } = useGetRequest(
    customerUrl,
    true,
    60000
  );

  const customers = useMemo<any[]>(() => {
    if (Array.isArray(customersResponse)) return customersResponse;
    if (Array.isArray(customersResponse?.customers))
      return customersResponse.customers;
    if (Array.isArray(customersResponse?.customer))
      return customersResponse.customer;
    if (Array.isArray(customersResponse?.data)) return customersResponse.data;
    return [];
  }, [customersResponse]);

  const customerOptions = useMemo<{ id: string; label: string }[]>(() => {
    const unique = new Map<string, string>();

    customers.forEach((customer: any) => {
      const id = customer?.id;
      if (!id) return;
      const name = `${customer?.firstname || ""} ${customer?.lastname || ""}`.trim();
      const phone = customer?.phone ? ` (${customer.phone})` : "";
      unique.set(id, (name || "Unknown Customer") + phone);
    });

    if (initialCustomerId && !unique.has(initialCustomerId)) {
      unique.set(initialCustomerId, initialCustomerName || initialCustomerId);
    }

    return Array.from(unique.entries()).map(([id, label]) => ({ id, label }));
  }, [customers, initialCustomerId, initialCustomerName]);

  const availableDeviceSerials = useMemo<string[]>(
    () => initialDeviceSerials,
    [initialDeviceSerials]
  );

  const toggleDeviceSerial = (serial: string) => {
    setSelectedDeviceSerials((prev) =>
      prev.includes(serial) ? prev.filter((s) => s !== serial) : [...prev, serial]
    );
  };

  const handleSave = async () => {
    const updateReason = reason.trim();
    if (!updateReason || !saleId) return;

    const nextDeviceSerials = selectedDeviceSerials;
    const initialSerialsSorted = [...initialDeviceSerials].sort();
    const nextSerialsSorted = [...nextDeviceSerials].sort();

    const deviceSerialsChanged =
      JSON.stringify(initialSerialsSorted) !== JSON.stringify(nextSerialsSorted);
    const customerChanged =
      Boolean(selectedCustomerId) && selectedCustomerId !== initialCustomerId;

    const payload: Record<string, any> = {
      notes: updateReason,
    };

    if (customerChanged) payload.customerId = selectedCustomerId;
    if (deviceSerialsChanged) payload.deviceSerials = nextDeviceSerials;

    const rawVersion =
      saleData?.sale?.version ?? saleData?.sale?.__v ?? saleData?.version;
    const parsedVersion = Number(rawVersion);
    if (Number.isFinite(parsedVersion)) {
      payload.version = parsedVersion;
    }

    setIsSaving(true);
    try {
      await apiCall({
        endpoint: `/v1/sales/${saleId}`,
        method: "patch",
        data: payload,
        successMessage: "Sale updated successfully",
      });

      await Promise.all([
        refreshSingleSale?.() || Promise.resolve(),
        refreshTable?.() || Promise.resolve(),
      ]);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      layout="right"
      size="large"
      bodyStyle="pb-28 overflow-auto"
       
    >
      <div className="bg-[#F8F9FC] min-h-full">
        <div className="px-5 py-5 border-b border-strokeGreyThree bg-white">
          <h2 className="text-[22px] leading-none font-semibold text-textBlack">Edit Sale</h2>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-full border border-strokeGreyThree bg-[#F6F8FA] text-[#55607D] text-[14px] leading-none">
              Sale ID {saleData?.saleId || saleId}
            </span>
            <span className="px-3 py-1.5 rounded-full border border-strokeGreyThree bg-[#F6F8FA] text-[#7482A5] text-[14px] leading-none">
              {saleData?.sale?.status || "N/A"}
            </span>
          </div>
          <p className="mt-3 text-[14px] text-[#7685A9]">
            Only non-financial fields can be updated. A reason is required.
          </p>
        </div>

        <div className="px-5 py-5 space-y-5">
          <div className="rounded-full border border-[#DEE3EE] bg-[#F3F5FB] px-6 py-3 text-[#7383A8] text-[14px]">
            Only basic attributes can be edited. Financial totals and ledger references remain protected.
          </div>

          <section className="rounded-[24px] border border-[#DEE3EE] bg-[#F8F9FC] p-5 space-y-4">
            <div className="relative pt-2">
              <span className="absolute -top-1 left-5 z-10 px-3 rounded-full bg-[#F8F9FC] border border-[#DDC996] text-[#7482A5] text-[11px] font-semibold">
                CUSTOMER ID
              </span>
              <div className="relative">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full h-[54px] appearance-none rounded-full border border-[#DDC996] bg-white pl-5 pr-12 text-[14px] leading-none text-[#111111] focus:outline-none"
                >
                  {customerOptions.length === 0 ? (
                    <option value="">
                      {customersLoading ? "Loading customers..." : "No customers found"}
                    </option>
                  ) : (
                    customerOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))
                  )}
                </select>
                <IoChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#111111] text-[18px] pointer-events-none" />
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#DEE3EE] bg-[#F8F9FC] p-5 space-y-4">
            <p className="text-[14px] leading-none font-semibold text-[#4C5879] uppercase">DEVICES</p>
            <p className="text-[13px] text-[#7482A5]">
              {selectedDeviceSerials[0] || availableDeviceSerials[0] || "N/A"}
            </p>

            <div className="relative pt-2">
              <span className="absolute -top-1 left-5 z-10 px-3 rounded-full bg-[#F8F9FC] border border-[#DDC996] text-[#7482A5] text-[11px] font-semibold">
                DEVICE SERIALS
              </span>
              <button
                type="button"
                onClick={() => setIsDevicesOpen((prev) => !prev)}
                className="w-full h-[54px] rounded-full border border-[#DDC996] bg-white px-5 flex items-center justify-between text-[14px] leading-none text-[#111111]"
              >
                <span>{`${selectedDeviceSerials.length} selected`}</span>
                <IoChevronDown className="text-[18px]" />
              </button>
            </div>

            {isDevicesOpen && (
              <div className="rounded-[20px] border border-[#DEE3EE] bg-white p-4 max-h-[220px] overflow-auto space-y-2">
                {availableDeviceSerials.length === 0 ? (
                  <p className="text-[13px] text-[#7482A5]">No device serials available</p>
                ) : (
                  availableDeviceSerials.map((serial) => (
                    <label key={serial} className="flex items-center gap-3 text-[13px] text-[#111111]">
                      <input
                        type="checkbox"
                        checked={selectedDeviceSerials.includes(serial)}
                        onChange={() => toggleDeviceSerial(serial)}
                        className="w-4 h-4"
                      />
                      {serial}
                    </label>
                  ))
                )}
              </div>
            )}

            <p className="text-[13px] text-[#7482A5]">{selectedDeviceSerials.length} serial selected</p>
          </section>

          <section className="rounded-[24px] border border-[#DEE3EE] bg-[#F8F9FC] p-5 space-y-4">
            <p className="text-[14px] leading-none font-semibold text-[#4C5879] uppercase">REASON</p>
            <label className="block text-[14px] text-[#7482A5] font-semibold">Reason (Required)</label>
            <textarea
              rows={6}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this change is needed"
              className="w-full rounded-[20px] bg-[#F3F5FB] px-5 py-4 text-[14px] italic text-[#7482A5] focus:outline-none resize-none border border-transparent"
            />
          </section>
        </div>

        <div className="sticky bottom-0 px-5 py-5 border-t border-strokeGreyThree bg-white flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 h-[48px] rounded-full border border-[#DEE3EE] px-4 text-[#111111] text-[16px]"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !reason.trim()}
            className="w-1/2 h-[48px] rounded-full px-4 text-white text-[16px] disabled:opacity-60"
            style={{
              background: "#901420",
              backgroundColor: "#901420",
              backgroundImage: "none",
              borderColor: "#901420",
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditSaleModal;
