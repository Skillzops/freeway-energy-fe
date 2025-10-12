import { useState, useEffect, useRef } from "react";
// import { PaginationType, Table } from "../TableComponent/Table";
import { KeyedMutator } from "swr";
import {
  ApiErrorStatesType,
  useApiCall,
  useGetRequest,
} from "@/utils/useApiCall";

import { formatNumberWithCommas } from "@/utils/helpers";
import { NairaSymbol } from "../CardComponents/CardComponent";

import { useNavigate } from "react-router-dom";
import edit from "@/assets/edit.svg";
import MainWarehouse from "@/assets/warehouse/mainWarehouse.png";
import WarehouseDetailModal from "./WarehouseDetailsModal";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { PaginationType, Table } from "@/Components/Installer/TableComponent/Table";

interface AllWarehouseEntries {
  id: string;
  name: string;
  inventoryClass: string;
  capacity: number;
  status: "ACTIVE" | "INACTIVE";
  image?: string;
  value: number;
}

const generateWarehouseEntries = (data: any): AllWarehouseEntries[] => {
  // Try different possible array locations
  let warehouseArray =
    data?.data || data?.warehouses || data?.results || data?.items || [];

  // If still empty but we have a total, the data might be directly in the response
  if (warehouseArray.length === 0 && data?.total > 0) {
    // Check if the data is directly in the response object
    if (Array.isArray(data)) {
      warehouseArray = data;
    } else {
      // Look for any array property in the response
      const arrayKeys = Object.keys(data || {}).filter((key) =>
        Array.isArray(data[key])
      );
      if (arrayKeys.length > 0) {
        warehouseArray = data[arrayKeys[0]];
        console.log(`Found array in key: ${arrayKeys[0]}`, warehouseArray);
      }
    }
  }

  console.log("Final warehouseArray:", warehouseArray);

  const entries: AllWarehouseEntries[] = warehouseArray.map(
    (warehouse: any) => {
      console.log("Processing warehouse:", warehouse);
      console.log("Warehouse value fields:", {
        totalValue: warehouse?.totalValue,
        value: warehouse?.value,
        inventoryValue: warehouse?.inventoryValue,
        totalInventoryValue: warehouse?.totalInventoryValue,
        worth: warehouse?.worth,
        amount: warehouse?.amount,
        inventoryWorth: warehouse?.inventoryWorth,
        totalInventoryWorth: warehouse?.totalInventoryWorth,
        allKeys: Object.keys(warehouse || {}),
      });

      // Prioritize inventory-specific value fields for total money worth
      const warehouseValue =
        warehouse?.totalInventoryValue ||
        warehouse?.inventoryValue ||
        warehouse?.totalInventoryWorth ||
        warehouse?.inventoryWorth ||
        warehouse?.totalValue ||
        warehouse?.value ||
        warehouse?.worth ||
        warehouse?.amount ||
        0;

      return {
        id: warehouse?.id,
        name: warehouse?.name,
        image: warehouse?.image || MainWarehouse, // Default image if none provided
        inventoryClass: Array.isArray(warehouse?.inventoryClasses)
          ? warehouse.inventoryClasses.join(", ")
          : warehouse?.inventoryClasses ||
            warehouse?.category?.name ||
            "General",
        capacity: warehouse?.capacity || 0,
        status: warehouse?.status || "ACTIVE",
        value: warehouseValue,
      };
    }
  );

  console.log("generateWarehouseEntries - final entries:", entries);
  return entries;
};

// Custom dropdown menu component
interface WarehouseDropdownProps {
  items: string[];
  onClickLink: (index: number, warehouse: any) => void;
  warehouse: any;
}

