// import { useState } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import { NairaSymbol } from "../CardComponents/CardComponent";
import { formatDateTime, formatNumberWithCommas } from "@/utils/helpers";
import roletwo from "../../assets/table/roletwo.svg";
import { GoDotFill } from "react-icons/go";

interface BatchHistoryEntries {
  datetime: string;
  stockNumber: number;
  stockValue: string;
  staffName: string;
}

export interface Batch {
  id: string;
  costOfItem: number;
  price: number;
  batchNumber: number;
  numberOfStock: number;
  remainingQuantity: number;
  creatorId: string | null;
  createdAt: string;
  updatedAt: string;
  inventoryId: string;
  creatorDetails: {
    firstname: string;
    lastname: string;
  } | null;
  stockValue: string;
}

// Helper function to map the API data to the desired format
const generateBatchEntries = (data: Batch[]): BatchHistoryEntries[] => {
  const entries: BatchHistoryEntries[] = data?.map((item, index) => {
    return {
      serialNumber: index + 1,
      datetime: item.createdAt,
      stockNumber: item.numberOfStock || 0,
      stockValue: item.stockValue || "0",
      staffName: item?.creatorDetails
        ? `${item.creatorDetails?.firstname} ${item.creatorDetails?.lastname}`
        : "N/A",
    };
  });

  return entries;
};

const InventoryHistory = ({
  historyData,
  paginationInfo,
  isLoading,
}: {
  historyData: Batch[];
  paginationInfo: PaginationType;
  isLoading: boolean;
}) => {
  // const [historyId, setHistoryID] = useState<string | number>("");
  // const [isOpen, setIsOpen] = useState<boolean>(false);

  const columnList = [
    { title: "S/N", key: "serialNumber" },
    {
      title: "DATE & TIME",
      key: "datetime",
      styles: "w-[20%]",
      valueIsAComponent: true,
      customValue: (value: string) => {
        return (
          <div className="flex items-center justify-center gap-1 bg-[#F6F8FA] px-2 py-1 w-max border-[0.4px] border-strokeGreyTwo rounded-full">
            <p className="text-xs text-textDarkGrey font-semibold">
              {formatDateTime("date", value)}
            </p>
            <GoDotFill color="#E2E4EB" />
            <p className="text-xs text-textDarkGrey">
              {formatDateTime("time", value)}
            </p>
          </div>
        );
      },
    },
    {
      title: "STOCK NUMBER",
      key: "stockNumber",
      styles: "w-[20%]",
      valueIsAComponent: true,
      customValue: (value: number) => {
        return (
          <span className="text-textBlack">
            {formatNumberWithCommas(value)}
          </span>
        );
      },
    },
    {
      title: "STOCK VALUE",
      key: "stockValue",
      styles: "w-[15%]",
      valueIsAComponent: true,
      customValue: (value: string) => {
        return (
          <div className="flex items-center gap-1">
            <NairaSymbol color="#A58730" />
            <span className="text-textBlack">
              {formatNumberWithCommas(value)}
            </span>
          </div>
        );
      },
    },
    {
      title: "Created By",
      key: "staffName",
      styles: "w-[25%]",
      valueIsAComponent: true,
      customValue: (value: string) => {
        return (
          <div className="flex items-center gap-1 h-[24px]">
            <img src={roletwo} alt="Icon" />
            <span className="flex items-center justify-center bg-[#EFF2FF] px-2 h-full rounded-full text-xs font-semibold text-textBlack capitalize">
              {value}
            </span>
          </div>
        );
      },
    },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (value: any, rowData: any) => {
        return (
          <span
            className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
            onClick={() => {
              // setHistoryID(rowData.id);
              // setIsOpen(true);
              console.log(value, rowData);
            }}
          >
            View
          </span>
        );
      },
    },
  ];

  return (
    <>
      <div className="w-full">
        <Table
          showHeader={false}
          columnList={columnList}
          loading={isLoading}
          tableData={generateBatchEntries(historyData)}
          paginationInfo={paginationInfo}
        />
      </div>
    </>
  );
};

export default InventoryHistory;
