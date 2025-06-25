import { useState } from "react";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { KeyedMutator } from "swr";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { PaginationType, Table } from "../TableComponent/Table";
import gradientcontract from "../../assets/contracts/gradientcontract.svg";
import roletwo from "../../assets/table/roletwo.svg";
import ContractModal from "./ContractModal";
import { Contract } from "./contractType";

type ContractEntries = {
  productCategory: string;
  paymentMode: string;
  customer: string;
  contractSigned: string;
  contractId: string;
};

// Helper function to map the API data to the desired format
const generateContractEntries = (data: any): ContractEntries[] => {
  const entries: ContractEntries[] = data?.contracts?.map((item: Contract) => {
    return {
      productCategory: "",
      paymentMode: "",
      customer: item?.fullNameAsOnID,
      contractSigned: Boolean(item?.signedAt),
      contractId: item?.id,
    };
  });
  return entries;
};

const ContractsTable = ({
  contractsData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  contractsData: any;
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
  const [contractID, setContractID] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const filterList = [
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

  const getTableData = () => {
    return generateContractEntries(contractsData);
  };

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableType="card"
            tableTitle="ALL CONTRACTS"
            tableClassname="flex flex-wrap items-center gap-4"
            tableData={getTableData()}
            loading={isLoading}
            filterList={filterList}
            cardComponent={(data) => {
              return data?.map((item: ContractEntries, index) => (
                <ContractCardComponent
                  key={index}
                  {...item}
                  handleContractClick={() => {
                    setIsOpen(true);
                    setContractID(item.contractId);
                  }}
                />
              ));
            }}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
          {isOpen && contractID && (
            <ContractModal setIsOpen={setIsOpen} contractId={contractID} />
          )}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch contract list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default ContractsTable;

export const ContractCardComponent = (
  props: ContractEntries & { handleContractClick: () => void }
) => {
  return (
    <div
      className={`relative flex flex-col justify-between gap-2 w-[32%] min-w-[204px] min-h-[220px] p-4 bg-white border-[0.6px] border-strokeGreyThree rounded-xl shadow-sm group cursor-pointer transition-all hover:bg-[#F6F8FA]`}
      onClick={props.handleContractClick}
      title={"Open Contract Document"}
    >
      <div className="flex items-center justify-between gap-2 w-full">
        <div
          className={`flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#FEF5DA] border-[0.2px] border-strokeGreyTwo`}
        >
          <img
            src={gradientcontract}
            alt="Pill Icon"
            className="w-[16px] h-[16px]"
          />
        </div>
        <div
          className={`hidden items-center justify-center w-[32px] h-[32px] rounded-full bg-white border-[0.2px] border-strokeGreyTwo group-hover:flex`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_4112_52364)">
              <path
                d="M17.3523 12.4938C16.9471 12.2101 16.6223 11.3861 16.3982 10.6253C16.1076 9.64544 15.9718 8.62253 16.0352 7.60325C16.0828 6.83902 16.2231 5.97038 16.5887 5.44831M16.5887 5.44831C16.2231 5.97038 15.4544 6.39983 14.753 6.70541C13.8163 7.11326 12.8086 7.33546 11.7896 7.39834C10.9975 7.44755 10.111 7.4234 9.70688 7.14043M16.5887 5.44831L7.41144 18.5547"
                stroke="#E0E0E0"
                strokeWidth="1.33333"
              />
            </g>
            <defs>
              <clipPath id="clip0_4112_52364">
                <rect
                  width="16"
                  height="16"
                  fill="white"
                  transform="translate(23.1418 10.0352) rotate(125)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 w-full">
        {/* <div className="flex items-center gap-1 pl-1 pr-2 py-1 w-max bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full">
          <ProductTag productTag={props.productCategory} />
          <p className="text-textBlack text-xs">{props.paymentMode}</p>
        </div> */}
        <div className={`flex items-center gap-1 w-max`}>
          <img src={roletwo} alt="icon" />
          <span className="bg-[#EFF2FF] px-2 py-1 text-xs text-textBlack font-semibold rounded-full capitalize">
            {props.customer}
          </span>
        </div>
        <div className="flex items-center justify-between pl-2 py-1 pr-1 border-[0.6px] border-strokeGreyThree rounded-full">
          <p className="text-textGrey text-xs">Status</p>
          <p
            className={`px-2 py-0.5 text-xs font-medium ${
              props.contractSigned
                ? "bg-successTwo text-success"
                : "bg-[#FFEBEC] text-errorTwo"
            } rounded-full`}
          >
            {props.contractSigned ? "Signed" : "Not Signed"}
          </p>
        </div>
      </div>
    </div>
  );
};
