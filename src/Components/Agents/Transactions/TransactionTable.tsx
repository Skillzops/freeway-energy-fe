import { useEffect as _useEffect, useMemo, useState } from "react";
import { KeyedMutator } from "swr";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";
import TransactionModal from "./TransactionModal";
import { DateTimeTag, NairaSymbol, NameTag as _NameTag } from "../CardComponents/CardComponent";
import { GoDotFill } from "react-icons/go";
import { formatNumberWithCommas } from "@/utils/helpers";
import creditcardicon from "@/assets/creditcardgrey.svg";
import Table, { PaginationType } from "@/Components/TableComponent/Table";

type TransactionEntries = {
  no: number;
  id: string; // keep raw id if your Table ever needs it
  transactionId: string; // used by your column "TRANSACTION ID"
  customer: string; // showing agentId or walletId as placeholder
  datetime: string;
  productType: string;
  amount: number;
  status: string; // lower-cased for badge styling
};

const mapRows = (data: any): TransactionEntries[] => {
  const txs = Array.isArray(data?.transactions) ? data.transactions : [];
  const page = Number.isFinite(data?.page) ? data.page : 1;
  const limit = Number.isFinite(data?.limit) ? data.limit : txs.length || 50;

  return txs.map((item: any, index: number) => ({
    no: (page - 1) * limit + (index + 1),
    id: item?.id ?? "",
    transactionId: item?.id ?? "N/A",
    customer: item?.agentId || item?.walletId || "N/A",
    datetime: item?.createdAt ?? "",
    productType: item?.description || item?.type || "N/A",
    amount: item?.amount ?? 0,
    status: String(item?.status ?? "unknown").toLowerCase()
  }));
};

