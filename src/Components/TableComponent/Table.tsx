import React, { useEffect, useMemo, useState } from "react";
import { DropDown } from "../DropDownComponent/DropDown";
import { copyToClipboard } from "../../utils/helpers";
import { PiCopySimple } from "react-icons/pi";
import { Pagination } from "../PaginationComponent/Pagination";
import wrong from "../../assets/table/wrong.png";
import { TableSearch } from "../TableSearchComponent/TableSearch";

export type PaginationType = () => {
  total: number;
  currentPage: number;
  entriesPerPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setEntriesPerPage: React.Dispatch<React.SetStateAction<number>>;
};

export type TableType = {
  showHeader?: boolean;
  tableTitle?: string;
  filterList?: {
    name?: string;
    items?: string[];
    onClickLink?: (index: number) => void;
    onSearch?: (query: string) => void;
    buttonImgStyle?: string;
    dropDownContainerStyle?: string;
    isSearch?: boolean;
    isDate?: boolean;
    onDateClick?: (date: string) => void;
  }[];
  columnList?: {
    title: string;
    key: string;
    valueIsAComponent?: boolean;
    customValue?: (value?: any, rowData?: any) => JSX.Element;
    styles?: string;
    rightIcon?: React.ReactNode;
  }[];
  tableClassname?: string;
  tableData: Record<string, any>[];
  tableType?: "default" | "card";
  cardComponent?: (data: any[]) => React.ReactNode;
  loading: boolean;
  refreshTable?: () => Promise<any>;
  queryValue?: string;
  paginationInfo: PaginationType;
  clearFilters?: () => void;
};

