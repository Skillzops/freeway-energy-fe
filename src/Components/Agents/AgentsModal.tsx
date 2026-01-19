import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import TabComponent from "../TabComponent/TabComponent";
import { DropDown } from "../DropDownComponent/DropDown";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import ListPagination from "../PaginationComponent/ListPagination";
import AgentDetails, { AgentUserType } from "./AgentDetails";
import AssignCustomersModal from "./AssignCustomersModal";
import AssignProductsModal from "./AssignProductsModal";
import AssignInstallersModal from "./AssignInstallersModal";
import TopUpWalletForm from "../TopUp/TopWalletForm";
import walletIcon from "@/assets/agents/wallet.svg";
import InstallationHistoryModal from "./InstallationHistoryModal";
import TaskHistoryModal from "./TaskHistoryModal";
import { KeyedMutator } from "swr";
import rootStore from "@/stores/rootStore";
import CommissionsTab from "./CommissionsTab";
import AssignDevicesModal from "./AssignDevicesModal";
import useTokens from "@/hooks/useTokens";
import { copyToClipboard, formatDateTime } from "@/utils/helpers";



interface ExtendedAgentUserType extends AgentUserType {
  category?: string;
}

const getAssignedDevicesCount = (data: any) => {
  const total =
    data?.total ??
    data?.count ??
    data?.meta?.total ??
    data?.pagination?.total;
  if (typeof total === "number") return total;

  const list = data?.devices ?? data?.data ?? data?.results ?? [];
  return Array.isArray(list) ? list.length : 0;
};

const normalizeAssignmentStatus = (status?: string | null) => {
  if (!status) return "ASSIGNED";
  return status.toString().replace(/_/g, " ").trim().toUpperCase();
};

