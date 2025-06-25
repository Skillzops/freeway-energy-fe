import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { KeyedMutator } from "swr";
import { PaginationType, Table } from "../TableComponent/Table";
import { GoDotFill } from "react-icons/go";
import { formatNumberWithCommas } from "@/utils/helpers";
import { NairaSymbol } from "../CardComponents/CardComponent";
import InventoryDetailModal from "./InventoryDetailModal";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";

interface InventoryEntries {
  id: string;
  no: number;
  name: { image: string; text: string };
  class: string;
  salePrice: {
    minimumInventoryBatchPrice: number;
    maximumInventoryBatchPrice: number;
  };
  inventoryValue: number;
  stockLevel: { totalUnits: number; currentUnits: number };
  deleted: boolean;
}

type InventoryCategory = {
  id: string;
  name: string;
  parentId: string | null;
  type: string;
};

type InventorySubCategory = {
  id: string;
  name: string;
  parentId: string;
  type: string;
};

type Batch = {
  id: string;
  costOfItem: number;
  price: number;
  batchNumber: number;
  numberOfStock: number;
  remainingQuantity: number;
  inventoryId: string;
};

type InventoryRecord = {
  id: string;
  name: string;
  manufacturerName: string;
  sku: string;
  image: string;
  dateOfManufacture: string;
  status: string;
  class: string;
  inventoryCategoryId: string;
  inventorySubCategoryId: string;
  inventoryCategory: InventoryCategory;
  inventorySubCategory: InventorySubCategory;
  batches: Batch[];
  salePrice: string;
  inventoryValue: number;
  totalRemainingQuantities: number;
  totalInitialQuantities: number;
};

// Helper function to map the API data to the desired format
const generateInventoryEntries = (data: any): InventoryEntries[] => {
  const entries: InventoryEntries[] = data?.inventories.map(
    (item: InventoryRecord, index: number) => {
      return {
        id: item?.id,
        no: index + 1,
        name: { image: item?.image, text: item?.name },
        class: item?.class,
        salePrice: item?.salePrice,
        inventoryValue: item?.inventoryValue || 0,
        stockLevel: {
          totalUnits: item?.totalInitialQuantities || 0,
          currentUnits: item?.totalRemainingQuantities || 0,
        },
      };
    }
  );

  return entries;
};

