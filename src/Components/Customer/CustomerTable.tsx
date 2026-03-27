import { useState } from "react";
import { KeyedMutator } from "swr";
import { PaginationType, Table } from "../TableComponent/Table";
import { GoDotFill } from "react-icons/go";
import clock from "../../assets/table/clock.svg";
import CustomerModal from "./CustomerModal";
import { ApiErrorStatesType, useApiCall } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";



interface CustomerEntries {
  id: string;
  no: number;
  name: string;
  email: string;
  location: string;
  status: string;
  approvalStatus: string;
}

type Permission = {
  id: string;
  action: string;
  subject: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type Role = {
  id: string;
  role: string;
  active: boolean;
  permissionIds: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  permissions: Permission[];
};

type CustomerDetails = {
  id: string;
  type: string;
  createdBy: string;
  creatorId: string;
  agentId: string;
  userId: string;
};

export type CustomerType = {
  id: string;
  firstname: string;
  lastname: string;
  username: string | null;
  email: string | null;
  phone: string;
  alternatePhone?: string;
  gender?: string;
  location: string;
  installationAddress?: string;
  addressType: string | null;
  lga?: string;
  state?: string;
  staffId?: string | null;
  longitude: string;
  latitude: string;
  idType?: string;
  idNumber?: string;
  type?: string;
  emailVerified: boolean;
  isBlocked: boolean;
  status: string;
  approvalStatus?: "APPROVED" | "REJECTED" | "PENDING" | string;
  isApproved?: boolean;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastLogin: string | null;
  customerDetails: CustomerDetails;
  role: Role;
  passportPhotoUrl?: string | null;
  idImageUrl?: string | null;
  contractFormImageUrl?: string | null;
};

const generateCustomerEntries = (data: any): CustomerEntries[] => {
  const entries: CustomerEntries[] =
    data?.customers?.map((item: CustomerType, index: number) => {
      const approval = (item?.approvalStatus || "PENDING").toUpperCase();
      const normalizedStatus =
        approval === "APPROVED" ? "active" : (item?.status || "").toLowerCase();

      return {
        id: item?.id,
        no: index + 1,
        name: `${item?.firstname} ${item?.lastname}`,
        email: item?.email ?? "—",
        location: item?.location,
        status: normalizedStatus,
        approvalStatus: approval,
      };
    }) ?? [];
  return entries;
};

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  confirmClassName?: string;
  showReason?: boolean;
  reason?: string;
  onReasonChange?: (v: string) => void;
  reasonLabel?: string;
  reasonPlaceholder?: string;
};

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onClose,
  confirmClassName,
  showReason = false,
  reason = "",
  onReasonChange,
  reasonLabel = "Reason for rejection",
  reasonPlaceholder = "Enter reason…",
}: ConfirmModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative w-[min(92vw,520px)] rounded-2xl bg-white shadow-2xl border border-strokeGreyTwo p-5">
        <h3 className="text-lg font-semibold text-textBlack">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm text-textGrey">{description}</p>
        ) : null}

        {showReason && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-textBlack mb-1">
              {reasonLabel}
            </label>
            <textarea
              className="w-full min-h-[88px] rounded-lg border border-strokeGreyTwo px-3 py-2 text-sm outline-none focus:border-light-green"
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e) => onReasonChange?.(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            className="px-3 py-2 text-sm rounded-full border border-strokeGreyTwo bg-[#F6F8FA] hover:bg-gray-100 disabled:opacity-60"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`px-3 py-2 text-sm rounded-full border text-white transition-colors disabled:opacity-60 ${
              confirmClassName ||
              "border-[#9B2B23] bg-[#9B2B23] hover:bg-[#8A261F]"
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerTable = ({
  customerData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  customerData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  error: any;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
  const { apiCall } = useApiCall();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customerID, setCustomerID] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    approve: boolean;
    label?: string;
  } | null>(null);

  const [rejectionReason, setRejectionReason] = useState<string>("");

  const API_BASE = (import.meta.env?.VITE_API_BASE ?? "").replace(/\/$/, "");

  const handleApproveReject = async (
    id: string,
    approve: boolean,
    reason?: string
  ) => {
    try {
      setActionLoadingId(id);
      setActionType(approve ? "approve" : "reject");

      await apiCall({
        endpoint: `${API_BASE}/v1/customers/${id}/approve`,
        method: "post",
        data: approve
          ? { approve: true }
          : { approve: false, ...(reason ? { rejectionReason: reason } : {}) },
        successMessage: approve ? "Customer approved" : "Customer rejected",
      });

      await refreshTable();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const applyApprovalStatus = (
    which: "APPROVED" | "REJECTED" | "PENDING"
  ) => {
    setQueryValue(which.toLowerCase());
    setIsSearchQuery(true);

    setTableQueryParams((prev) => {
      const next = { ...(prev || {}) };
      delete (next as any).sRejected;
      delete (next as any).isApproved;
      delete (next as any).isPending;

      if (which === "APPROVED") (next as any).isApproved = true;
      if (which === "REJECTED") (next as any).sRejected = true;
      if (which === "PENDING") (next as any).isPending = true;

      return next;
    });
  };

  const filterList = [
    {
      name: "Location",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...(prevParams || {}),
          location: query,
        }));
      },
      isSearch: true,
    },
    {
      name: "Status",
      items: ["Active", "Inactive", "Barred"],
      onClickLink: async (index: number) => {
        const data = ["Active", "Inactive", "Barred"].map((item) =>
          item.toLocaleLowerCase()
        );
        const query = data[index];
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...(prevParams || {}),
          status: query,
        }));
      },
    },
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...(prevParams || {}),
          search: query,
        }));
      },
      isSearch: true,
    },
    {
      name: "Approval Status",
      items: ["Approved", "Rejected", "Pending"],
      onClickLink: async (index: number) => {
        const picked = ["APPROVED", "REJECTED", "PENDING"][
          index
        ] as "APPROVED" | "REJECTED" | "PENDING";
        applyApprovalStatus(picked);
      },
    },
    {
      onDateClick: (date: string) => {
        setQueryValue(date);
        setIsSearchQuery(false);
        setTableQueryParams((prevParams) => ({
          ...(prevParams || {}),
          createdAt: date.split("T")[0],
        }));
      },
      isDate: true,
    },
  ];

  const columnList = [
    { title: "S/N", key: "no" },
    { title: "NAME", key: "name" },
    { title: "EMAIL", key: "email" },
    { title: "LOCATION", key: "location" },
    {
      title: "APPROVAL STATUS",
      key: "approvalStatus",
      valueIsAComponent: true,
      customValue: (value: string) => {
        const val = (value || "PENDING").toUpperCase();
        let style = "text-[#49526A] border-[#E1E5EA] bg-[#F6F8FA]";
        if (val === "APPROVED")
          style = "text-[#0E6F3D] border-[#B7E4C7] bg-[#EAF7EF]";
        else if (val === "REJECTED")
          style = "text-[#9B2B23] border-[#F3B5B0] bg-[#FCECEB]";
        else if (val === "PENDING")
          style = "text-[#9A6A00] border-[#F4D48A] bg-[#FFF6DA]";

        return (
          <span
            className={`${style} flex items-center gap-1 w-max px-2 py-1 border-[0.4px] rounded-full uppercase text-[11px]`}
          >
            <GoDotFill />
            {val}
          </span>
        );
      },
    },
    {
      title: "STATUS",
      key: "status",
      valueIsAComponent: true,
      customValue: (value: string) => {
        const status = (value || "").toLowerCase();
        let style = "text-[#49526A] border-[#E1E5EA] bg-[#F6F8FA]";
        if (status === "active") {
          style = "text-[#0E6F3D] border-[#B7E4C7] bg-[#EAF7EF]";
        } else if (status === "inactive") {
          style = "text-[#9A6A00] border-[#F4D48A] bg-[#FFF6DA]";
        } else if (status === "barred" || status === "blocked") {
          style = "text-[#9B2B23] border-[#F3B5B0] bg-[#FCECEB]";
        }

        return (
          <span
            className={`${style} text-[11px] flex items-center gap-0.5 w-max px-2 py-1 border-[0.4px] rounded-full uppercase`}
          >
            <GoDotFill />
            {status || "N/A"}
          </span>
        );
      },
      rightIcon: <img src={clock} alt="clock icon" className="ml-auto" />,
    },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (
        _value: any,
        row: { id: string; status?: string; approvalStatus?: string }
      ) => {
        const isRowLoading = actionLoadingId === row.id;
        const approval = (row.approvalStatus || "").toUpperCase();
        const isApproved = approval === "APPROVED";
        const isRejected = approval === "REJECTED";
        const isInactive = (row.status || "").toLowerCase() === "inactive";

        // Rejected: hide Accept/Reject, show only View
        if (isRejected) {
          return (
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
                onClick={() => {
                  setCustomerID(row.id);
                  setIsOpen(true);
                }}
              >
                View
              </span>
            </div>
          );
        }

        // Approved: show only View
        if (isApproved) {
          return (
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
                onClick={() => {
                  setCustomerID(row.id);
                  setIsOpen(true);
                }}
              >
                View
              </span>
            </div>
          );
        }

        // Pending + inactive: show Accept + Reject + View
        if (isInactive) {
          return (
            <div className="flex items-center gap-2">
              <button
                className={`px-2 py-1 text-[10px] rounded-full border-[0.2px] border-[#0E6F3D] text-white bg-[#0E6F3D] transition-all ${
                  isRowLoading && actionType === "approve"
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-[#0B5E34]"
                }`}
                disabled={isRowLoading}
                onClick={() => {
                  setPendingAction({ id: row.id, approve: true, label: "Accept" });
                  setRejectionReason("");
                  setConfirmOpen(true);
                }}
              >
                {isRowLoading && actionType === "approve"
                  ? "Approving..."
                  : "Accept"}
              </button>

              <button
                className={`px-2 py-1 text-[10px] rounded-full border-[0.2px] border-[#9B2B23] text-white bg-[#9B2B23] transition-all ${
                  isRowLoading && actionType === "reject"
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-[#8A261F]"
                }`}
                disabled={isRowLoading}
                onClick={() => {
                  setPendingAction({ id: row.id, approve: false, label: "Reject" });
                  setRejectionReason("");
                  setConfirmOpen(true);
                }}
              >
                {isRowLoading && actionType === "reject"
                  ? "Rejecting..."
                  : "Reject"}
              </button>

              <span
                className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
                onClick={() => {
                  setCustomerID(row.id);
                  setIsOpen(true);
                }}
              >
                View
              </span>
            </div>
          );
        }

        // Other cases: View + Deactivate/Reject button
        return (
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
              onClick={() => {
                setCustomerID(row.id);
                setIsOpen(true);
              }}
            >
              View
            </span>
            <button
              className={`px-2 py-1 text-[10px] rounded-full border-[0.2px] border-[#9B2B23] text-white bg-[#9B2B23] transition-all ${
                isRowLoading && actionType === "reject"
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-[#8A261F]"
              }`}
              disabled={isRowLoading}
              onClick={() => {
                setPendingAction({
                  id: row.id,
                  approve: false,
                  label: isInactive ? "Reject" : "Deactivate",
                });
                setRejectionReason("");
                setConfirmOpen(true);
              }}
            >
              {isRowLoading && actionType === "reject"
                ? "Rejecting..."
                : `${isInactive ? "Reject" : "Deactivate"}`}
            </button>
          </div>
        );
      },
    },
  ];

  const getTableData = () => generateCustomerEntries(customerData);

  const showReasonField =
    !!pendingAction &&
    pendingAction.approve === false &&
    pendingAction.label !== "Deactivate";

  const confirmButtonClassName =
    pendingAction?.approve === true
      ? "border-[#00AF50] bg-[#00AF50] hover:bg-[#009B46]"
      : "border-[#9B2B23] bg-[#9B2B23] hover:bg-[#8A261F]";

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableTitle="CUSTOMERS"
            filterList={filterList}
            columnList={columnList}
            loading={isLoading}
            tableData={getTableData()}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => {
              setTableQueryParams({});
              setQueryValue("");
              setIsSearchQuery(false);
            }}
          />

          {customerID && (
            <CustomerModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              customerID={customerID}
              refreshTable={refreshTable}
            />
          )}

          <ConfirmModal
            open={confirmOpen}
            onClose={() => {
              if (!actionLoadingId) {
                setConfirmOpen(false);
                setRejectionReason("");
              }
            }}
            loading={Boolean(actionLoadingId)}
            title={
              pendingAction?.approve
                ? "Approve customer?"
                : pendingAction?.label === "Deactivate"
                ? "Deactivate customer?"
                : "Reject customer?"
            }
            description={
              pendingAction?.approve
                ? "This will activate this customer's account."
                : pendingAction?.label === "Deactivate"
                ? "This will deactivate this customer's account. They won't be able to access services until reactivated."
                : "Provide a reason if you want the agent to know what to fix."
            }
            confirmText={
              pendingAction?.approve
                ? "Approve"
                : pendingAction?.label === "Deactivate"
                ? "Deactivate"
                : "Reject"
            }
            cancelText="Cancel"
            confirmClassName={confirmButtonClassName}
            showReason={showReasonField}
            reason={rejectionReason}
            onReasonChange={setRejectionReason}
            onConfirm={async () => {
              if (!pendingAction) return;
              await handleApproveReject(
                pendingAction.id,
                pendingAction.approve,
                showReasonField ? rejectionReason : undefined
              );
              setConfirmOpen(false);
              setPendingAction(null);
              setRejectionReason("");
            }}
          />
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch customer list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default CustomerTable;
