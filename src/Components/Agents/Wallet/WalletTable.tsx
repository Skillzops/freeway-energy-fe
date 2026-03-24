import { useState } from "react";
// import { Table } from "../TableComponent/Table";
import { GoDotFill } from "react-icons/go";
import WalletModal from "./WalletModal";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import Table from "@/Components/TableComponent/Table";

const normalizeStatus = (value?: string) => {
  return String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
};

const getStatusBadgeClasses = (status: string) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "successful":
    case "success":
    case "completed":
    case "active":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "pending":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "processing":
    case "in_progress":
      return "text-blue-700 bg-blue-50 border-blue-200";
    case "failed":
    case "reversed":
    case "cancelled":
    case "canceled":
    case "suspended":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

const formatStatusLabel = (status: string) => {
  const normalized = normalizeStatus(status);
  return normalized.replace(/_/g, " ").toUpperCase();
};

const WalletTable = ({
  walletData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  walletData: any;
  isLoading: boolean;
  refreshTable: any;
  error: any;
  errorData: ApiErrorStatesType;
  paginationInfo: () => {
    total: number;
    currentPage: number;
    entriesPerPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setEntriesPerPage: React.Dispatch<React.SetStateAction<number>>;
  };
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [walletID, setWalletID] = useState("");

  const tableData =
    walletData?.transactions?.map((entry: any, index: number) => ({
      no: index + 1,
      dateTime: new Date(entry.createdAt).toLocaleString(),
      type: entry.type || "Transaction",
      description: entry.description || entry.type || "Transaction",
      amount: `₦${parseFloat(entry.amount || 0).toLocaleString()}`,
      referenceId: entry.id,
      status: entry.status || "completed",
    })) ?? [];

  const columnList = [
    { title: "S/N", key: "no" },
    { title: "DATE/TIME", key: "dateTime" },
    { title: "TYPE", key: "type" },
    { title: "DESCRIPTION", key: "description" },
    { title: "AMOUNT", key: "amount" },
    { title: "REFERENCE ID", key: "referenceId" },
    {
      title: "STATUS",
      key: "status",
      valueIsAComponent: true,
      customValue: (value: string) => {
        const badgeClasses = getStatusBadgeClasses(value);
        return (
          <span
            className={`${badgeClasses} flex items-center gap-1 w-max px-2.5 py-1 border rounded-full text-[11px] font-semibold`}
          >
            <GoDotFill className="text-[10px]" />
            {formatStatusLabel(value)}
          </span>
        );
      },
    },
  ];

  return !error ? (
    <>
      <Table
        tableTitle="WALLETS"
        columnList={columnList}
        tableData={tableData}
        loading={isLoading}
        refreshTable={refreshTable}
        paginationInfo={paginationInfo}
        queryValue=""
        clearFilters={() => setTableQueryParams({})}
      />
      {walletID && (
        <WalletModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          walletID={walletID}
          refreshTable={refreshTable}
        />
      )}
    </>
  ) : (
    <ErrorComponent
      message="Failed to fetch wallet data."
      className="rounded-[20px]"
      refreshData={refreshTable}
      errorData={errorData}
    />
  );
};

export default WalletTable;