const InventoryTable = ({
  inventoryData,
  isLoading,
  refreshTable,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  inventoryData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inventoryID, setInventoryID] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);
  const [urlSearchParams] = useSearchParams();

  const inventoryIdParam = urlSearchParams.get("inventoryId") || "";

  useEffect(() => {
    if (inventoryIdParam) {
      setInventoryID(inventoryIdParam);
      setIsOpen(true);
    }
  }, [inventoryIdParam]);

  const filterList = [
    {
      name: "Class",
      items: ["Regular", "Returned", "Refurbished"],
      onClickLink: async (index: number) => {
        setIsSearchQuery(false);
        const selectedClass = ["REGULAR", "RETURNED", "REFURBISHED"][index];
        setQueryValue(selectedClass);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          class: selectedClass,
        }));
      },
    },
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
    {
      title: "NAME",
      key: "name",
      valueIsAComponent: true,
      customValue: (value: { image: string; text: string }) => {
        return (
          <div className="flex items-center gap-1 w-max">
            <div className="relative flex items-center w-[64px] h-[64px] py-1.5 pr-2">
              {value.image ? (
                <img
                  src={value.image}
                  alt={`${value.text} Image`}
                  className="w-full h-full object-cover rounded-sm"
                  loading="eager"
                />
              ) : (
                <span className="bg-gray-100 flex items-center justify-center w-[54px] h-[48px] px-1 text-textBlack text-[9px] text-center font-medium rounded-md">
                  No Image
                </span>
              )}
            </div>
            <span className="text-textBlack text-sm">{value.text}</span>
          </div>
        );
      },
    },
    {
      title: "CLASS",
      key: "class",
      valueIsAComponent: true,
      customValue: (value: string) => {
        let style: string = "";
        if (value?.toLocaleLowerCase() === "regular") {
          style = "bg-[#EAEEF2] text-textDarkGrey";
        } else if (value?.toLocaleLowerCase() === "returned") {
          style = "bg-[#FFEBEC] text-errorTwo";
        } else {
          style = "bg-[#FEF5DA] text-textDarkBrown";
        }
        return (
          <span
            className={`${style} flex items-center justify-center gap-0.5 w-max px-2 h-[24px] text-xs uppercase rounded-full`}
          >
            <GoDotFill width={4} height={4} />
            {value}
          </span>
        );
      },
    },
    {
      title: "SALE PRICE",
      key: "salePrice",
      valueIsAComponent: true,
      customValue: (value: {
        minimumInventoryBatchPrice: number;
        maximumInventoryBatchPrice: number;
      }) => {
        const { minimumInventoryBatchPrice, maximumInventoryBatchPrice } =
          value;
        const formattedPrice =
          minimumInventoryBatchPrice === maximumInventoryBatchPrice
            ? formatNumberWithCommas(maximumInventoryBatchPrice)
            : `${formatNumberWithCommas(
                minimumInventoryBatchPrice
              )} - ${formatNumberWithCommas(maximumInventoryBatchPrice)}`;

        return (
          <div className="flex items-center gap-1">
            <NairaSymbol />
            <span className="text-textBlack">{formattedPrice}</span>
          </div>
        );
      },
      rightIcon: <NairaSymbol color="#828DA9" />,
    },
    {
      title: "INVENTORY VALUE",
      key: "inventoryValue",
      valueIsAComponent: true,
      customValue: (value: number) => {
        return (
          <div className="flex items-center gap-1">
            <NairaSymbol />
            <span className="text-textBlack">
              {value && formatNumberWithCommas(value)}
            </span>
          </div>
        );
      },
      rightIcon: <NairaSymbol color="#828DA9" />,
    },
    {
      title: "STOCK LEVEL",
      key: "stockLevel",
      valueIsAComponent: true,
      customValue: (value: { totalUnits: number; currentUnits: number }) => {
        const statusLevel =
          value.totalUnits && value.currentUnits
            ? (value.currentUnits / value.totalUnits) * 100
            : 0; // Ensure default is 0 if values are missing

        const displayStatusLevel = isNaN(statusLevel)
          ? 0
          : statusLevel.toFixed();

        const getStatusLevel =
          statusLevel > 50
            ? "bg-successThree border-inkBlue"
            : "bg-[#FFEBEC] border-[#FFC7CD]";

        return (
          <div className="flex items-center gap-0 w-full">
            <span className="flex items-center justify-center w-[130px] text-textGrey font-bold px-1 h-[24px] bg-[#F6F8FA] border-[0.6px] border-strokeGreyThree rounded-full">
              {value.currentUnits && formatNumberWithCommas(value.currentUnits)}{" "}
              /
              <span className="font-normal">
                {value.totalUnits && formatNumberWithCommas(value.totalUnits)}
              </span>
            </span>
            <div className="flex w-[77%] h-[24px] bg-[#FFFFFC] border-[0.6px] border-strokeGreyThree rounded-full">
              <span
                className={`${getStatusLevel} flex items-center ${
                  statusLevel === 0
                    ? "justify-start text-errorTwo px-2"
                    : "justify-end text-textBlack pr-1.5"
                } h-full text-[9px] font-bold border-[0.6px] rounded-full`}
                style={{
                  width:
                    statusLevel === 0
                      ? "100%"
                      : statusLevel <= 35
                      ? "35%"
                      : `${statusLevel}%`,
                }}
              >
                {displayStatusLevel}%
              </span>
            </div>
          </div>
        );
      },
      rightIcon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.9294 1.34617L10.9738 1.35806C11.7067 1.55443 12.2875 1.71006 12.7443 1.87508C13.2116 2.04389 13.5927 2.23699 13.9066 2.53101C14.3637 2.95915 14.6836 3.51323 14.8258 4.12317C14.9235 4.54205 14.9002 4.9686 14.8127 5.45769C14.7272 5.93585 14.5716 6.51668 14.3752 7.24962L14.0182 8.58183C13.8219 9.31472 13.6663 9.89551 13.5012 10.3523C13.3324 10.8196 13.1393 11.2007 12.8453 11.5146C12.4308 11.9572 11.8982 12.2711 11.3112 12.4197C11.1397 12.8129 10.8892 13.1689 10.5733 13.4649C10.2593 13.7589 9.87828 13.952 9.41099 14.1208C8.95416 14.2858 8.37337 14.4414 7.64048 14.6378L7.59618 14.6497C6.86324 14.8461 6.28241 15.0017 5.80425 15.0872C5.31516 15.1747 4.88861 15.198 4.46973 15.1003C3.85978 14.9581 3.30571 14.6382 2.87757 14.1811C2.58355 13.8672 2.39045 13.4861 2.22164 13.0188C2.05661 12.562 1.90099 11.9812 1.70461 11.2482L1.34764 9.91602C1.15126 9.18311 0.995626 8.6023 0.910126 8.12416C0.822669 7.63507 0.79937 7.20851 0.897038 6.78964C1.03926 6.17969 1.35915 5.62562 1.81627 5.19748C2.1302 4.90346 2.51125 4.71035 2.97855 4.54155C3.43538 4.37652 4.01619 4.2209 4.7491 4.02452L4.77126 4.01858C4.94757 3.97134 5.11439 3.92672 5.27233 3.88499C5.5334 2.95224 5.76315 2.29287 6.2109 1.81481C6.63904 1.35769 7.19312 1.03779 7.80306 0.895573C8.22194 0.797905 8.64849 0.821204 9.13758 0.908661C9.61572 0.994161 10.1965 1.14979 10.9294 1.34617ZM4.97017 5.00056C4.24159 5.19584 3.71953 5.33712 3.3183 5.48207C2.91202 5.62883 2.67347 5.76475 2.49987 5.92734C2.1871 6.22028 1.96822 6.59938 1.87091 7.01672C1.8169 7.24835 1.81847 7.5229 1.89451 7.94814C1.97165 8.37951 2.11586 8.91936 2.31951 9.67936L2.6646 10.9673C2.86824 11.7273 3.01327 12.2669 3.16216 12.6791C3.30892 13.0853 3.44484 13.3239 3.60743 13.4975C3.90037 13.8102 4.27947 14.0291 4.69681 14.1264C4.92845 14.1804 5.20299 14.1789 5.62823 14.1028C6.0596 14.0257 6.59945 13.8815 7.35945 13.6778C8.11946 13.4742 8.65909 13.3292 9.07124 13.1803C9.47752 13.0335 9.71607 12.8976 9.88967 12.735C9.9814 12.6491 10.065 12.5558 10.1399 12.4563C10.0205 12.4395 9.89772 12.418 9.77062 12.3928C9.32275 12.3037 8.78474 12.1595 8.12071 11.9816L8.08243 11.9714C7.34952 11.775 6.76871 11.6194 6.31188 11.4543C5.84459 11.2855 5.46353 11.0924 5.14961 10.7984C4.69249 10.3703 4.37259 9.81619 4.23037 9.20625C4.1327 8.78737 4.156 8.36081 4.24346 7.87172C4.32896 7.39358 4.48459 6.81277 4.68098 6.07986L4.97017 5.00056ZM8.96156 1.89305C8.53633 1.81701 8.26178 1.81544 8.03014 1.86945C7.61281 1.96676 7.2337 2.18563 6.94076 2.4984C6.65003 2.80882 6.47111 3.28838 6.15996 4.42752C6.10939 4.61265 6.05593 4.81218 5.99793 5.02862L5.65284 6.31652C5.4492 7.07653 5.30498 7.61638 5.22785 8.04775C5.15181 8.47298 5.15024 8.74753 5.20425 8.97917C5.30156 9.3965 5.52043 9.77561 5.8332 10.0685C6.0068 10.2311 6.24535 10.3671 6.65163 10.5138C7.06378 10.6627 7.60341 10.8077 8.36342 11.0114C9.04703 11.1945 9.55367 11.33 9.96564 11.412C10.3758 11.4935 10.6542 11.5135 10.8823 11.4854C10.9319 11.4793 10.9796 11.4708 11.0261 11.46C11.4434 11.3627 11.8225 11.1438 12.1154 10.831C12.278 10.6574 12.4139 10.4189 12.5607 10.0126C12.7096 9.60044 12.8546 9.06081 13.0583 8.3008L13.4034 7.0129C13.607 6.25289 13.7512 5.71304 13.8284 5.28167C13.9044 4.85644 13.906 4.58189 13.852 4.35025C13.7546 3.93292 13.5358 3.55381 13.223 3.26087C13.0494 3.09828 12.8109 2.96236 12.4046 2.8156C11.9924 2.66672 11.4528 2.52169 10.6928 2.31804C9.93278 2.1144 9.39293 1.97018 8.96156 1.89305ZM7.36843 6.53595C7.4399 6.26922 7.71407 6.11093 7.9808 6.1824L11.2006 7.04513C11.4673 7.1166 11.6256 7.39077 11.5541 7.6575C11.4826 7.92423 11.2085 8.08252 10.9417 8.01105L7.72198 7.14832C7.45525 7.07685 7.29696 6.80268 7.36843 6.53595ZM6.85053 8.46775C6.922 8.20102 7.19617 8.04273 7.4629 8.1142L9.39475 8.63184C9.66149 8.70331 9.81978 8.97748 9.74831 9.24421C9.67684 9.51094 9.40267 9.66924 9.13593 9.59776L7.20408 9.08013C6.93735 9.00866 6.77906 8.73449 6.85053 8.46775Z"
            fill="#828DA9"
          />
        </svg>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (_value: any, rowData: { id: string }) => {
        return (
          <span
            className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
            onClick={() => {
              setInventoryID(rowData.id);
              setIsOpen(true);
            }}
          >
            View
          </span>
        );
      },
    },
  ];

  const getTableData = () => {
    return generateInventoryEntries(inventoryData);
  };

  return (
    <>
      {!errorData?.errorStates[0]?.errorExists ? (
        <div className="w-full">
          <Table
            tableTitle="INVENTORY"
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
          {inventoryID && (
            <InventoryDetailModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              inventoryID={inventoryID}
              refreshTable={refreshTable}
              inventoryIdParamExists={Boolean(inventoryIdParam)}
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

export default InventoryTable;
