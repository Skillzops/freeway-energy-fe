import { useState } from "react";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { KeyedMutator } from "swr";
import { PaginationType, Table } from "../TableComponent/Table";
import { ErrorComponent } from "@/Pages/ErrorPage";
import SalesDetailsModal from "./SalesDetailsModal";
import {
  NameTag,
  DateTimeTag,
  NairaSymbol,
  SimpleTag,
} from "../CardComponents/CardComponent";
import { formatNumberWithCommas } from "@/utils/helpers";

type SalesEntries = {
  no: string;
  saleId?: string;
  paymentMode: string;
  dateCreated: string;
  customer: string;
  status: string;
  amount: number;
};

// Helper function to map the API data to the desired format
const generateSalesEntries = (data: any): SalesEntries[] => {
  const entries: SalesEntries[] = data?.saleItems?.map(
    (item: any, index: number) => {
      const customerKey = item?.sale?.customer;
      const customerName = `${customerKey?.firstname} ${customerKey?.lastname}`;
      return {
        no: index + 1,
        saleId: item?.id,
        paymentMode:
          item?.paymentMode === "ONE_OFF"
            ? "SINGLE DEPOSIT"
            : item?.paymentMode,
        dateCreated: item?.createdAt,
        customer: customerName,
        status: item?.sale?.status,
        amount: item?.sale?.totalPrice,
      };
    }
  );
  return entries;
};