const formatStatusLabel = (status?: string | null) => {
  if (!status) return "Assigned";
  return status
    .toString()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const isBlockedAssignmentStatus = (status?: string | null) => {
  const normalized = (status || "").toString().toLowerCase();
  return normalized.includes("lost") || normalized.includes("decommissioned");
};

const buildActorName = (actor: any) => {
  if (!actor) return "N/A";
  const user = actor?.user ?? actor;
  const name = [user?.firstname, user?.lastname].filter(Boolean).join(" ");
  return name || user?.email || "N/A";
};

// Customer Table Component
const CustomerTable = ({ 
  agentID, 
  onAssignCustomers 
}: { 
  agentID: string;
  onAssignCustomers: () => void;
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage] = useState<number>(12);

  // Fetch all customers from the API
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
    errorStates: customersErrorStates,
    mutate: refreshCustomers
  } = useGetRequest(
    `/v1/customers`,
    true,
    60000
  );



  // Get current assigned customers from store
  const { agentAssignmentStore } = rootStore;
  const storeAssignments = agentAssignmentStore.assignments;
  const storeAssignedData = storeAssignments.find(a => a.agentId === agentID);
  const storeAssignedCustomerIds = storeAssignedData?.customers?.map((customer: any) => customer.id || customer.customerId) || [];

  // For now, just use store data since the API endpoint returns forbidden
  const allAssignedCustomerIds = storeAssignedCustomerIds;

  // Filter customers to show only those currently assigned to this agent
  const allAssignedCustomers = customersData?.customers?.filter((customer: any) => 
    allAssignedCustomerIds.includes(customer.id)
  ) || [];

  // Use only customers loading state
  const isLoading = customersLoading;
  const error = customersError;
  const errorStates = customersErrorStates;
  const refreshData = refreshCustomers;

  // Transform assigned customers to table format
  const tableCustomersData = {
    data: allAssignedCustomers.map((customer: any, index: number) => ({
      id: customer.id || index + 1,
      user: { 
        firstname: customer.firstname || customer.user?.firstname || 'N/A', 
        lastname: customer.lastname || customer.user?.lastname || 'N/A' 
      },
      product: { 
        type: customer.productType || customer.product?.type || 'N/A', 
        paymentType: customer.paymentMode || customer.product?.paymentType || 'N/A' 
      },
      status: customer.status || 'ACTIVE',
      dueDate: customer.dueDate || 'N/A',
      phone: customer.phone || customer.user?.phone || 'N/A',
      email: customer.email || customer.user?.email || 'N/A',
      location: customer.location || customer.user?.location || 'N/A'
    }))
  };

  return (
    <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
      <DataStateWrapper
        isLoading={isLoading}
        error={error}
        errorStates={errorStates}
        refreshData={refreshData}
        errorMessage="Failed to fetch customers data"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-textBlack">Assigned Customers</h3>
          <span className="text-sm text-textGrey">
            {allAssignedCustomers.length} customer{allAssignedCustomers.length !== 1 ? 's' : ''} assigned
          </span>
        </div>
        {allAssignedCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer History</h3>
          <p className="text-sm text-gray-500 mb-4">This agent hasn't had any customers assigned yet.</p>
          <button 
            onClick={onAssignCustomers}
            className="px-4 py-2 bg-primaryGradient text-white rounded-full text-sm font-medium hover:bg-primary transition-colors"
          >
            Assign Customers
          </button>
        </div>
      ) : (
        <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 text-sm font-medium text-[#8990A5]">S/N</th>
              <th className="text-left p-3 text-sm font-medium text-[#8990A5]">NAME</th>
              <th className="text-left p-3 text-sm font-medium text-[#8990A5]">PRODUCT</th>
              <th className="text-left p-3 text-sm font-medium text-[#8990A5]">STATUS</th>
              <th className="text-left p-3 text-sm font-medium text-[#8990A5]">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
                {tableCustomersData?.data?.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map((customer: any, index: number) => (
              <tr key={customer.id} className="border-b border-[#F6F8FA]">
                <td className="p-3 text-sm text-textDarkGrey">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="p-3 text-sm text-textDarkGrey">
                  {customer?.user?.firstname} {customer?.user?.lastname}
                </td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      customer?.product?.type === 'EAAS' ? 'bg-[#E3FAD6]' :
                      customer?.product?.type === 'SHS' ? 'bg-[#FDEEC2]' :
                      'bg-[#FDEEC2]'
                    }`}>
                      {customer?.product?.type || 'N/A'}
                    </span>
                    <span className="text-textDarkGrey">
                      {customer?.product?.paymentType || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-sm">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                    customer?.status === 'COMPLETED' ? 'bg-[#F6F8FA] text-[#00AF50]' :
                    customer?.status === 'DEFAULTED' ? 'bg-[#F6F8FA] text-[#FC4C5D]' :
                    'bg-[#F6F8FA] text-[#00AF50]'
                  }`}>
                    {customer?.status === 'DEFAULTED' ? `DEFAULTED: ${customer?.daysDefaulted || 29} DAYS` :
                     customer?.status === 'DUE' ? `DUE: ${customer?.dueDate || 'SEPT 11 2024'}` :
                     customer?.status || 'N/A'}
                  </span>
                </td>
                <td className="p-3">
                  <button className="px-4 py-1 text-xs bg-[#F6F8FA] text-textDarkGrey rounded-full hover:bg-gray-200">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-xs text-textGrey">
            Showing <span className="font-semibold">{(currentPage - 1) * entriesPerPage + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(currentPage * entriesPerPage, tableCustomersData.data.length)}</span> of{" "}
              <span className="font-semibold">{tableCustomersData.data.length}</span> Customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-textGrey">Page</span>
          <ListPagination
            currentPage={currentPage}
              totalItems={tableCustomersData.data.length}
            itemsPerPage={entriesPerPage}
            onPageChange={setCurrentPage}
            label="Customers"
          />
        </div>
      </div>
        </>
        )}
      </DataStateWrapper>
    </div>
  );
};

// Assigned Devices Table Component
const AssignedDevicesTable = ({
  agentID,
  onAssignDevices,
  refreshToken,
}: {
  agentID: string;
  onAssignDevices: () => void;
  refreshToken: number;
}) => {
  type AssignedDeviceRow = {
    id: string;
    rowKey: string;
    deviceId?: string | null;
    serialNumber: string;
    hardwareModel: string;
    assignmentStatus: string;
    assignmentStatusRaw?: string;
    assignedAt?: string | null;
  };
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage] = useState<number>(12);
  const [search, setSearch] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [historySerial, setHistorySerial] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isReassignOpen, setIsReassignOpen] = useState<boolean>(false);
  const [isUnassignOpen, setIsUnassignOpen] = useState<boolean>(false);
  const [unassignAction, setUnassignAction] = useState<"RETURN" | "UNASSIGN">("UNASSIGN");
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);
  const [actionDevice, setActionDevice] = useState<any | null>(null);
  const { role } = useTokens();
  const roleName = role?.role?.toLowerCase() || "";
  const canAssignDevices = roleName.includes("admin") || roleName.includes("inventory");
  const canModifyAssignments = roleName.includes("admin");
  const canViewHistory = canAssignDevices || canModifyAssignments;

  const {
    data: devicesData,
    isLoading,
    error,
    errorStates,
    mutate: refreshDevices,
  } = useGetRequest(
    agentID
      ? `/v1/devices/assignments/agent/${agentID}?page=${currentPage}&limit=${entriesPerPage}`
      : null,
    !!agentID,
    60000
  );

  const rawDevices = devicesData?.devices ?? devicesData?.data ?? devicesData?.results ?? [];
  const totalDevices = getAssignedDevicesCount(devicesData);

  const rows: AssignedDeviceRow[] = rawDevices.map((item: any, index: number) => {
    const device = item?.device ?? item;
    const deviceId = device?.id || item?.deviceId || item?.id || null;
    const serialNumber = device?.serialNumber || device?.serial || device?.serial_number || "N/A";
    const assignmentStatus =
      item?.status || item?.assignmentStatus || device?.assignmentStatus || device?.status || "ASSIGNED";
    return {
      id: deviceId || `${index}`,
      rowKey: deviceId || serialNumber || `${index}`,
      deviceId,
      serialNumber,
      hardwareModel: device?.hardwareModel || device?.model || "N/A",
      assignmentStatus: normalizeAssignmentStatus(assignmentStatus),
      assignmentStatusRaw: assignmentStatus,
      assignedAt: item?.assignedAt || item?.createdAt || device?.createdAt || null,
    };
  });

  const filteredRows = useMemo<AssignedDeviceRow[]>(() => {
    const searchValue = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (searchValue) {
        const matchesSerial = row.serialNumber?.toLowerCase().includes(searchValue);
        const matchesModel = row.hardwareModel?.toLowerCase().includes(searchValue);
        const matchesStatus = row.assignmentStatus?.toLowerCase().includes(searchValue);
        if (!matchesSerial && !matchesModel && !matchesStatus) return false;
      }
      // Date range filter temporarily disabled.
      // if (dateFrom && dateTo) {
      //   if (!row.assignedAt) return false;
      //   const assignedDate = new Date(row.assignedAt);
      //   if (Number.isNaN(assignedDate.getTime())) return false;
      //   const fromDate = new Date(dateFrom);
      //   const toDate = new Date(dateTo);
      //   toDate.setHours(23, 59, 59, 999);
      //   if (assignedDate < fromDate) return false;
      //   if (assignedDate > toDate) return false;
      // }
      return true;
    });
  }, [rows, search, dateFrom, dateTo]);

  const selectedRows = filteredRows.filter((row) => selectedRowKeys.includes(row.rowKey));
  const hasBlockedSelection = selectedRows.some((row) => isBlockedAssignmentStatus(row.assignmentStatusRaw));
  const selectionCount = selectedRows.length;

  useEffect(() => {
    setSelectedRowKeys((prev) => prev.filter((key) => rows.some((row) => row.rowKey === key)));
  }, [rows]);

  useEffect(() => {
    if (refreshToken > 0) {
      refreshDevices();
    }
  }, [refreshToken, refreshDevices]);

  const toggleRowSelection = (rowKey: string) => {
    setSelectedRowKeys((prev) =>
      prev.includes(rowKey) ? prev.filter((key) => key !== rowKey) : [...prev, rowKey]
    );
  };

  const toggleSelectAll = () => {
    if (filteredRows.length === 0) return;
    if (selectedRowKeys.length === filteredRows.length) {
      setSelectedRowKeys([]);
    } else {
      setSelectedRowKeys(filteredRows.map((row) => row.rowKey));
    }
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-green-100 text-green-800";
      case "RETURNED":
        return "bg-blue-100 text-blue-800";
      case "LOST":
      case "DECOMMISSIONED":
        return "bg-red-100 text-red-800";
      case "REPAIR":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-[#F6F8FA] text-textDarkGrey";
    }
  };

  const openHistory = (serial: string) => {
    if (!serial || !canViewHistory) return;
    console.info("Device history serial:", serial);
    setHistorySerial(serial);
    setIsHistoryOpen(true);
  };

  const openActionMenu = (device: any) => {
    setActionDevice(device);
    setIsActionMenuOpen(true);
  };

  return (
    <div className="flex flex-col p-4 gap-3 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
      <DataStateWrapper
        isLoading={isLoading}
        error={error}
        errorStates={errorStates}
        refreshData={refreshDevices}
        errorMessage="Failed to fetch devices"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-base font-semibold text-textBlack">Assigned Devices</h3>
          <span className="text-xs text-textGrey">
            {totalDevices} device{totalDevices !== 1 ? "s" : ""} assigned
          </span>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#FAFBFC] border border-strokeGreyTwo rounded-2xl p-4">
            <div className="md:col-span-6">
              <label className="block text-xs text-textGrey mb-1 font-medium">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by serial, status, or model"
                className="w-full h-9 rounded-xl border border-strokeGreyTwo px-3 text-sm outline-none focus:ring-2 focus:ring-[#A58730]/20"
              />
            </div>
            <div className="md:col-span-6 flex items-end"></div>
          </div>

          {selectionCount > 0 ? (
            <div className="flex flex-wrap items-center gap-3 bg-[#F9FAFB] border border-strokeGreyTwo rounded-xl px-3 py-2">
              <span className="text-xs text-textGrey">{selectionCount} selected</span>
              {canViewHistory ? (
                <button
                  type="button"
                  className="text-xs text-[#7A5B10] font-semibold"
                  onClick={() => openHistory(selectedRows[0]?.serialNumber)}
                  disabled={selectionCount !== 1}
                >
                  View history
                </button>
              ) : null}
              {canModifyAssignments ? (
                <>
                  <button
                    type="button"
                    className="text-xs text-[#7A5B10] font-semibold disabled:text-textGrey"
                    onClick={() => setIsReassignOpen(true)}
                    disabled={hasBlockedSelection}
                  >
                    Reassign
                  </button>
                  <button
                    type="button"
                    className="text-xs text-[#7A5B10] font-semibold disabled:text-textGrey"
                    onClick={() => {
                      setUnassignAction("UNASSIGN");
                      setIsUnassignOpen(true);
                    }}
                    disabled={hasBlockedSelection}
                  >
                    Unassign
                  </button>
                </>
              ) : null}
              {hasBlockedSelection ? (
                <span className="text-[11px] text-textGrey">Blocked status selected</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 1.657-1.343 3-3 3S6 12.657 6 11s1.343-3 3-3 3 1.343 3 3zm7 7H5a2 2 0 01-2-2v-1a5 5 0 015-5h8a5 5 0 015 5v1a2 2 0 01-2 2zm-4-7a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {rows.length === 0 ? "No Devices Assigned" : "No Devices Match Filters"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {rows.length === 0
                ? "Assign devices to this agent to see them here."
                : "Try adjusting your filters or search term."}
            </p>
            {canAssignDevices ? (
              <button
                onClick={onAssignDevices}
                className="px-4 py-2 bg-primaryGradient text-white rounded-full text-sm font-medium hover:bg-primary transition-colors"
              >
                Assign Devices
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border border-strokeGreyTwo rounded-2xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#FAFBFC]">
                    <th className="text-left p-3 text-[11px] font-semibold tracking-wide text-[#7B8398]">
                      <input
                        type="checkbox"
                        checked={filteredRows.length > 0 && selectedRowKeys.length === filteredRows.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 accent-[#A58730]"
                      />
                    </th>
                    <th className="text-left p-3 text-[11px] font-semibold tracking-wide text-[#7B8398]">S/N</th>
                    <th className="text-left p-3 text-[11px] font-semibold tracking-wide text-[#7B8398]">SERIAL NUMBER</th>
                    <th className="text-left p-3 text-[11px] font-semibold tracking-wide text-[#7B8398]">HARDWARE MODEL</th>
                    <th className="text-left p-3 text-[11px] font-semibold tracking-wide text-[#7B8398]">STATUS</th>
                    <th className="text-left p-3 text-[11px] font-semibold tracking-wide text-[#7B8398]">ASSIGNED AT</th>
                    <th className="text-left p-3 text-[11px] font-semibold tracking-wide text-[#7B8398]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((device: any, index: number) => (
                      <tr key={device.id} className="border-b border-[#F6F8FA] hover:bg-[#FCFDFE]">
                        <td className="p-3 text-sm text-textDarkGrey">
                          <input
                            type="checkbox"
                            checked={selectedRowKeys.includes(device.rowKey)}
                            onChange={() => toggleRowSelection(device.rowKey)}
                            className="h-4 w-4 accent-[#A58730]"
                          />
                        </td>
                        <td className="p-3 text-sm text-textDarkGrey">
                          {String((currentPage - 1) * entriesPerPage + index + 1).padStart(2, "0")}
                        </td>
                        <td className="p-3 text-sm text-textDarkGrey">{device.serialNumber}</td>
                        <td className="p-3 text-sm text-textDarkGrey">{device.hardwareModel}</td>
                        <td className="p-3 text-sm text-textDarkGrey">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] ${statusBadgeClass(device.assignmentStatus)}`}>
                            {formatStatusLabel(device.assignmentStatus)}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-textDarkGrey">
                          {(() => {
                            if (!device.assignedAt) return "N/A";
                            const parsed = new Date(device.assignedAt);
                            return Number.isNaN(parsed.getTime())
                              ? "N/A"
                              : parsed.toLocaleDateString();
                          })()}
                        </td>
                        <td className="p-3 text-sm text-textDarkGrey">
                          <button
                            type="button"
                            onClick={() => openActionMenu(device)}
                            className="px-3 py-1 rounded-full border border-[#E5D9B8] bg-[#FFF7E2] text-[11px] font-semibold text-[#7A5B10] hover:bg-[#FCECC6] transition-colors"
                          >
                            Actions
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="text-xs text-textGrey">
                  Showing <span className="font-semibold">{filteredRows.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1}</span> to{" "}
                  <span className="font-semibold">
                    {filteredRows.length === 0
                      ? 0
                      : Math.min((currentPage - 1) * entriesPerPage + filteredRows.length, totalDevices)}
                  </span>{" "}
                  of <span className="font-semibold">{totalDevices}</span> Devices
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-textGrey">Page</span>
                <ListPagination
                  currentPage={currentPage}
                  totalItems={totalDevices}
                  itemsPerPage={entriesPerPage}
                  onPageChange={setCurrentPage}
                  label="Devices"
                />
              </div>
            </div>
          </>
        )}
      </DataStateWrapper>
      <DeviceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setHistorySerial(null);
        }}
        serialNumber={historySerial}
      />
      <ReassignDevicesModal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        currentAgentId={agentID}
        selectedDevices={selectedRows}
        onSuccess={() => {
          setIsReassignOpen(false);
          setSelectedRowKeys([]);
          refreshDevices();
        }}
      />
      <UnassignDevicesModal
        isOpen={isUnassignOpen}
        onClose={() => setIsUnassignOpen(false)}
        actionType={unassignAction}
        selectedDevices={selectedRows}
        onSuccess={() => {
          setIsUnassignOpen(false);
          setSelectedRowKeys([]);
          refreshDevices();
        }}
      />
      <Modal
        isOpen={isActionMenuOpen}
        onClose={() => {
          setIsActionMenuOpen(false);
          setActionDevice(null);
        }}
        layout="center"
        size="small"
      >
        <div className="flex flex-col bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-strokeGreyThree">
            <h3 className="text-sm font-semibold text-textBlack">Device Actions</h3>
            <span className="text-xs text-textGrey">{actionDevice?.serialNumber || "N/A"}</span>
          </div>
          <div className="p-4 grid grid-cols-1 gap-3">
            {canViewHistory ? (
              <button
                type="button"
                className="w-full px-4 py-2 rounded-xl border border-[#E5D9B8] bg-[#FFF7E2] text-[#7A5B10] text-sm font-semibold hover:bg-[#FCECC6] transition-colors"
                onClick={() => {
                  if (actionDevice?.serialNumber) {
                    openHistory(actionDevice.serialNumber);
                  }
                  setIsActionMenuOpen(false);
                }}
              >
                View History
              </button>
            ) : null}
            {canModifyAssignments ? (
              <>
                <button
                  type="button"
                  className="w-full px-4 py-2 rounded-xl border border-[#CFE2FF] bg-[#F1F6FF] text-[#2457B2] text-sm font-semibold hover:bg-[#E3EEFF] transition-colors"
                  onClick={() => {
                    setSelectedRowKeys([actionDevice?.rowKey]);
                    setIsReassignOpen(true);
                    setIsActionMenuOpen(false);
                  }}
                  disabled={isBlockedAssignmentStatus(actionDevice?.assignmentStatusRaw)}
                >
                  Reassign
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-2 rounded-xl border border-[#F4C7C7] bg-[#FCECEC] text-[#A32A2A] text-sm font-semibold hover:bg-[#F9DCDC] transition-colors"
                  onClick={() => {
                    setSelectedRowKeys([actionDevice?.rowKey]);
                    setUnassignAction("UNASSIGN");
                    setIsUnassignOpen(true);
                    setIsActionMenuOpen(false);
                  }}
                  disabled={isBlockedAssignmentStatus(actionDevice?.assignmentStatusRaw)}
                >
                  Unassign
                </button>
              </>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  );
};

const DeviceHistoryModal = ({
  isOpen,
  onClose,
  serialNumber,
}: {
  isOpen: boolean;
  onClose: () => void;
  serialNumber: string | null;
}) => {
  const {
    data: historyData,
    isLoading,
    error,
    errorStates,
    mutate: refreshHistory,
  } = useGetRequest(
    serialNumber ? `/v1/devices/assignments/history/${serialNumber}` : null,
    isOpen,
    60000
  );

  const historyItems = historyData?.history ?? historyData?.data ?? historyData?.results ?? historyData?.items ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} layout="right" bodyStyle="pb-44">
      <div className="flex flex-col items-center bg-white">
        <div className="flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleGrayGradientLeft">
          <h2 className="text-xl text-textBlack font-semibold font-secondary">
            Device Assignment History
          </h2>
        </div>
        <div className="w-full px-4 py-6">
          <DataStateWrapper
            isLoading={isLoading}
            error={error}
            errorStates={errorStates}
            refreshData={refreshHistory}
            errorMessage="Failed to fetch device history"
          >
            {historyItems.length === 0 ? (
              <div className="text-center text-textGrey py-8">No history found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-3 text-sm font-medium text-[#8990A5]">TIMESTAMP</th>
                      <th className="text-left p-3 text-sm font-medium text-[#8990A5]">ACTION</th>
                      <th className="text-left p-3 text-sm font-medium text-[#8990A5]">ACTOR</th>
                      <th className="text-left p-3 text-sm font-medium text-[#8990A5]">FROM → TO</th>
                      <th className="text-left p-3 text-sm font-medium text-[#8990A5]">REASON / NOTE</th>
                      <th className="text-left p-3 text-sm font-medium text-[#8990A5]">BATCH ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyItems.map((item: any, index: number) => {
                      const fromAgent = buildActorName(item?.fromAgent);
                      const toAgent = buildActorName(item?.toAgent);
                      const action = item?.action || item?.type || item?.status || "N/A";
                      const timestamp = item?.createdAt || item?.timestamp || item?.date;
                      const reason = item?.reason || item?.note || "N/A";
                      const batchId = item?.batchId || item?.batch || "";
                      return (
                        <tr key={item?.id || index} className="border-b border-[#F6F8FA]">
                          <td className="p-3 text-sm text-textDarkGrey">
                            {timestamp ? formatDateTime("datetime", timestamp) : "N/A"}
                          </td>
                          <td className="p-3 text-sm text-textDarkGrey">
                            {String(action).replace(/_/g, " ").toUpperCase()}
                          </td>
                          <td className="p-3 text-sm text-textDarkGrey">{buildActorName(item?.actor || item?.performedBy || item?.user)}</td>
                          <td className="p-3 text-sm text-textDarkGrey">{fromAgent} → {toAgent}</td>
                          <td className="p-3 text-sm text-textDarkGrey">{reason}</td>
                          <td className="p-3 text-sm text-textDarkGrey">
                            {batchId ? (
                              <button
                                type="button"
                                className="text-xs text-[#A58730] font-semibold"
                                onClick={() => copyToClipboard(batchId)}
                              >
                                {batchId}
                              </button>
                            ) : (
                              "N/A"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DataStateWrapper>
        </div>
      </div>
    </Modal>
  );
};

const ReassignDevicesModal = ({
  isOpen,
  onClose,
  currentAgentId,
  selectedDevices,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentAgentId: string;
  selectedDevices: {
    serialNumber: string;
  }[];
  onSuccess: () => void;
}) => {
  const { apiCall } = useApiCall();
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage] = useState<number>(20);
  const [targetAgentId, setTargetAgentId] = useState<string>("");
  const [reason, setReason] = useState<string>("TRANSFER");
  const [customReason, setCustomReason] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [mode, setMode] = useState<"ATOMIC" | "PARTIAL">("PARTIAL");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<{
    batchId?: string | null;
    successes: { serial: string }[];
    failures: { serial: string; reason?: string }[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTargetAgentId("");
      setReason("TRANSFER");
      setCustomReason("");
      setNote("");
      setMode("PARTIAL");
      setSubmitResult(null);
      setSearch("");
      setDebouncedSearch("");
      setCurrentPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const effectiveSearch = debouncedSearch.length >= 3 ? debouncedSearch : "";
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveSearch, entriesPerPage]);

  const agentsUrl = useMemo(() => {
    const base = `/v1/agents?page=${currentPage}&limit=${entriesPerPage}`;
    return effectiveSearch ? `${base}&search=${encodeURIComponent(effectiveSearch)}` : base;
  }, [currentPage, entriesPerPage, effectiveSearch]);

  const { data: agentsData, isLoading, error, errorStates, mutate: refreshAgents } = useGetRequest(
    agentsUrl,
    isOpen,
    60000
  );

  const agents = (agentsData?.agents ?? agentsData?.data ?? []).filter((agent: any) => agent?.id !== currentAgentId);
  const serials = selectedDevices.map((device) => device.serialNumber).filter(Boolean);

  const reasonValue = reason === "OTHER" ? customReason : reason;
  const fullReason = note ? `${reasonValue} - ${note}` : reasonValue;

  const handleSubmit = async () => {
    if (!targetAgentId || serials.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (serials.length > 1) {
        const response = await apiCall({
          endpoint: "/v1/devices/assignments/assign-bulk",
          method: "post",
          data: {
            deviceSerials: serials,
            agentId: targetAgentId,
            mode,
            reason: fullReason || undefined,
          },
          successMessage: "Devices reassigned successfully",
        });
        const payload = response?.data ?? response ?? {};
        const failures =
          payload?.failedDevices ||
          payload?.failed ||
          payload?.errors ||
          payload?.results?.failed ||
          [];
        const successes =
          payload?.assignedDevices ||
          payload?.assigned ||
          payload?.results?.success ||
          [];
        setSubmitResult({
          batchId: payload?.batchId || payload?.data?.batchId || null,
          successes: (successes || []).map((item: any) => ({
            serial: item?.serial || item?.deviceSerial || item?.deviceSerialNumber || item,
          })),
          failures: (failures || []).map((item: any) => ({
            serial: item?.serial || item?.deviceSerial || item?.deviceSerialNumber || item?.device || "",
            reason: item?.reason || item?.message || item?.error,
          })),
        });
      } else {
        await apiCall({
          endpoint: "/v1/devices/assignments/assign",
          method: "post",
          data: {
            deviceSerial: serials[0],
            agentId: targetAgentId,
            reason: fullReason || undefined,
          },
          successMessage: "Device reassigned successfully",
        });
        setSubmitResult({
          batchId: null,
          successes: [{ serial: serials[0] }],
          failures: [],
        });
      }
    } catch (err) {
      void 0;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    if (submitResult?.successes?.length) {
      onSuccess();
    }
  };

  const downloadFailedCsv = () => {
    if (!submitResult || submitResult.failures.length === 0) return;
    const rows = ["serial,reason", ...submitResult.failures.map((f) => `${f.serial},${f.reason || ""}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "failed-device-reassignments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} layout="right" bodyStyle="pb-44">
      <div className="flex flex-col items-center bg-white">
        <div className="flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleGrayGradientLeft">
          <h2 className="text-xl text-textBlack font-semibold font-secondary">Reassign Devices</h2>
        </div>
        <div className="w-full px-4 py-6">
          <DataStateWrapper
            isLoading={isLoading}
            error={error}
            errorStates={errorStates}
            refreshData={refreshAgents}
            errorMessage="Failed to fetch agents"
          >
            <div className="mb-4">
              <p className="text-xs text-textGrey">
                {serials.length} device{serials.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-textGrey mb-1 font-medium">Search agents</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type at least 3 letters"
                className="w-full h-10 rounded-xl border border-strokeGreyTwo px-3 text-sm outline-none focus:ring-2 focus:ring-[#A58730]/30"
              />
            </div>
            <div className="max-h-[220px] overflow-y-auto border border-strokeGreyTwo rounded-lg">
              {agents.map((agent: any) => {
                const name = [agent?.user?.firstname, agent?.user?.lastname].filter(Boolean).join(" ");
                return (
                  <button
                    type="button"
                    key={agent.id}
                    onClick={() => setTargetAgentId(agent.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm border-b border-strokeGreyTwo ${
                      targetAgentId === agent.id ? "bg-[#FEF5DA]" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-textBlack">{name || agent?.user?.email || "Unknown Agent"}</span>
                    {targetAgentId === agent.id ? (
                      <span className="text-xs text-[#A58730] font-semibold">Selected</span>
                    ) : null}
                  </button>
                );
              })}
              {agents.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-textGrey">No agents found.</div>
              ) : null}
            </div>

            <div className="mt-4">
              <label className="block text-xs text-textGrey mb-1 font-medium">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-strokeGreyTwo px-3 py-2 text-sm outline-none"
              >
                <option value="TRANSFER">Transfer</option>
                <option value="AGENT_REQUEST">Agent Request</option>
                <option value="INVENTORY_UPDATE">Inventory Update</option>
                <option value="OTHER">Other</option>
              </select>
              {reason === "OTHER" ? (
                <input
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter custom reason"
                  className="mt-2 w-full rounded-xl border border-strokeGreyTwo px-3 py-2 text-sm outline-none"
                />
              ) : null}
            </div>

            <div className="mt-4">
              <label className="block text-xs text-textGrey mb-1 font-medium">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-strokeGreyTwo px-3 py-2 text-sm outline-none"
              />
            </div>

            {serials.length > 1 ? (
              <div className="mt-4">
                <label className="block text-xs text-textGrey mb-1 font-medium">Bulk mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value === "ATOMIC" ? "ATOMIC" : "PARTIAL")}
                  className="w-full rounded-xl border border-strokeGreyTwo px-3 py-2 text-sm outline-none"
                >
                  <option value="PARTIAL">PARTIAL (best effort)</option>
                  <option value="ATOMIC">ATOMIC (all or nothing)</option>
                </select>
              </div>
            ) : null}

            {submitResult ? (
              <div className="mt-4 border border-strokeGreyTwo rounded-xl p-4 bg-[#F9FAFB]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-textBlack">Reassign Results</p>
                  {submitResult.batchId ? (
                    <span className="text-xs text-textGrey">Batch: {submitResult.batchId}</span>
                  ) : null}
                </div>
                <p className="text-xs text-textGrey">
                  Success: {submitResult.successes.length} • Failed: {submitResult.failures.length}
                </p>
                {submitResult.failures.length > 0 ? (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            submitResult.failures
                              .map((f) => `${f.serial}${f.reason ? `,${f.reason}` : ""}`)
                              .join("\n")
                          )
                        }
                        className="text-xs text-[#A58730] font-semibold"
                      >
                        Copy failed list
                      </button>
                      <button
                        type="button"
                        onClick={downloadFailedCsv}
                        className="text-xs text-[#A58730] font-semibold"
                      >
                        Download CSV
                      </button>
                    </div>
                    <div className="mt-2 max-h-40 overflow-y-auto text-xs text-textDarkGrey">
                      {submitResult.failures.map((fail, idx) => (
                        <div key={`${fail.serial}-${idx}`} className="flex justify-between border-b border-strokeGreyTwo py-1">
                          <span>{fail.serial || "Unknown"}</span>
                          <span className="text-textGrey">{fail.reason || "Failed"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3.5 px-4 text-sm font-semibold text-textDarkGrey bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-200 shadow-sm"
              >
                {submitResult ? "Close" : "Cancel"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!targetAgentId || serials.length === 0 || isSubmitting}
                className={`flex-1 py-3.5 px-4 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                  targetAgentId && serials.length > 0 && !isSubmitting
                    ? "bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white hover:opacity-90 shadow-lg hover:shadow-xl"
                    : "bg-gray-100 text-textDarkGrey cursor-not-allowed shadow-sm"
                }`}
              >
                {isSubmitting ? "Reassigning..." : "Reassign Devices"}
              </button>
            </div>
          </DataStateWrapper>
        </div>
      </div>
    </Modal>
  );
};

const UnassignDevicesModal = ({
  isOpen,
  onClose,
  actionType,
  selectedDevices,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  actionType: "RETURN" | "UNASSIGN";
  selectedDevices: {
    serialNumber: string;
    deviceId?: string | null;
  }[];
  onSuccess: () => void;
}) => {
  const { apiCall } = useApiCall();
  const [reason, setReason] = useState<string>(actionType === "RETURN" ? "RETURNED_TO_INVENTORY" : "UNASSIGNED");
  const [customReason, setCustomReason] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<{
    successes: { serial: string }[];
    failures: { serial: string; reason?: string }[];
  } | null>(null);

  useEffect(() => {
    setReason(actionType === "RETURN" ? "RETURNED_TO_INVENTORY" : "UNASSIGNED");
    setCustomReason("");
    setNote("");
    setSubmitResult(null);
  }, [actionType, isOpen]);

  const serials = selectedDevices.map((device) => device.serialNumber).filter(Boolean);
  const reasonValue = reason === "OTHER" ? customReason : reason;
  const fullReason = note ? `${reasonValue} - ${note}` : reasonValue;
  const hasValidReason = reason !== "OTHER" || customReason.trim().length > 0;

  const handleSubmit = async () => {
    if (serials.length === 0 || isSubmitting || !hasValidReason) return;
    setIsSubmitting(true);
    const successes: { serial: string }[] = [];
    const failures: { serial: string; reason?: string }[] = [];

    await Promise.all(
      selectedDevices.map(async (device) => {
        if (!device.deviceId) {
          failures.push({ serial: device.serialNumber, reason: "Missing device id" });
          return;
        }
        try {
          await apiCall({
            endpoint: `/v1/devices/assignments/unassign/${device.deviceId}`,
            method: "delete",
            params: { reason: fullReason || undefined },
            successMessage: `${actionType === "RETURN" ? "Returned" : "Unassigned"} ${device.serialNumber}`,
          });
          successes.push({ serial: device.serialNumber });
        } catch (err: any) {
          const errorMessage =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed";
          failures.push({ serial: device.serialNumber, reason: errorMessage });
        }
      })
    );

    setSubmitResult({ successes, failures });
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    if (submitResult?.successes?.length) {
      onSuccess();
    }
  };

  const downloadFailedCsv = () => {
    if (!submitResult || submitResult.failures.length === 0) return;
    const rows = ["serial,reason", ...submitResult.failures.map((f) => `${f.serial},${f.reason || ""}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "failed-device-unassignments.csv");
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
            {actionType === "RETURN" ? "Return Devices" : "Unassign Devices"}
          </h2>
        </div>
        <div className="w-full px-4 py-6">
          <p className="text-xs text-textGrey">
            {serials.length} device{serials.length !== 1 ? "s" : ""} selected
          </p>
          <div className="mt-4">
            <label className="block text-xs text-textGrey mb-1 font-medium">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-strokeGreyTwo px-3 py-2 text-sm outline-none"
            >
              {actionType === "RETURN" ? (
                <>
                  <option value="RETURNED_TO_INVENTORY">Returned to inventory</option>
                  <option value="REPAIR">Repair</option>
                  <option value="OTHER">Other</option>
                </>
              ) : (
                <>
                  <option value="UNASSIGNED">Unassigned</option>
                  <option value="AGENT_REQUEST">Agent request</option>
                  <option value="OTHER">Other</option>
                </>
              )}
            </select>
            {reason === "OTHER" ? (
              <input
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom reason"
                className="mt-2 w-full rounded-xl border border-strokeGreyTwo px-3 py-2 text-sm outline-none"
              />
            ) : null}
          </div>
          <div className="mt-4">
            <label className="block text-xs text-textGrey mb-1 font-medium">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-strokeGreyTwo px-3 py-2 text-sm outline-none"
            />
          </div>

          {submitResult ? (
            <div className="mt-4 border border-strokeGreyTwo rounded-xl p-4 bg-[#F9FAFB]">
              <p className="text-xs text-textGrey">
                Success: {submitResult.successes.length} • Failed: {submitResult.failures.length}
              </p>
              {submitResult.failures.length > 0 ? (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          submitResult.failures
                            .map((f) => `${f.serial}${f.reason ? `,${f.reason}` : ""}`)
                            .join("\n")
                        )
                      }
                      className="text-xs text-[#A58730] font-semibold"
                    >
                      Copy failed list
                    </button>
                    <button
                      type="button"
                      onClick={downloadFailedCsv}
                      className="text-xs text-[#A58730] font-semibold"
                    >
                      Download CSV
                    </button>
                  </div>
                  <div className="mt-2 max-h-40 overflow-y-auto text-xs text-textDarkGrey">
                    {submitResult.failures.map((fail, idx) => (
                      <div key={`${fail.serial}-${idx}`} className="flex justify-between border-b border-strokeGreyTwo py-1">
                        <span>{fail.serial || "Unknown"}</span>
                        <span className="text-textGrey">{fail.reason || "Failed"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3.5 px-4 text-sm font-semibold text-textDarkGrey bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-200 shadow-sm"
            >
              {submitResult ? "Close" : "Cancel"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={serials.length === 0 || isSubmitting || !hasValidReason}
              className={`flex-1 py-3.5 px-4 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                serials.length > 0 && !isSubmitting && hasValidReason
                  ? "bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white hover:opacity-90 shadow-lg hover:shadow-xl"
                  : "bg-gray-100 text-textDarkGrey cursor-not-allowed shadow-sm"
              }`}
            >
              {isSubmitting ? "Submitting..." : actionType === "RETURN" ? "Return Devices" : "Unassign Devices"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Installers Table Component
const InstallersTable = ({ agentID }: { agentID: string }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage] = useState<number>(12);
  // First fetch agents data from API
  const {
    data: agentsData,
    isLoading: agentsLoading,
    error: agentsError,
    errorStates: agentsErrorStates,
    mutate: refreshAgents
  } = useGetRequest(
    `/v1/agents?category=INSTALLER`,
    true,
    60000
  );

  // Then fetch installers data for the specific agent
  const {
    data: installersData,
    isLoading: installersLoading,
    error: installersError,
    errorStates: installersErrorStates,
    mutate: refreshInstallers
  } = useGetRequest(
    agentID ? `/v1/agents/${agentID}` : null,
    !!agentID,
    60000
  );

  const isLoading = agentsLoading || installersLoading;
  const error = agentsError || installersError;
  const errorStates = agentsErrorStates || installersErrorStates;

  return (
    <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
      <DataStateWrapper
        isLoading={isLoading}
        error={error}
        errorStates={errorStates}
        refreshData={async () => {
          await Promise.all([refreshAgents(), refreshInstallers()]);
        }}
        errorMessage="Failed to fetch data"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-2 text-xs font-medium text-[#8990A5]">
                    S/N
                </th>
                <th className="text-left p-2 text-xs font-medium text-[#8990A5]">
                    AGENT NAME
                </th>
                <th className="text-left p-2 text-xs font-medium text-[#8990A5]">
                    LOCATION
                </th>
                <th className="text-left p-2 text-xs font-medium text-[#8990A5]">
                  ASSIGNED
                </th>
                <th className="text-left p-2 text-xs font-medium text-[#8990A5]">
                    STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {agentsData?.agents?.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map((agent: any, index: number) => (
                <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3 text-sm text-textDarkGrey">
                    {String((currentPage - 1) * entriesPerPage + index + 1).padStart(2, '0')}
                  </td>
                  <td className="p-3 text-sm text-textDarkGrey">
                    {agent.user?.firstname} {agent.user?.lastname}
                  </td>
                  <td className="p-3 text-sm text-textDarkGrey">
                    {agent.user?.location || 'N/A'}
                  </td>
                  <td className="p-3 text-sm text-textDarkGrey">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 border border-gray-300 rounded-full text-xs font-medium">
                      {String(agent.installers?.length || 0).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-textDarkGrey">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      agent.user?.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {agent.user?.status?.toUpperCase() || 'INACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-xs text-textGrey">
              Showing <span className="font-semibold">{(currentPage - 1) * entriesPerPage + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(currentPage * entriesPerPage, agentsData?.agents?.length || 0)}</span> of{" "}
              <span className="font-semibold">{agentsData?.agents?.length || 0}</span> Installers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-textGrey">Page</span>
            <ListPagination
              currentPage={currentPage}
              totalItems={agentsData?.agents?.length || 0}
              itemsPerPage={entriesPerPage}
              onPageChange={setCurrentPage}
              label="Installers"
            />
          </div>
        </div>
      </DataStateWrapper>
    </div>
  );
};

const AgentModal = ({
  isOpen,
  setIsOpen,
  agentID,
  refreshTable,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  agentID: string;
  refreshTable: KeyedMutator<any>;
}) => {
  // const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [tabContent, setTabContent] = useState<string>("agentDetails");
  const [isAssignCustomersModalOpen, setIsAssignCustomersModalOpen] = useState<boolean>(false);
  const [isAssignProductsModalOpen, setIsAssignProductsModalOpen] = useState<boolean>(false);
  const [isAssignInstallersModalOpen, setIsAssignInstallersModalOpen] = useState<boolean>(false);
  const [isAssignDevicesModalOpen, setIsAssignDevicesModalOpen] = useState<boolean>(false);
  const [isWalletTopUpModalOpen, setIsWalletTopUpModalOpen] = useState<boolean>(false);
  const [isInstallationHistoryModalOpen, setIsInstallationHistoryModalOpen] = useState<boolean>(false);
  const [selectedInstallationId, setSelectedInstallationId] = useState<string | null>(null);
  const [isTaskHistoryModalOpen, setIsTaskHistoryModalOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [devicesRefreshToken, setDevicesRefreshToken] = useState<number>(0);
  const { role } = useTokens();
  const roleName = role?.role?.toLowerCase() || "";
  const canAssignDevices = roleName.includes("admin") || roleName.includes("inventory");

  const fetchSingleAgent = useGetRequest(`/v1/agents/${agentID}`, false);

  const generateAgentEntries = (data: any): ExtendedAgentUserType => {
    return {
      id: data?.id,
      firstname: data?.user?.firstname,
      lastname: data?.user?.lastname,
      email: data?.user?.email,
      phone: data?.user?.phone,
      location: data?.user?.location,
      longitude: data?.user?.longitude,
      latitude: data?.user?.latitude,
      addressType: data?.user?.addressType,
      status: data?.user?.status,
      emailVerified: data?.user?.emailVerified,
      category: data?.category,
    };
  };

  // const handleCancelClick = () => setDisplayInput(false);

  // Get assigned data from store
  const { agentAssignmentStore } = rootStore;
  const assignments = agentAssignmentStore.assignments;
  const assignedData = assignments.find(a => a.agentId === agentID);
  const assignedCustomersCount = assignedData?.customers?.length || 0;

  // Fetch installers data for the count
  const {
    data: installersCountData,
    isLoading: installersCountLoading,
  } = useGetRequest(
    `/v1/agents?category=INSTALLER`,
    true,
    60000
  );

  // Get agent category to determine which tabs to show
  const agentCategory = fetchSingleAgent?.data?.category || fetchSingleAgent?.data?.user?.category || "SALES";

  const {
    data: assignedDevicesCountData,
    mutate: refreshAssignedDevicesCount,
  } = useGetRequest(
    agentCategory !== "INSTALLER" && isOpen
      ? `/v1/devices/assignments/agent/${agentID}?page=1&limit=1`
      : null,
    agentCategory !== "INSTALLER" && isOpen,
    60000
  );

  const assignedDevicesCount = getAssignedDevicesCount(assignedDevicesCountData);

  // Get dropdown items based on agent category
  const getDropdownItems = () => {
    if (agentCategory === "INSTALLER") {
      return ["Assign to Agent", "Block", "Cancel"];
    } else {
      const items = ["Assign Customer", "Assign Product", "Assign Installer"];
      if (canAssignDevices) {
        items.push("Assign Device");
      }
      items.push("Top Up wallet", "Block Sales Agent", "Cancel Agent");
      return items;
    }
  };

  const dropdownItems = getDropdownItems();

  const dropDownList = {
    items: dropdownItems,
    onClickLink: (index: number) => {
      const selectedItem = dropdownItems[index];
      if (agentCategory === "INSTALLER") {
        // Installer agent dropdown actions
        switch (selectedItem) {
          case "Assign to Agent":
            void 0;
            setIsWalletTopUpModalOpen(true);
            break;
          case "Block":
            void 0;
            // TODO: Implement block installer agent functionality
            break;
          case "Cancel":
            void 0;
            // TODO: Implement cancel installer agent functionality
            break;
          default:
            break;
        }
      } else {
        // Sales agent dropdown actions
        switch (selectedItem) {
          case "Assign Customer":
            void 0;
            setIsAssignCustomersModalOpen(true);
            break;
          case "Assign Product":
            void 0;
            setIsAssignProductsModalOpen(true);
            break;
          case "Assign Installer":
            void 0;
            setIsAssignInstallersModalOpen(true);
            break;
          case "Assign Device":
            void 0;
            setIsAssignDevicesModalOpen(true);
            break;
          case "Top Up wallet":
            void 0;
            setIsWalletTopUpModalOpen(true);
            break;
          case "Block Sales Agent":
            void 0;
            // TODO: Implement block sales agent functionality
            break;
          case "Cancel Agent":
            void 0;
            // TODO: Implement cancel agent functionality
            break;
          default:
            break;
        }
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  // Fetch installation count for installer agents
  const {
    data: installationData,
    isLoading: installationLoading,
    error: installationError,
    errorStates: installationErrorStates,
    mutate: refreshInstallations
  } = useGetRequest(
    agentCategory === "INSTALLER" ? `/v1/installer/installation-history/` : null,
    agentCategory === "INSTALLER",
    60000
  );

  // Fetch task history count for installer agents
  const {
    data: taskData,
    isLoading: taskLoading,
    error: taskError,
    errorStates: taskErrorStates,
    mutate: refreshTasks
  } = useGetRequest(
    agentCategory === "INSTALLER" ? `/v1/installer/task-history/` : null,
    agentCategory === "INSTALLER",
    60000
  );

  // Define tabs based on agent category
  const getTabNames = () => {
    if (agentCategory === "INSTALLER") {
      return [
        { name: "Agent Details", key: "agentDetails", count: null },
        { name: "Installation History", key: "installationHistory", count: installationData?.total || 0 },
        { name: "Task History", key: "taskHistory", count: taskData?.total || 0 },
        { name: "Commissions", key: "commissions", count: null },
      ];
    } else {
      return [
        { name: "Agent Details", key: "agentDetails", count: null },
        { name: "Customer", key: "customer", count: assignedCustomersCount },
        { name: "Installers", key: "installers", count: installersCountData?.agents?.length || 0 },
        { name: "Inventory", key: "inventory", count: 0 },
        { name: "Products", key: "products", count: assignedData?.products?.length || 0 },
        { name: "Devices", key: "devices", count: assignedDevicesCount },
        { name: "Transactions", key: "transactions", count: 0 },
        { name: "Stats", key: "stats", count: 0 },
        { name: "Sales", key: "sales", count: 0 },
        { name: "Tickets", key: "tickets", count: 0 },
        { name: "Commissions", key: "commissions", count: null },
      ];
    }
  };

  const tabNames = getTabNames();

  return (
    <>
      <Modal
        layout="right"
        size="large"
        bodyStyle="pb-44 overflow-auto"
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setTabContent("agentDetails");
          // setDisplayInput(false)
        }}
        rightHeaderComponents={
          fetchSingleAgent?.data?.user?.firstname ? (
            <div className="flex items-center gap-2 absolute left-4">
              <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
                {fetchSingleAgent?.data?.category || fetchSingleAgent?.data?.user?.category || "SALES"} AGENT
              </p>
              <p className="flex items-center gap-1 bg-paleLightBlue w-max p-2 h-[24px] text-success text-xs font-semibold rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {fetchSingleAgent?.data?.user?.status?.toUpperCase() || "ACTIVE"}
              </p>
            </div>
          ) : null
        }
      >
        <div className="bg-white">
          <header
            className={`flex items-center ${
              fetchSingleAgent?.data?.user?.firstname
                ? "justify-between"
                : "justify-end"
            } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
          >
            {fetchSingleAgent?.data?.user?.firstname ? (
              <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
                {fetchSingleAgent?.data?.user?.firstname}{" "}
                {fetchSingleAgent?.data?.user?.lastname}
              </p>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <DropDown {...dropDownList} />
            </div>
          </header>
          <div className="flex flex-col w-full gap-4 px-4 py-2">
            <TabComponent
              tabs={tabNames.map(({ name, key, count }) => ({
                name,
                key,
                count,
              }))}
              onTabSelect={(key) => setTabContent(key)}
              tabsContainerClass="p-2 rounded-[20px]"
            />
            {tabContent === "agentDetails" ? (
              <DataStateWrapper
                isLoading={fetchSingleAgent?.isLoading}
                error={fetchSingleAgent?.error}
                errorStates={fetchSingleAgent?.errorStates}
                refreshData={fetchSingleAgent?.mutate}
                errorMessage="Failed to fetch agent details"
              >
                <AgentDetails
                  {...generateAgentEntries(fetchSingleAgent.data)}
                  refreshTable={refreshTable}
                  displayInput={false}
                  onClose={() => setIsOpen(false)}
                />
              </DataStateWrapper>
            ) : tabContent === "customer" ? (
              <CustomerTable 
                agentID={agentID} 
                onAssignCustomers={() => setIsAssignCustomersModalOpen(true)}
              />
            ) : tabContent === "installers" ? (
              <InstallersTable agentID={agentID} />
            ) : tabContent === "devices" ? (
              <AssignedDevicesTable
                agentID={agentID}
                onAssignDevices={() => setIsAssignDevicesModalOpen(true)}
                refreshToken={devicesRefreshToken}
              />
            ) : tabContent === "installationHistory" ? (
              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <div className="flex items-center justify-between p-4">
                  <h3 className="text-lg font-semibold text-textBlack">Installation History</h3>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <DataStateWrapper
                    isLoading={installationLoading}
                    error={installationError}
                    errorStates={installationErrorStates}
                    refreshData={refreshInstallations}
                    errorMessage="Failed to fetch installation history"
                  >
                    {installationData?.installations?.length > 0 ? (
                      installationData.installations.map((installation: any) => (
                        <div 
                          key={installation.id}
                          className="flex items-center justify-between p-3 border border-strokeGreyTwo rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setSelectedInstallationId(installation.id);
                            setIsInstallationHistoryModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-semibold text-textBlack">Installation #{installation.id}</p>
                              <p className="text-xs text-textGrey">{installation.customer?.firstname} {installation.customer?.lastname}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              installation.status === "INSTALLED" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {installation.status}
                            </span>
                            <span className="text-xs text-textGrey">{new Date(installation.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-textGrey">
                        <p>No installation history found</p>
                      </div>
                    )}
                  </DataStateWrapper>
                </div>
              </div>
            ) : tabContent === "commissions" ? (
              <CommissionsTab agentID={agentID} />
            ) : tabContent === "taskHistory" ? (
              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <div className="flex items-center justify-between p-4">
                  <h3 className="text-lg font-semibold text-textBlack">Task History</h3>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <DataStateWrapper
                    isLoading={taskLoading}
                    error={taskError}
                    errorStates={taskErrorStates}
                    refreshData={refreshTasks}
                    errorMessage="Failed to fetch task history"
                  >
                    {taskData?.tasks?.length > 0 ? (
                      taskData.tasks.map((task: any) => (
                        <div 
                          key={task.id}
                          className="flex items-center justify-between p-3 border border-strokeGreyTwo rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setIsTaskHistoryModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-semibold text-textBlack">Task #{task.id}</p>
                              <p className="text-xs text-textGrey">{task.customer?.firstname} {task.customer?.lastname}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              task.status === "DONE" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {task.status}
                            </span>
                            <span className="text-xs text-textGrey">{new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-textGrey">
                        <p>No task history found</p>
                      </div>
                    )}
                  </DataStateWrapper>
                </div>
              </div>
            ) : (
              <div>
                {tabNames?.find((item) => item.key === tabContent)?.name} Coming
                Soon
              </div>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Assign Customers Modal */}
      <AssignCustomersModal
        isOpen={isAssignCustomersModalOpen}
        onClose={() => setIsAssignCustomersModalOpen(false)}
        agentID={agentID}
        onSuccess={() => {
          // Refresh agent data after assigning customers
          fetchSingleAgent.mutate();
        }}
      />
      
      {/* Assign Products Modal */}
      <AssignProductsModal
        isOpen={isAssignProductsModalOpen}
        onClose={() => setIsAssignProductsModalOpen(false)}
        agentID={agentID}
        onSuccess={() => {
          // Refresh agent data after assigning products
          fetchSingleAgent.mutate();
        }}
      />

      {/* Assign Installers Modal */}
      <AssignInstallersModal
        isOpen={isAssignInstallersModalOpen}
        onClose={() => setIsAssignInstallersModalOpen(false)}
        agentID={agentID}
        onSuccess={() => {
          fetchSingleAgent.mutate();
        }}
      />
      
      {/* Assign Devices Modal */}
      <AssignDevicesModal
        isOpen={isAssignDevicesModalOpen}
        onClose={() => setIsAssignDevicesModalOpen(false)}
        agentID={agentID}
        onSuccess={() => {
          refreshAssignedDevicesCount();
          setDevicesRefreshToken((prev) => prev + 1);
        }}
      />

      {/* Top Up Wallet Modal */}
      <Modal
        isOpen={isWalletTopUpModalOpen}
        onClose={() => {
          setIsWalletTopUpModalOpen(false);
        }}
        layout="right"
        size="small"
        bodyStyle="pb-44"
      >
        <div className="flex flex-col items-center bg-white">
          <div className="flex items-center justify-center gap-3 px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleGrayGradientLeft">
            <img src={walletIcon} alt="wallet" className="w-6 h-6" />
            <h2 className="text-xl text-textBlack font-semibold font-secondary">
              Top Up Wallet
            </h2> 
          </div>
          
          <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
            <TopUpWalletForm
              handleClose={() => {
                setIsWalletTopUpModalOpen(false);
              }}
              refreshTable={fetchSingleAgent.mutate}
            />
          </div>
        </div>
      </Modal>

      {/* Installation History Modal */}
      <InstallationHistoryModal
        isOpen={isInstallationHistoryModalOpen}
        onClose={() => {
          setIsInstallationHistoryModalOpen(false);
          setSelectedInstallationId(null);
        }}
        installationId={selectedInstallationId}
      />

      {/* Task History Modal */}
      <TaskHistoryModal
        isOpen={isTaskHistoryModalOpen}
        onClose={() => {
          setIsTaskHistoryModalOpen(false);
          setSelectedTaskId(null);
        }}
        taskId={selectedTaskId}
      />
    </>
  );
};

export default AgentModal;
