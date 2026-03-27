import { ApiErrorStatesType } from "@/utils/useApiCall";
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { KeyedMutator } from "swr";
import { ErrorComponent } from "@/Pages/ErrorPage";
import Table, { PaginationType } from "@/Components/TableComponent/Table";
import DeviceDetailModal from "./DeviceDetailModal";

export type DeviceEntries = {
  id: string;
  no?: number;
  serialNumber: string;
  key?: string;
  startingCode?: string;
  count?: number | string;
  timeDivider?: string;
  restrictedDigitMode?: boolean;
  hardwareModel?: string;
  firmwareVersion?: string;
  isTokenable?: boolean;
  installationStatus?: "installed" | "not_installed" | string | null;
  saleItemIDs?: string[];
  createdAt?: string;
  updatedAt?: string;
};

const generateDeviceEntries = (data: any): DeviceEntries[] => {
  const devices = data?.devices ?? data?.data?.devices ?? [];
  return devices.map((item: DeviceEntries, index: number) => ({
    ...item,
    no: index + 1,
  }));
};

const formatInstallationStatus = (value: string | null | undefined) => {
  if (!value) return "N/A";
  const normalized = value.toLowerCase().replace(/[-\s]/g, "_");

  if (normalized === "installed") return "installed";
  if (normalized === "not_installed" || normalized === "notinstalled") {
    return "not_installed";
  }
  if (normalized === "ready_for_installation") {
    return "ready_for_installation";
  }

  return value;
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
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [deviceID, setDeviceID] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const defaultFilters = useMemo(() => {
    if (location.pathname === "/agent/devices/installed") {
      return { installationStatus: "installed" };
    }
    if (location.pathname === "/agent/devices/to-be-installed") {
      return { installationStatus: "not_installed" };
    }
    return {};
  }, [location.pathname]);

  const filterList = [
    {
      name: "Search",
      onSearch: async (query: string) => {
        const searchText = query.trim();
        setQueryValue(searchText);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => {
          const nextParams = { ...(prevParams || {}) };
          if (searchText) {
            nextParams.search = searchText;
          } else {
            delete nextParams.search;
          }
          return nextParams;
        });
      },
      isSearch: true,
    },
    {
      onDateClick: (date: string) => {
        const createdAt = date.split("T")[0];
        setQueryValue(createdAt);
        setIsSearchQuery(false);
        setTableQueryParams((prevParams) => ({
          ...(prevParams || {}),
          createdAt,
        }));
      },
      isDate: true,
    },
  ];

  const columnList = [
    { title: "S/N", key: "no" },
    { title: "SERIAL NUMBER", key: "serialNumber" },
    {
      title: "INSTALLATION STATUS",
      key: "installationStatus",
      valueIsAComponent: true,
      customValue: (value: string | null | undefined) => (
        <>{formatInstallationStatus(value)}</>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (_value: any, rowData: DeviceEntries) => {
        return (
          <button
            type="button"
            className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
            onClick={() => {
              setDeviceID(rowData.id);
              setIsOpen(true);
            }}
          >
            View
          </button>
        );
      },
    },
  ];

  return (
    <>
      {!errorData?.errorStates[0]?.errorExists ? (
        <div className="w-full">
          <Table
            tableTitle="DEVICES"
            filterList={filterList}
            columnList={columnList}
            loading={isLoading}
            tableData={generateDeviceEntries(devicesData)}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => {
              setQueryValue("");
              setIsSearchQuery(false);
              setTableQueryParams(defaultFilters);
            }}
          />
          {deviceID ? (
            <DeviceDetailModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              deviceID={deviceID}
              refreshTable={refreshTable}
            />
          ) : null}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch device list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default DevicesTable;
