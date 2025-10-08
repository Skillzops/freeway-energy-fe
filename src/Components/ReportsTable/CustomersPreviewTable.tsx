import { KeyedMutator } from "swr";
import { useMemo } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";

export type CustomerRow = {
  customerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  gender?: string | null;
  status?: string | null;
  type?: string | null;
  installationAddress?: string | null;
  state?: string | null;
  lga?: string | null;
  location?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  totalSales?: number | null;
  totalSpent?: number | null;
  assignedAgent?: string | null;
  createdDate?: string | null; 
  updatedDate?: string | null; 
};

const toSafe = (v: any) => (v === null || v === undefined || v === "nil" ? "-" : v);

const CustomersPreviewTable = ({
  title,
  items,
  isLoading,
  refreshTable,
  errorData,
}: {
  title: string;
  items: CustomerRow[];
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  errorData: ApiErrorStatesType;
  paginationInfo?: PaginationType;
}) => {
  const rows = useMemo(() => items ?? [], [items]);

  const columnList = [
    { title: "Customer ID", key: "customerId" },
    { title: "First Name", key: "firstName" },
    { title: "Last Name", key: "lastName" },
    { title: "Phone", key: "phone" },
    { title: "Alt Phone", key: "alternatePhone" },
    { title: "Status", key: "status" },
    { title: "Type", key: "type" },
    { title: "State", key: "state" },
    { title: "LGA", key: "lga" },
    { title: "Total Sales", key: "totalSales" },
    { title: "Total Spent", key: "totalSpent" },
    { title: "Created", key: "createdDate" },
    { title: "Updated", key: "updatedDate" },
    {
      title: "Address",
      key: "installationAddress",
      valueIsAComponent: true,
      customValue: (value: string) => (
        <span className="text-[11px] text-textGrey break-all">{toSafe(value)}</span>
      ),
    },
  ];

  return !errorData?.errorStates[0]?.errorExists ? (
    <Table
      tableTitle={title}
      columnList={columnList}
      loading={isLoading}
      tableData={rows.map((r) => ({
        ...r,
        email: toSafe(r.email),
        phone: toSafe(r.phone),
        alternatePhone: toSafe(r.alternatePhone),
        gender: toSafe(r.gender),
        status: toSafe(r.status),
        type: toSafe(r.type),
        state: toSafe(r.state),
        lga: toSafe(r.lga),
        location: toSafe(r.location),
        latitude: toSafe(r.latitude),
        longitude: toSafe(r.longitude),
        idType: toSafe(r.idType),
        idNumber: toSafe(r.idNumber),
        totalSales: r.totalSales ?? "-",
        totalSpent: r.totalSpent ?? "-",
        createdDate: toSafe(r.createdDate),
        updatedDate: toSafe(r.updatedDate),
      }))}
      refreshTable={async () => {
        await refreshTable();
      }}
      paginationInfo={{
        total: rows.length,
        currentPage: 1,
        entriesPerPage: rows.length,
        setCurrentPage: () => undefined,
        setEntriesPerPage: () => undefined,
      }}
      filterList={[]}
      clearFilters={() => undefined}
    />
  ) : (
    <ErrorComponent
      message="Failed to fetch customers preview."
      className="rounded-[20px]"
      refreshData={refreshTable}
      errorData={errorData}
    />
  );
};

export default CustomersPreviewTable;
