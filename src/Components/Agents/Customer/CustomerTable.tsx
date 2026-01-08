import { useState } from "react";
import { KeyedMutator } from "swr";
import { GoDotFill } from "react-icons/go";
import clock from "@/assets/table/clock.svg";
import CustomerModal from "./CustomerModal";
// import CreateNewCustomer, { CustomerFormData } from "./CreateNewCustomer";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { CgEye } from "react-icons/cg";
import EditCustomer, { CustomerFormData } from "./EditCustomer";
import Table, { PaginationType } from "@/Components/TableComponent/Table";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";

interface CustomerEntries {
  id: string;
  no: number;
  name: string;
  email: string | null;
  location: string;
  status: string;
  approvalStatus: string;
  /** keep the full object so ACTIONS/tooltip can use extra fields like rejectionReason */
  _full: FullCustomerApi;
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
  location: string;
  addressType: string | null;
  staffId: string | null;
  longitude: string;
  latitude: string;
  emailVerified: boolean;
  isBlocked: boolean;
  status: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastLogin: string | null;
  customerDetails: CustomerDetails;
  role: Role;
  approvalStatus?: string;
};

/** Full shape from your "all customers" payload (only fields we use). */
type FullCustomerApi = {
  id: string;
  firstname: string;
  lastname: string;
  phone?: string;
  alternatePhone?: string;
  gender?: string;
  email?: string | null;
  addressType?: "HOME" | "WORK" | string | null;
  installationAddress?: string | null;
  lga?: string | null;
  state?: string | null;
  location?: string | null;
  longitude?: string | null;
  latitude?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  type?: string | null; // e.g. "purchase"
  approvalStatus?: string;
  status?: string;
  rejectionReason?: string | null;
  // urls present but we won't prefill file inputs:
  passportPhotoUrl?: string | null;
  idImageUrl?: string | null;
  contractFormImageUrl?: string | null;
};

/** Map the full row object to CreateNewCustomer form defaults. */
const mapCustomerToFormData = (c: FullCustomerApi): CustomerFormData => ({
  firstname: c.firstname ?? "",
  lastname: c.lastname ?? "",
  email: c.email ?? "",
  phone: c.phone ?? "",
  alternatePhone: c.alternatePhone ?? "",
  gender: c.gender ?? "",
  addressType: (c.addressType || "HOME") as "HOME" | "WORK",
  installationAddress: c.installationAddress ?? "",
  lga: c.lga ?? "",
  state: c.state ?? "",
  location: c.location ?? "",
  longitude: c.longitude ?? "",
  latitude: c.latitude ?? "",
  idType: c.idType ?? "",
  idNumber: c.idNumber ?? "",
  type: (c.type as string) ?? "",
  // Files are not auto-filled; user can re-upload if needed
  passportPhoto: undefined,
  idImage: undefined,
  contractFormImage: undefined,
});

const TooltipBadge: React.FC<{
  badge: React.ReactNode;
  text?: string;
}> = ({ badge, text }) => {
  if (!text) return <>{badge}</>;
  return (
    <span className="relative group inline-flex">
      {badge}
      <span
        className="
          pointer-events-none absolute -top-1 translate-y-[-100%]
          left-1/2 -translate-x-1/2
          max-w-[260px] rounded-md px-2 py-1 text-[11px] leading-snug
          bg-black text-white opacity-0 group-hover:opacity-100
          shadow-lg z-50 transition-opacity whitespace-normal
        "
        role="tooltip"
      >
        {text}
      </span>
    </span>
  );
};