export const Table = (props: TableType) => {
  const {
    showHeader = true,
    tableTitle,
    filterList,
    columnList,
    tableClassname,
    tableData = [],
    tableType = "default",
    cardComponent,
    loading,
    refreshTable,
    queryValue = "",
    paginationInfo,
    clearFilters,
  } = props;
  const [hoveredCell, setHoveredCell] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);

  const {
    total,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  } = paginationInfo();

  // Pagination state
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const totalEntries = total || 0;
  const paginatedData = useMemo(() => {
    return tableData || [];
  }, [tableData]);

  useEffect(() => {}, [tableData]);

  const SkeletonLoader = () => {
    return (
      <>
        {showHeader ? (
          <header className="flex items-center justify-between gap-2 px-4 py-2 border-[0.6px] border-strokeGreyThree rounded-full">
            <div className="w-[230px] h-[24px] bg-gray-100 border-[0.6px] border-strokeGreyThree rounded-full"></div>
            <div className="flex items-center justify-end gap-2">
              {filterList?.map((_filter, index) => (
                <div
                  key={index}
                  className="w-[88px] h-[24px] bg-gray-100 border-[0.6px] border-strokeGreyThree rounded-full"
                ></div>
              ))}
            </div>
          </header>
        ) : null}
        {tableType === "default" ? (
          <div className="animate-pulse border-[0.6px] p-4 border-strokeGreyThree">
            {Array.from({ length: entriesPerPage }).map((_, index) => (
              <div
                key={index}
                className="h-[40px] bg-gray-100 mb-4 rounded border-[0.6px] border-strokeGreyThree"
              ></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4 p-4 animate-pulse border-[0.6px] border-strokeGreyThree">
            {Array.from({ length: entriesPerPage }).map((_, index) => (
              <div
                key={index}
                className="w-[32%] h-[216px] bg-gray-100 rounded-[20px] border-[0.6px] border-strokeGreyThree"
              ></div>
            ))}
          </div>
        )}
      </>
    );
  };

  const PaginationComponent = () => {
    return (
      <Pagination
        totalEntries={totalEntries}
        entriesPerPage={entriesPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onEntriesPerPageChange={setEntriesPerPage}
      />
    );
  };

  return (
    <div className="flex flex-col w-full gap-2">
      {loading ? (
        <SkeletonLoader />
      ) : totalEntries === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 w-full border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <img src={wrong} alt="No data available" className="w-[100px]" />
          <p className="text-textBlack font-medium">No data available</p>
          <button
            className="bg-[#F6F8FA] px-4 py-1 text-textDarkGrey font-medium border border-strokeGreyTwo mt-4 rounded-full hover:text-textBlack transition-all"
            onClick={async () => {
              setRefreshing(true);
              clearFilters!();
              await refreshTable!();
              setRefreshing(false);
            }}
          >
            {refreshing ? "Refreshing..." : "Refresh Table"}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col w-full gap-2 overflow-x-auto max-w-full">
            <div className="flex flex-col gap-2 min-w-[975px]">
              {showHeader ? (
                <header className="flex items-center justify-between gap-2 p-[8px_8px_8px_16px] bg-paleGrayGradient border-[0.6px] border-strokeGreyThree rounded-full">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-textDarkGrey">
                      {tableTitle}
                    </h2>
                    <button
                      className="bg-white text-xs px-2 py-1 text-textDarkGrey font-medium border border-strokeGreyTwo rounded-full hover:text-textBlack hover:border-textBlack transition-all"
                      onClick={async () => {
                        setRefreshing(true);
                        await refreshTable!();
                        setRefreshing(false);
                      }}
                    >
                      {refreshing ? "Refreshing..." : "Refresh Table"}
                    </button>
                    <button
                      className="bg-white text-xs px-2 py-1 text-textDarkGrey font-medium border border-strokeGreyTwo rounded-full hover:text-textBlack hover:border-textBlack transition-all"
                      onClick={async () => {
                        clearFilters!();
                        await refreshTable!();
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {filterList?.map((filter, index) =>
                      filter.isSearch ? (
                        <TableSearch
                          key={index}
                          name={filter.name}
                          onSearch={filter.onSearch}
                          queryValue={queryValue}
                          refreshTable={refreshTable}
                        />
                      ) : (
                        <DropDown key={index} {...filter} />
                      )
                    )}
                  </div>
                </header>
              ) : null}
              <section
                className={`${tableClassname} w-full p-[16px_16px_0px_16px] border-[0.6px] border-strokeGreyThree rounded-[20px]`}
              >
                {tableType === "default" ? (
                  <table>
                    <thead>
                      <tr className="h-[32px]">
                        {columnList?.map((column, index) => (
                          <th
                            key={index}
                            className={`${column.styles} p-2 text-xs font-light text-left text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full"></span>
                                <span>{column.title}</span>
                              </div>
                              {column.rightIcon}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData?.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="h-[40px] hover:opacity-80"
                        >
                          {columnList?.map((column, colIndex) => {
                            const cellValue = row[column.key];

                            return (
                              <td
                                key={colIndex}
                                className="px-2 text-xs text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]"
                                onMouseEnter={() =>
                                  setHoveredCell({ rowIndex, colIndex })
                                }
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                {column.valueIsAComponent &&
                                column.customValue ? (
                                  column.customValue(cellValue, row)
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span>{cellValue || "-"}</span>
                                    {colIndex === 0 ||
                                    colIndex ===
                                      columnList?.length - 1 ? null : (
                                      <span
                                        className="flex items-center justify-center w-5 h-5 rounded-full cursor-pointer"
                                        onClick={() =>
                                          copyToClipboard(cellValue)
                                        }
                                      >
                                        {hoveredCell?.rowIndex === rowIndex &&
                                        hoveredCell?.colIndex === colIndex ? (
                                          <PiCopySimple />
                                        ) : null}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  cardComponent && cardComponent(paginatedData)
                )}
                <div className="w-full hidden sm:block">
                  <PaginationComponent />
                </div>
              </section>
            </div>
          </div>
          <div className="w-full block pt-2 sm:hidden">
            <PaginationComponent />
          </div>
        </>
      )}
    </div>
  );
};
