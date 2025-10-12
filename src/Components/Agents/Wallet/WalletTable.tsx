import { useState } from "react";
// import { Table } from "../TableComponent/Table";
import { GoDotFill } from "react-icons/go";
import WalletModal from "./WalletModal";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import Table from "@/Components/TableComponent/Table";

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
        const v = String(value || "").toLowerCase();
        const getStatusStyle = (status: string) => {
          switch (status) {
            case "successful":
            case "completed":
            case "active":
              return "text-success";
            case "pending":
              return "text-yellow-600";
            case "failed":
            case "reversed":
            case "suspended":
              return "text-red-500";
            case "processing":
              return "text-blue-500";
            default:
              return "text-gray-500";
          }
        };
        const style = getStatusStyle(v);
        return (
          <span
            className={`${style} flex items-center gap-0.5 w-max px-2 py-1 bg-[#F6F8FA] border border-strokeGreyTwo rounded-full uppercase`}
          >
            <GoDotFill />
            {v || "unknown"}
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
