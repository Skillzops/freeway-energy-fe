import { ApiErrorStatesType } from "@/utils/useApiCall";
import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { ErrorComponent } from "@/Pages/ErrorPage";
import DeviceDetailModal from "./DeviceDetailModal";
import Table, { PaginationType } from "@/Components/TableComponent/Table";

export type DeviceEntries = {
  id: string;
  no?: number;
  serialNumber: string;
  key: string;
  startingCode: string;
  count: number | string;
  timeDivider: string;
  restrictedDigitMode: boolean;
  hardwareModel: string;
  firmwareVersion: string;
  isTokenable: boolean;
  installationStatus?: "installed" | "not_installed" | string;
  saleItemIDs?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Helper function to map the API data to the desired format
const generateDeviceEntries = (data: any): DeviceEntries[] => {
  const entries: DeviceEntries[] = data?.devices?.map(
    (item: DeviceEntries, index: number) => {
      return {
        ...item,
        no: index + 1,
      };
    }
  );
  return entries;
};

const DevicesTable = ({
  devicesData,
  isLoading,
  refreshTable,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  devicesData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [deviceID, setDeviceID] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const filterList = [
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          search: query,
        }));
      },
      isSearch: true,
    },
    {
      onDateClick: (date: string) => {
        setQueryValue(date);
        setIsSearchQuery(false);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          createdAt: date.split("T")[0],
        }));
      },
      isDate: true,
    },
  ];

  const columnList = [
    { title: "S/N", key: "no" },
    { title: "SERIAL NUMBER", key: "serialNumber" },
    { title: "INSTALLATION STATUS", key: "installationStatus" },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (_value: any, rowData: { id: string }) => (
        <span
          className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
          onClick={() => {
            setDeviceID(rowData.id);
            setIsOpen(true);
          }}
        >
          View
        </span>
      ),
    },
  ];

  const getTableData = () => {
    return generateDeviceEntries(devicesData);
  };

  return (
    <>
      {!errorData?.errorStates[0]?.errorExists ? (
        <div className="w-full">
          <Table
            tableTitle="DEVICES"
            filterList={filterList}
            columnList={columnList}
            loading={isLoading}
            tableData={getTableData()}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
          {deviceID && (
            <DeviceDetailModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              deviceID={deviceID}
              refreshTable={refreshTable}
            />
          )}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch inventory list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default DevicesTable;