const WarehouseDropdown = ({
  items,
  onClickLink,
  warehouse,
}: WarehouseDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { apiCall } = useApiCall();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeactivateWarehouse = async () => {
    if (!warehouse?.id) {
      console.error("No warehouse ID provided");
      return;
    }

    const isCurrentlyActive = warehouse.status === "ACTIVE";
    const action = isCurrentlyActive ? "deactivate" : "activate";
    const actionPast = isCurrentlyActive ? "deactivated" : "activated";

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${warehouse.name}"?`
    );

    if (!confirmed) return;

    setIsDeactivating(true);
    try {
      const response = await apiCall({
        method: "patch",
        endpoint: `/v1/${warehouse.id}`,
        successMessage: `Warehouse "${warehouse.name}" has been ${actionPast} successfully!`,
      });

      if (response.status === 200) {
        // Refresh the table data
        if (onClickLink) {
          onClickLink(-1, warehouse); // Use -1 to indicate refresh action
        }
      }
    } catch (error: any) {
      console.error(`Failed to ${action} warehouse:`, error);
      // Error message will be shown by the apiCall hook
    } finally {
      setIsDeactivating(false);
      setIsOpen(false);
    }
  };

  const handleItemClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isDeactivateOrActivate =
      items[index]?.includes("warehouse") &&
      (items[index]?.includes("Deactivate") ||
        items[index]?.includes("Activate"));

    if (isDeactivateOrActivate) {
      handleDeactivateWarehouse();
    } else {
      onClickLink(index, warehouse);
    }

    if (!isDeactivateOrActivate) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-10 h-7 p-2 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow hover:bg-gray-100"
        disabled={isDeactivating}
      >
        <img src={edit} alt="Options" className="w-[16px] cursor-pointer" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          {items.map((item: string, index: number) => {
            const isDeactivateOrActivate =
              item.includes("warehouse") &&
              (item.includes("Deactivate") || item.includes("Activate"));
            const isDeactivate = item.includes("Deactivate");
            const isActivate = item.includes("Activate");

            return (
              <button
                key={index}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  isDeactivateOrActivate && isDeactivating
                    ? "text-gray-400 cursor-not-allowed"
                    : isDeactivate
                    ? "text-red-600 hover:bg-red-50"
                    : isActivate
                    ? "text-green-600 hover:bg-green-50"
                    : "text-gray-700"
                }`}
                onClick={(e) => handleItemClick(index, e)}
                disabled={isDeactivateOrActivate && isDeactivating}
              >
                {isDeactivateOrActivate && isDeactivating
                  ? isDeactivate
                    ? "Deactivating..."
                    : "Activating..."
                  : item}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Component to fetch and display warehouse inventory count badge
const WarehouseInventoryBadge = ({
  warehouse,
  isInactive,
}: {
  warehouse: any;
  isInactive: boolean;
}) => {
  const { data: inventoryStats } = useGetRequest(
    `/v1/inventory/stats?warehouseId=${warehouse.id}`,
    !!warehouse.id
  );

  const inventoryCount = inventoryStats?.data?.totalInventoryCount || 0;

  return (
    <div
      className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-medium ${
        isInactive ? "bg-gray-200 text-gray-600" : "bg-blue-100 text-blue-700"
      }`}
    >
      {inventoryCount} Items
    </div>
  );
};

// Component to fetch and display warehouse inventory value
const WarehouseValueDisplay = ({
  warehouse,
  isInactive,
}: {
  warehouse: any;
  isInactive: boolean;
}) => {
  const { data: inventoryStats } = useGetRequest(
    `/v1/inventory/stats?warehouseId=${warehouse.id}`,
    !!warehouse.id
  );

  // Use inventory stats value if available, otherwise fall back to warehouse value
  const displayValue =
    inventoryStats?.data?.totalInventoryValue ||
    inventoryStats?.data?.totalValue ||
    warehouse.value ||
    0;

  return (
    <span
      className={`flex items-center px-4 py-1 rounded-full text-base font-medium gap-1 cursor-help ${
        isInactive ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"
      }`}
      title={`Total Inventory Worth: ${formatNumberWithCommas(displayValue)}`}
    >
      <NairaSymbol color={isInactive ? "#6B7280" : "#15803D"} />
      {formatNumberWithCommas(displayValue)}
    </span>
  );
};