const TransactionTable = ({
  transactionData,
  isLoading,
  refreshTable,
  error,
  errorData,
  currentPage,
  entriesPerPage,
  setCurrentPage,
  setEntriesPerPage










}: {transactionData: any;isLoading: boolean;refreshTable: KeyedMutator<any>;error: any;errorData: ApiErrorStatesType;currentPage?: number;entriesPerPage?: number;setCurrentPage?: (page: number) => void;setEntriesPerPage?: (entries: number) => void;}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [transactionID, _setTransactionID] = useState("");

  // Use props for pagination state, fallback to data values if props not provided
  const _currentPage = currentPage ?? transactionData?.page ?? 1;
  const _entriesPerPage = entriesPerPage ?? transactionData?.limit ?? 10;

  // Map rows once per payload change
  const tableData = useMemo(() => mapRows(transactionData), [transactionData]);

  // Build the paginationInfo function your Table expects
  const paginationInfo: PaginationType = () => ({
    total: Number.isFinite(transactionData?.total) ? transactionData.total : tableData.length,
    currentPage: _currentPage,
    entriesPerPage: _entriesPerPage,
    setCurrentPage: (v: React.SetStateAction<number>) => {
      const newPage = typeof v === 'function' ? v(_currentPage) : v;
      if (setCurrentPage) {
        setCurrentPage(newPage);
      }
      // Refresh table after pagination change
      Promise.resolve(refreshTable && refreshTable());
    },
    setEntriesPerPage: (v: React.SetStateAction<number>) => {
      const newEntriesPerPage = typeof v === 'function' ? v(_entriesPerPage) : v;
      if (setEntriesPerPage) {
        setEntriesPerPage(newEntriesPerPage);
      }
      Promise.resolve(refreshTable && refreshTable());
    }
  });

  const clearFilters = () => {


    // No filters on this table; keep for "Reset Filters" button compatibility.
    // If later you add server-side filters, reset their state here.
  };const columnList = [
  { title: "S/N", key: "no" },
  { title: "TRANSACTION ID", key: "transactionId" },
  // {
  //   title: "CUSTOMER",
  //   key: "customer",
  //   valueIsAComponent: true,
  //   customValue: (value: string) => <NameTag name={value} />,
  // },
  {
    title: "DATE & TIME",
    key: "datetime",
    valueIsAComponent: true,
    customValue: (value: string) => <DateTimeTag datetime={value} />
  },
  {
    title: "PRODUCT TYPE",
    key: "productType",
    rightIcon:
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00024 1.8335C7.17181 1.8335 6.50024 2.50507 6.50024 3.3335V3.50675C6.87162 3.50015 7.27913 3.50016 7.72633 3.50016H8.27415C8.72136 3.50016 9.12886 3.50015 9.50024 3.50675V3.3335C9.50024 2.50507 8.82867 1.8335 8.00024 1.8335ZM10.5002 3.55211V3.3335C10.5002 1.95278 9.38095 0.833496 8.00024 0.833496C6.61953 0.833496 5.50024 1.95278 5.50024 3.3335V3.55211C5.40509 3.56031 5.31314 3.56979 5.22429 3.58077C4.55098 3.66396 3.99589 3.83872 3.52436 4.23005C3.05284 4.62138 2.77877 5.13475 2.57292 5.7812C2.37343 6.40768 2.22243 7.2131 2.0326 8.22555L2.01881 8.29908C1.75095 9.72762 1.53985 10.8534 1.50111 11.741C1.46141 12.6507 1.59675 13.4042 2.10993 14.0225C2.62312 14.6409 3.33873 14.9127 4.24019 15.0414C5.11967 15.1669 6.26508 15.1668 7.71849 15.1668H8.28195C9.73538 15.1668 10.8808 15.1669 11.7603 15.0414C12.6618 14.9127 13.3774 14.6409 13.8905 14.0225C14.4037 13.4042 14.5391 12.6507 14.4994 11.741C14.4606 10.8534 14.2495 9.72763 13.9817 8.2991L13.9679 8.22558C13.7781 7.21311 13.627 6.40769 13.4276 5.7812C13.2217 5.13475 12.9476 4.62138 12.4761 4.23005C12.0046 3.83872 11.4495 3.66396 10.7762 3.58077C10.6873 3.56979 10.5954 3.56031 10.5002 3.55211ZM6.82816 8.19326C6.67529 8.24685 6.50024 8.41395 6.50024 8.79798C6.50024 8.94103 6.59439 9.16172 6.83988 9.44558C7.0723 9.71432 7.37929 9.96964 7.65794 10.1741C7.80876 10.2847 7.88036 10.3358 7.93765 10.366C7.97391 10.3852 7.98395 10.3852 8.00024 10.3852C8.01654 10.3852 8.02658 10.3852 8.06284 10.366C8.12012 10.3358 8.19173 10.2848 8.34255 10.1741C8.62119 9.96964 8.92818 9.71433 9.1606 9.44558C9.40609 9.16173 9.50024 8.94104 9.50024 8.79798C9.50024 8.41395 9.3252 8.24684 9.17232 8.19325C9.00545 8.13476 8.6964 8.1534 8.34603 8.48887C8.15268 8.67401 7.84781 8.67401 7.65445 8.48887C7.30408 8.1534 6.99503 8.13476 6.82816 8.19326ZM8.00024 7.4897C7.52272 7.17533 6.98356 7.07911 6.49735 7.24956C5.87521 7.46765 5.50024 8.06653 5.50024 8.79798C5.50024 9.31121 5.79438 9.7654 6.08351 10.0997C6.3857 10.4491 6.75967 10.7553 7.06636 10.9803C7.0819 10.9917 7.09755 11.0033 7.11336 11.015C7.34754 11.1881 7.61405 11.3852 8.00024 11.3852C8.38644 11.3852 8.65294 11.1882 8.88712 11.015C8.90293 11.0033 8.91858 10.9917 8.93412 10.9803C9.24082 10.7553 9.61478 10.4491 9.91698 10.0997C10.2061 9.7654 10.5002 9.31121 10.5002 8.79798C10.5002 8.06652 10.1253 7.46765 9.50313 7.24956C9.01692 7.07911 8.47776 7.17533 8.00024 7.4897Z"
        fill="#828DA9" />

        </svg>

  },
  {
    title: "AMOUNT",
    key: "amount",
    valueIsAComponent: true,
    customValue: (value: number) =>
    <div className="flex items-center gap-1">
          <NairaSymbol />
          <span className="text-textBlack">
            {value !== undefined && value !== null ? formatNumberWithCommas(value) : "-"}
          </span>
        </div>,

    rightIcon: <NairaSymbol color="#828DA9" />
  },
  {
    title: "STATUS",
    key: "status",
    valueIsAComponent: true,
    customValue: (value: any) => {
      const v = String(value || "").toLowerCase();
      const getStatusStyle = (status: string) => {
        switch (status) {
          case "successful":
          case "completed":
            return "text-success";
          case "pending":
            return "text-yellow-600";
          case "failed":
          case "reversed":
            return "text-red-500";
          case "processing":
            return "text-blue-500";
          default:
            return "text-gray-500";
        }
      };
      const style = getStatusStyle(v);
      return (
        <span className={`${style} flex items-center gap-0.5 w-max px-2 py-1 bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full uppercase`}>
            <GoDotFill />
            {v || "unknown"}
          </span>);

    },
    rightIcon: <img src={creditcardicon} />
  }];


  return (
    <>
      {!error ?
      <div className="w-full">
          <Table
          showHeader
          tableTitle="TRANSACTIONS"
          filterList={[]} // no client-side filters/search
          columnList={columnList}
          tableClassname=""
          tableData={tableData}
          tableType="default"
          loading={isLoading}
          refreshTable={async () => {
            await refreshTable();
          }}
          queryValue=""
          paginationInfo={paginationInfo}
          clearFilters={clearFilters} />

          {transactionID &&
        <TransactionModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          transactionID={transactionID}
          refreshTable={refreshTable} />

        }
        </div> :

      <ErrorComponent
        message="Failed to fetch transaction list."
        className="rounded-[20px]"
        refreshData={refreshTable}
        errorData={errorData} />

      }
    </>);

};

export default TransactionTable;