const SalesTable = ({
  salesData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  salesData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  error: any;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [salesID, setSalesID] = useState<string>("");
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
    {
      title: "CUSTOMER",
      key: "customer",
      valueIsAComponent: true,
      customValue: (value: string) => {
        return <NameTag name={value} />;
      },
    },
    {
      title: "DATE CREATED",
      key: "dateCreated",
      valueIsAComponent: true,
      customValue: (value: string) => {
        return <DateTimeTag datetime={value} showAll={false} />;
      },
    },
    {
      title: "STATUS",
      key: "status",
      valueIsAComponent: true,
      customValue: (value: string) => {
        return (
          <SimpleTag
            text={value}
            dotColour="#9BA4BA"
            containerClass="bg-[#F6F8FA] font-light text-textDarkGrey px-2 py-1 border-[0.4px] border-strokeGreyThree rounded-full"
          />
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
            d="M6.62922 2.16602H9.37111C10.5963 2.16601 11.5667 2.166 12.3262 2.26811C13.1078 2.37319 13.7404 2.5946 14.2393 3.09351C14.7382 3.59242 14.9597 4.22505 15.0647 5.00667C15.125 5.45525 15.1497 5.97741 15.1598 6.5822C15.1644 6.60945 15.1668 6.63745 15.1668 6.66602C15.1668 6.68952 15.1652 6.71264 15.1621 6.73528C15.1668 7.11243 15.1668 7.52057 15.1668 7.96174V7.99935C15.1668 8.27549 14.943 8.49935 14.6668 8.49935C14.3907 8.49935 14.1668 8.27549 14.1668 7.99935C14.1668 7.70208 14.1668 7.42494 14.1655 7.16602H1.83482C1.83355 7.42494 1.8335 7.70208 1.8335 7.99935C1.8335 9.27056 1.83456 10.1737 1.92667 10.8588C2.01685 11.5295 2.18596 11.9159 2.4681 12.1981C2.75024 12.4802 3.13667 12.6493 3.8074 12.7395C4.4925 12.8316 5.39562 12.8327 6.66683 12.8327H9.3335C9.60964 12.8327 9.8335 13.0565 9.8335 13.3327C9.8335 13.6088 9.60964 13.8327 9.3335 13.8327H6.62922C5.40405 13.8327 4.43362 13.8327 3.67415 13.7306C2.89253 13.6255 2.2599 13.4041 1.76099 12.9052C1.26208 12.4063 1.04067 11.7736 0.935586 10.992C0.833477 10.2326 0.833486 9.26213 0.833496 8.03696V7.96174C0.833492 7.52056 0.833489 7.11242 0.838254 6.73527C0.835117 6.71263 0.833497 6.68951 0.833497 6.66602C0.833497 6.63746 0.835891 6.60946 0.840489 6.58221C0.850591 5.97742 0.875276 5.45525 0.935586 5.00667C1.04067 4.22505 1.26208 3.59242 1.76099 3.09351C2.2599 2.5946 2.89253 2.37319 3.67415 2.26811C4.43362 2.166 5.40405 2.16601 6.62922 2.16602ZM1.85088 6.16602H14.1494C14.1364 5.77486 14.1136 5.43691 14.0737 5.13991C13.9835 4.46919 13.8144 4.08276 13.5322 3.80062C13.2501 3.51848 12.8637 3.34937 12.1929 3.25919C11.5078 3.16708 10.6047 3.16602 9.3335 3.16602H6.66683C5.39562 3.16602 4.49251 3.16708 3.8074 3.25919C3.13667 3.34937 2.75024 3.51848 2.4681 3.80062C2.18596 4.08276 2.01685 4.46919 1.92667 5.13991C1.88674 5.43691 1.86392 5.77486 1.85088 6.16602ZM12.6668 8.83268C12.943 8.83268 13.1668 9.05654 13.1668 9.33268V12.1256L13.6466 11.6458C13.8419 11.4505 14.1585 11.4505 14.3537 11.6458C14.549 11.8411 14.549 12.1576 14.3537 12.3529L13.0204 13.6862C12.8251 13.8815 12.5085 13.8815 12.3133 13.6862L10.9799 12.3529C10.7847 12.1576 10.7847 11.8411 10.9799 11.6458C11.1752 11.4505 11.4918 11.4505 11.687 11.6458L12.1668 12.1256V9.33268C12.1668 9.05654 12.3907 8.83268 12.6668 8.83268ZM3.50016 10.666C3.50016 10.3899 3.72402 10.166 4.00016 10.166H6.66683C6.94297 10.166 7.16683 10.3899 7.16683 10.666C7.16683 10.9422 6.94297 11.166 6.66683 11.166H4.00016C3.72402 11.166 3.50016 10.9422 3.50016 10.666ZM7.8335 10.666C7.8335 10.3899 8.05735 10.166 8.3335 10.166H8.66683C8.94297 10.166 9.16683 10.3899 9.16683 10.666C9.16683 10.9422 8.94297 11.166 8.66683 11.166H8.3335C8.05735 11.166 7.8335 10.9422 7.8335 10.666Z"
            fill="#828DA9"
          />
        </svg>
      ),
    },
    { title: "PAYMENT MODE", key: "paymentMode" },
    {
      title: "TOTAL AMOUNT",
      key: "amount",
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
            d="M6.62922 2.16602H9.37111C10.5963 2.16601 11.5667 2.166 12.3262 2.26811C13.1078 2.37319 13.7404 2.5946 14.2393 3.09351C14.7382 3.59242 14.9597 4.22505 15.0647 5.00667C15.125 5.45525 15.1497 5.97741 15.1598 6.5822C15.1644 6.60945 15.1668 6.63745 15.1668 6.66602C15.1668 6.68952 15.1652 6.71264 15.1621 6.73528C15.1668 7.11243 15.1668 7.52057 15.1668 7.96174V7.99935C15.1668 8.27549 14.943 8.49935 14.6668 8.49935C14.3907 8.49935 14.1668 8.27549 14.1668 7.99935C14.1668 7.70208 14.1668 7.42494 14.1655 7.16602H1.83482C1.83355 7.42494 1.8335 7.70208 1.8335 7.99935C1.8335 9.27056 1.83456 10.1737 1.92667 10.8588C2.01685 11.5295 2.18596 11.9159 2.4681 12.1981C2.75024 12.4802 3.13667 12.6493 3.8074 12.7395C4.4925 12.8316 5.39562 12.8327 6.66683 12.8327H9.3335C9.60964 12.8327 9.8335 13.0565 9.8335 13.3327C9.8335 13.6088 9.60964 13.8327 9.3335 13.8327H6.62922C5.40405 13.8327 4.43362 13.8327 3.67415 13.7306C2.89253 13.6255 2.2599 13.4041 1.76099 12.9052C1.26208 12.4063 1.04067 11.7736 0.935586 10.992C0.833477 10.2326 0.833486 9.26213 0.833496 8.03696V7.96174C0.833492 7.52056 0.833489 7.11242 0.838254 6.73527C0.835117 6.71263 0.833497 6.68951 0.833497 6.66602C0.833497 6.63746 0.835891 6.60946 0.840489 6.58221C0.850591 5.97742 0.875276 5.45525 0.935586 5.00667C1.04067 4.22505 1.26208 3.59242 1.76099 3.09351C2.2599 2.5946 2.89253 2.37319 3.67415 2.26811C4.43362 2.166 5.40405 2.16601 6.62922 2.16602ZM1.85088 6.16602H14.1494C14.1364 5.77486 14.1136 5.43691 14.0737 5.13991C13.9835 4.46919 13.8144 4.08276 13.5322 3.80062C13.2501 3.51848 12.8637 3.34937 12.1929 3.25919C11.5078 3.16708 10.6047 3.16602 9.3335 3.16602H6.66683C5.39562 3.16602 4.49251 3.16708 3.8074 3.25919C3.13667 3.34937 2.75024 3.51848 2.4681 3.80062C2.18596 4.08276 2.01685 4.46919 1.92667 5.13991C1.88674 5.43691 1.86392 5.77486 1.85088 6.16602ZM12.6668 8.83268C12.943 8.83268 13.1668 9.05654 13.1668 9.33268V12.1256L13.6466 11.6458C13.8419 11.4505 14.1585 11.4505 14.3537 11.6458C14.549 11.8411 14.549 12.1576 14.3537 12.3529L13.0204 13.6862C12.8251 13.8815 12.5085 13.8815 12.3133 13.6862L10.9799 12.3529C10.7847 12.1576 10.7847 11.8411 10.9799 11.6458C11.1752 11.4505 11.4918 11.4505 11.687 11.6458L12.1668 12.1256V9.33268C12.1668 9.05654 12.3907 8.83268 12.6668 8.83268ZM3.50016 10.666C3.50016 10.3899 3.72402 10.166 4.00016 10.166H6.66683C6.94297 10.166 7.16683 10.3899 7.16683 10.666C7.16683 10.9422 6.94297 11.166 6.66683 11.166H4.00016C3.72402 11.166 3.50016 10.9422 3.50016 10.666ZM7.8335 10.666C7.8335 10.3899 8.05735 10.166 8.3335 10.166H8.66683C8.94297 10.166 9.16683 10.3899 9.16683 10.666C9.16683 10.9422 8.94297 11.166 8.66683 11.166H8.3335C8.05735 11.166 7.8335 10.9422 7.8335 10.666Z"
            fill="#828DA9"
          />
        </svg>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (_value: any, rowData: { saleId: string }) => {
        return (
          <span
            className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
            onClick={() => {
              setSalesID(rowData.saleId);
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
    return generateSalesEntries(salesData);
  };

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableTitle="SALES"
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
          {salesID && (
            <SalesDetailsModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              salesID={salesID}
            />
          )}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch sales list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default SalesTable;