const WarehouseTable = ({
  warehouseData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  warehouseData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  error: any;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [warehouseId, setWarehouseId] = useState<string>("");
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

  const dropDownList = {
    items: [
      "View warehouse",
      "View Details",
      "View Inventory Log",
      "Deactivate warehouse",
    ],
    onClickLink: (index: number, cardData: any) => {
      switch (index) {
        case 0:
          navigate(`/inventory/all?warehouseId=${cardData?.id}`);
          break;
        case 1:
          setWarehouseId(cardData?.id);
          setIsOpen(true);
          break;
        case 2:
          console.log("View Inventory Log", cardData?.id);
          break;
        case 3:
          // Handled by WarehouseDropdown component
          break;
        case -1:
          // Refresh table after deactivation
          refreshTable();
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  // Function to get dropdown items based on warehouse status
  const getDropdownItems = (warehouse: any) => {
    const baseItems = ["View warehouse", "View Details", "View Inventory Log"];
    if (warehouse.status === "ACTIVE") {
      return [...baseItems, "Deactivate warehouse"];
    } else {
      return [...baseItems, "Activate warehouse"];
    }
  };

  const getTableData = () => {
    return generateWarehouseEntries(warehouseData);
  };

  // Create a pagination function that returns the correct structure
  const getPaginationInfo: PaginationType = () => {
    return paginationInfo();
  };

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableType="card"
            tableTitle="ALL WAREHOUSES"
            tableClassname="flex flex-wrap items-start justify-start gap-8"
            tableData={warehouseData ? getTableData() : []}
            loading={isLoading}
            filterList={filterList}
            cardComponent={(data: any[]) => {
              console.log("Card component - data:", data);

              if (!data || data.length === 0) {
                return (
                  <div className="w-full text-center py-8">
                    <p className="text-gray-500">No warehouses found</p>
                  </div>
                );
              }

              return data?.map((warehouse: any, index: number) => {
                console.log("Rendering warehouse card:", warehouse);
                const isInactive = warehouse.status === "INACTIVE";

                return (
                  <div
                    key={warehouse.id || index}
                    className={`relative bg-white rounded-[28px] border-4 shadow-md flex flex-col items-stretch w-full max-w-[440px] cursor-pointer hover:shadow-lg transition-shadow ${
                      isInactive ? "border-gray-300 opacity-75" : "border-white"
                    }`}
                    style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.06)" }}
                    onClick={() =>
                      navigate(`/inventory/all?warehouseId=${warehouse.id}`)
                    }
                  >
                    {isInactive && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        INACTIVE
                      </div>
                    )}
                    <WarehouseInventoryBadge
                      warehouse={warehouse}
                      isInactive={isInactive}
                    />
                    <img
                      src={warehouse.image}
                      alt={warehouse.name}
                      className={`w-full aspect-[16/7] object-cover rounded-[20px] mt-2 ${
                        isInactive ? "grayscale" : ""
                      }`}
                    />
                    <div className="flex items-center justify-between gap-2 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`px-4 py-1 border text-dark-700 rounded-full text-base font-medium truncate max-w-[160px] ${
                            isInactive
                              ? "bg-gray-100 border-gray-300"
                              : "bg-purpleBlue border-blue-300"
                          }`}
                          title={warehouse.name}
                        >
                          {warehouse.name}
                        </span>
                        <WarehouseValueDisplay
                          warehouse={warehouse}
                          isInactive={isInactive}
                        />
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <WarehouseDropdown
                          items={getDropdownItems(warehouse)}
                          onClickLink={dropDownList.onClickLink}
                          warehouse={warehouse}
                        />
                      </div>
                    </div>
                  </div>
                );
              });
            }}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={getPaginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
          {warehouseId && (
            <WarehouseDetailModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              warehouseID={warehouseId}
              refreshTable={refreshTable}
            />
          )}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch warehouse list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default WarehouseTable;
