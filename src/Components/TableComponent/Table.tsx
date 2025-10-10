
import React, { useEffect, useMemo, useRef, useState } from "react";
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
    columnList = [],
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

  const [hoveredCell, setHoveredCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const { total, currentPage, entriesPerPage, setCurrentPage, setEntriesPerPage } = paginationInfo();

  const totalEntries = typeof total === "number" ? total : (tableData?.length ?? 0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const paginatedData = useMemo(() => tableData || [], [tableData]);

  useEffect(() => { }, [tableData]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!scrollRef.current) return;
    dragging.current = true;
    startX.current = e.clientX;
    startScrollLeft.current = scrollRef.current.scrollLeft;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current || !scrollRef.current) return;
    const dx = e.clientX - startX.current;
    scrollRef.current.scrollLeft = startScrollLeft.current - dx;
    e.preventDefault(); 
  };

  const endDrag: React.PointerEventHandler<HTMLDivElement> = (e) => {
    dragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  const SkeletonLoader = () => (
    <>
      {showHeader ? (
        <header className="flex items-center justify-between gap-2 px-4 py-2 border-[0.6px] border-strokeGreyThree rounded-full">
          <div className="w-[230px] h-[24px] bg-gray-100 border-[0.6px] border-strokeGreyThree rounded-full" />
          <div className="flex items-center justify-end gap-2">
            {filterList?.map((_filter, index) => (
              <div key={index} className="w-[88px] h-[24px] bg-gray-100 border-[0.6px] border-strokeGreyThree rounded-full" />
            ))}
          </div>
        </header>
      ) : null}
      {tableType === "default" ? (
        <div className="animate-pulse border-[0.6px] p-4 border-strokeGreyThree">
          {Array.from({ length: entriesPerPage }).map((_, index) => (
            <div key={index} className="h-[40px] bg-gray-100 mb-4 rounded border-[0.6px] border-strokeGreyThree" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4 p-4 animate-pulse border-[0.6px] border-strokeGreyThree">
          {Array.from({ length: entriesPerPage }).map((_, index) => (
            <div key={index} className="w-[32%] h-[216px] bg-gray-100 rounded-[20px] border-[0.6px] border-strokeGreyThree" />
          ))}
        </div>
      )}
    </>
  );

  const PaginationComponent = () => (
    <Pagination
      totalEntries={totalEntries}
      entriesPerPage={entriesPerPage}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onEntriesPerPageChange={(n) => {
        setEntriesPerPage(n);
        setCurrentPage(1); 
      }}
    />
  );

  if (loading) {
    return (
      <div className="flex flex-col w-full gap-2">
        <SkeletonLoader />
      </div>
    );
  }

  if (totalEntries === 0) {
    return (
      <div className="flex flex-col w-full gap-2">
        <div className="flex flex-col items-center justify-center px-4 py-16 w-full border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <img src={wrong} alt="No data available" className="w-[100px]" />
          <p className="text-textBlack font-medium">No data available</p>
          <button
            className="bg-[#F6F8FA] px-4 py-1 text-textDarkGrey font-medium border border-strokeGreyTwo mt-4 rounded-full hover:text-textBlack transition-all"
            onClick={async () => {
              setRefreshing(true);
              clearFilters?.();
              await refreshTable?.();
              setRefreshing(false);
            }}
          >
            {refreshing ? "Refreshing..." : "Refresh Table"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Header (outside the card) */}
      {showHeader ? (
        <header className="flex items-center justify-between gap-2 p-[8px_8px_8px_16px] bg-paleGrayGradient border-[0.6px] border-strokeGreyThree rounded-full">
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-semibold text-textDarkGrey">{tableTitle}</h2>
            <button
              className="bg-white text-xs px-2 py-1 text-textDarkGrey font-medium border border-strokeGreyTwo rounded-full hover:text-textBlack hover:border-textBlack transition-all"
              onClick={async () => {
                setRefreshing(true);
                await refreshTable?.();
                setRefreshing(false);
              }}
            >
              {refreshing ? "Refreshing..." : "Refresh Table"}
            </button>
            <button
              className="bg-white text-xs px-2 py-1 text-textDarkGrey font-medium border border-strokeGreyTwo rounded-full hover:text-textBlack hover:border-textBlack transition-all"
              onClick={async () => {
                clearFilters?.();
                await refreshTable?.();
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
        className={`${tableClassname ?? ""} w-full border-[0.6px] border-strokeGreyThree rounded-[20px] overflow-hidden`}
      >
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={onWheel}
        >
          <div className="p-[16px_16px_0px_16px] min-w-[975px]">
            {tableType === "default" ? (
              <table className="w-full table-auto whitespace-nowrap">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="h-[36px]">
                    {columnList.map((column, index) => (
                      <th
                        key={index}
                        className={`${column.styles ?? ""} p-2 text-[13px] md:text-sm font-medium text-left text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full" />
                            <span>{column.title}</span>
                          </div>
                          {column.rightIcon}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="h-[40px] hover:opacity-80">
                      {columnList.map((column, colIndex) => {
                        const cellValue = row[column.key];
                        return (
                          <td
                            key={colIndex}
                            className="px-2 text-xs md:text-[13px] text-textDarkGrey border-b-[0.2px] border-[#E0E0E0]"
                            onMouseEnter={() => setHoveredCell({ rowIndex, colIndex })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {column.valueIsAComponent && column.customValue ? (
                              column.customValue(cellValue, row)
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="inline-block">{cellValue ?? "-"}</span>
                                {colIndex === 0 || colIndex === columnList.length - 1 ? null : (
                                  <span
                                    className="flex items-center justify-center w-5 h-5 rounded-full cursor-pointer"
                                    onClick={() => copyToClipboard(cellValue)}
                                  >
                                    {hoveredCell?.rowIndex === rowIndex && hoveredCell?.colIndex === colIndex ? (
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

            <div className="w-full hidden sm:block pb-3">
              <Pagination
                totalEntries={totalEntries}
                entriesPerPage={entriesPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onEntriesPerPageChange={(n) => {
                  setEntriesPerPage(n);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full block pt-2 sm:hidden">
        <Pagination
          totalEntries={totalEntries}
          entriesPerPage={entriesPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEntriesPerPageChange={(n) => {
            setEntriesPerPage(n);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default Table;