const generateCustomerEntries = (data: any): CustomerEntries[] => {
  const entries: CustomerEntries[] = data?.customers?.map(
    (item: any, index: number) => ({
      id: item?.id,
      no: index + 1,
      name: `${item?.firstname} ${item?.lastname}`,
      email: item?.email ?? "—",
      location: item?.location,
      status: (item?.status || "").toLowerCase(),
      approvalStatus: item?.approvalStatus ?? "—",
      _full: item, // keep full row for modal defaults & tooltip
    })
  );
  return entries ?? [];
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customerID, setCustomerID] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  // resubmit uses row data; no GET required, but we keep a tiny UX loading state
  const [resubmitLoadingId, setResubmitLoadingId] = useState<string | null>(
    null
  );

  const [modalMode, setModalMode] = useState<"create" | "resubmit">("create");
  const [initialFormValues, setInitialFormValues] = useState<
    Partial<CustomerFormData>
  >({});

  const handleOpenResubmitFromRow = async (row: CustomerEntries) => {
    try {
      setResubmitLoadingId(row.id);
      const defaults = mapCustomerToFormData(row._full);
      setInitialFormValues(defaults);
      setCustomerID(row.id);
      setModalMode("resubmit");
      setIsOpen(true);
    } finally {
      setResubmitLoadingId(null);
    }
  };

  const filterList = [
    {
      name: "Location",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prev) => ({ ...(prev || {}), location: query }));
      },
      isSearch: true,
    },
    {
      name: "Status",
      items: ["Active", "Inactive", "Barred"],
      onClickLink: async (index: number) => {
        const data = ["Active", "Inactive", "Barred"].map((i) =>
          i.toLowerCase()
        );
        const query = data[index];
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prev) => ({ ...(prev || {}), status: query }));
      },
    },
    {
      name: "Approval Status",
      items: ["APPROVED", "REJECTED", "PENDING"],
      onClickLink: async (index: number) => {
        const picked = ["APPROVED", "REJECTED", "PENDING"][index];
        setQueryValue(picked);
        setIsSearchQuery(true);
        setTableQueryParams((prev) => ({
          ...(prev || {}),
          approvalStatus: picked,
        }));
      },
    },
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prev) => ({ ...(prev || {}), search: query }));
      },
      isSearch: true,
    },
    {
      onDateClick: (date: string) => {
        setQueryValue(date);
        setIsSearchQuery(false);
        setTableQueryParams((prev) => ({
          ...(prev || {}),
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
      customValue: (value: string, row?: CustomerEntries) => {
        const v = (value || "—").toUpperCase();
        let style = "text-[#49526A] border-[#E1E5EA] bg-[#F6F8FA]";
        if (v === "APPROVED")
          style = "text-[#0E6F3D] border-[#B7E4C7] bg-[#EAF7EF]";
        else if (v === "REJECTED")
          style = "text-[#9B2B23] border-[#F3B5B0] bg-[#FCECEB]";
        else if (v === "PENDING")
          style = "text-[#9A6A00] border-[#F4D48A] bg-[#FFF6DA]";

        const reason =
          (v === "REJECTED" || v === "RESUBMITTED") &&
          row?._full?.rejectionReason
            ? String(row._full.rejectionReason)
            : undefined;

        const badge = (
          <span
            className={`${style} flex items-center gap-1 w-max px-2 py-1 border-[0.4px] rounded-full uppercase text-[11px]`}
          >
            {reason ? <CgEye /> : <GoDotFill />}

            {v}
          </span>
        );

        return <TooltipBadge badge={badge} text={reason} />;
      },
    },

    {
      title: "STATUS",
      key: "status",
      valueIsAComponent: true,
      customValue: (value: any) => {
        let style = "";
        if (value === "active") style = "text-success";
        else if (value === "inactive") style = "text-strokeCream";
        else style = "text-errorTwo";

        return (
          <span
            className={`${style} flex items-center gap-0.5 w-max px-2 py-1 bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full uppercase`}
          >
            <GoDotFill />
            {value}
          </span>
        );
      },
      rightIcon: <img src={clock} alt="clock icon" className="ml-auto" />,
    },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (_value: any, rowData: CustomerEntries) => {
        const isRejected =
          (rowData.approvalStatus || "").toUpperCase() === "REJECTED";
        const loading = resubmitLoadingId === rowData.id;

        return (
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
              onClick={() => {
                setCustomerID(rowData.id);
                setModalMode("create");
                setIsOpen(true);
              }}
            >
              View
            </span>

            {isRejected && (
              <ActionButton
                label={loading ? "Preparing..." : "Resubmit"}
                onClick={() => handleOpenResubmitFromRow(rowData)}
              />
            )}
          </div>
        );
      },
    },
  ];

  const getTableData = () => generateCustomerEntries(customerData);

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

          {/* resubmit/create modal (shared) */}
          <EditCustomer
            isOpen={modalMode === "resubmit" ? isOpen : false}
            setIsOpen={(open) => {
              setIsOpen(open);
              if (!open) {
                setModalMode("create");
                setInitialFormValues({});
                setCustomerID("");
              }
            }}
            allCustomerRefresh={refreshTable}
            mode={modalMode}
            customerId={customerID || null}
            initialValues={initialFormValues}
            title={
              modalMode === "resubmit" ? "Resubmit Customer" : "New Customer"
            }
          />

          {/* existing view modal */}
          {customerID && (
            <CustomerModal
              isOpen={modalMode === "create" ? isOpen : false}
              setIsOpen={setIsOpen}
              customerID={customerID}
              refreshTable={refreshTable}
            />
          )}
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
