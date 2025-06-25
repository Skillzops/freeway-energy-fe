import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { PaginationType, Table } from "../TableComponent/Table";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { formatDateTime } from "@/utils/helpers";
import { GoDotFill } from "react-icons/go";

export type TokenEntries = {
  id: string;
  no?: number;
  serialNumber: string;
  key: string;
  tokenValue: string;
  deviceId: string;
  generatedAt: string;
  expiresAt?: string;
  isActive: boolean;
  usageCount?: number;
  maxUsage?: number;
  createdAt: string;
  updatedAt: string;
};

// Helper function to map the API data to the desired format
const generateTokenEntries = (data: any): TokenEntries[] => {
  console.log("Raw tokens data:", data); // Debug log
  
  if (!data) {
    console.log("No data received");
    return [];
  }
  
  // Check different possible data structures
  const tokensArray = data?.tokens || data?.data || data;
  console.log("Tokens array:", tokensArray);
  
  if (!Array.isArray(tokensArray)) {
    console.log("Tokens data is not an array:", tokensArray);
    return [];
  }
  
  const entries: TokenEntries[] = tokensArray.map(
    (item: any, index: number) => {
      return {
        id: item.id || item.tokenId || `token-${index}`,
        no: index + 1,
        serialNumber: item.serialNumber || item.deviceSerialNumber || 'N/A',
        key: item.key || item.deviceId || '',
        tokenValue: item.tokenValue || item.deviceToken || item.token || 'N/A', // Map deviceToken to tokenValue
        deviceId: item.deviceId || '',
        generatedAt: item.generatedAt || item.createdAt || new Date().toISOString(),
        expiresAt: item.expiresAt || item.expiredAt || null,
        isActive: item.isActive !== undefined ? item.isActive : true,
        usageCount: item.usageCount || 0,
        maxUsage: item.maxUsage || item.maxUsageCount || null,
        createdAt: item.createdAt || item.generatedAt || new Date().toISOString(),
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
      };
    }
  );
  
  console.log("Generated entries:", entries);
  return entries || [];
};

const TokensTable = ({
  tokensData,
  isLoading,
  refreshTable,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  tokensData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
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
          generatedAt: date.split("T")[0],
        }));
      },
      isDate: true,
    },
  ];

  const columnList = [
    { title: "S/N", key: "no" },
    { title: "Serial Number", key: "serialNumber" },
    { title: "Token Value", key: "tokenValue" },
    {
      title: "GENERATED AT",
      key: "generatedAt",
      styles: "w-[15%]",
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
      title: "STATUS",
      key: "isActive",
      valueIsAComponent: true,
      customValue: (value: boolean) => {
        const style = value ? "text-success" : "text-errorTwo";
        const status = value ? "active" : "inactive";

        return (
          <span
            className={`${style} flex items-center gap-0.5 w-max px-2 py-1 bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full uppercase`}
          >
            <GoDotFill />
            {status}
          </span>
        );
      },
    },
    {
      title: "USAGE",
      key: "usageCount",
      valueIsAComponent: true,
      customValue: (value: number, rowData: TokenEntries) => {
        const maxUsage = rowData.maxUsage || 0;
        const usage = value || 0;
        return (
          <span className="text-textBlack">
            {usage}/{maxUsage}
          </span>
        );
      },
    },
    {
      title: "EXPIRES AT",
      key: "expiresAt",
      valueIsAComponent: true,
      customValue: (value: string) => {
        if (!value) return <span className="text-textDarkGrey">-</span>;
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
  ];

  const getTableData = () => {
    console.log("TokensTable - Getting table data:", { tokensData, errorData });
    
    // Check if there are any error states
    const hasErrors = errorData?.errorStates?.some(state => state.errorExists) || 
                     errorData?.isNetworkError || 
                     errorData?.isPermissionError;
    
    // If there's an error, return empty array
    if (hasErrors) {
      console.log("TokensTable - API error detected:", errorData);
      return [];
    }
    
    // If no data yet (loading), return empty array
    if (!tokensData) {
      console.log("TokensTable - No data available yet");
      return [];
    }
    
    // Use the generateTokenEntries function to process real API data
    const processedEntries = generateTokenEntries(tokensData);
    console.log("TokensTable - Processed entries:", processedEntries);
    
    return processedEntries;
  };

  // Show error component if there's an API error
  const hasErrors = errorData?.errorStates?.some(state => state.errorExists) || 
                   errorData?.isNetworkError || 
                   errorData?.isPermissionError;
                   
  if (hasErrors) {
    return (
      <div className="w-full">
        <ErrorComponent
          message="Failed to load tokens history"
          refreshData={refreshTable}
          errorData={errorData}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table
        tableTitle="TOKENS HISTORY"
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
    </div>
  );
};

export default TokensTable; 