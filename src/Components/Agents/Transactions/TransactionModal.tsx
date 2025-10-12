import React from "react";
import { KeyedMutator } from "swr";
import { Modal } from "../ModalComponent/Modal";
import { DropDown } from "../DropDownComponent/DropDown";
import { GoDotFill } from "react-icons/go";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import { Tag } from "../Products/ProductDetails";
import { NairaSymbol, ProductTag } from "../CardComponents/CardComponent";
import customericon from "../../assets/customers/customericon.svg";
import creditcardicon from "../../assets/creditcardgrey.svg";
import { formatDateTime, formatNumberWithCommas } from "@/utils/helpers";
import producticon from "../../assets/product-grey.svg";
import { useApiCall } from "@/utils/useApiCall";
import { toast } from "react-toastify";

type TransactionDetailType = {
  status: string;
  transactionId: string;
  amount: number;
  productCategory: string;
  productType: string;
  productName: string;
  productId: string;
  datetime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

const TransactionModal = ({
  isOpen,
  setIsOpen,
  transactionID,
  refreshTable,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  transactionID: string;
  refreshTable: KeyedMutator<any>;
}) => {
  const { apiCall } = useApiCall();

  // const fetchSingleTransaction = useGetRequest(
  //   `/v1/transactions/single/${transactionID}`,
  //   false
  // );

  // const generateTransactionEntries = (data?: any): TransactionDetailType => {
  const generateTransactionEntries = (): TransactionDetailType => {
    return {
      status: "completed",
      transactionId: transactionID,
      amount: 24000,
      productCategory: "SHS",
      productType: "INSTALMENT",
      productName: "Product One",
      productId: "12DFFBJHWRRJ23",
      datetime: "2024-12-23T12:34:56",
      customerName: "John Bull",
      customerEmail: "johnbull@gmail.com",
      customerPhone: "08142243923",
    };
  };

  const data = generateTransactionEntries();

  const processReversal = async () => {
    const confirmation = prompt(
      `Are you sure you want to reverse transaction with ID "${data?.transactionId}"? This action is irreversible! Enter "Yes" or "No".`,
      "No"
    );

    if (confirmation?.trim()?.toLowerCase() === "yes") {
      toast.info(`Reversing transaction ${data?.transactionId}`);
      apiCall({
        endpoint: "/v1/transactions/reverse",
        method: "post",
        data: { id: transactionID },
        successMessage: "Transaction reversed successfully!",
      })
        .then(async () => {
          await refreshTable();
        })
        .catch((error: any) => console.error(error));
    }
  };

  const dropDownList = {
    items: ["Process a Reversal"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          processReversal();
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  return (
    <Modal
      layout="right"
      bodyStyle="pb-44 overflow-auto"
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
      leftHeaderComponents={
        <p
          className={`flex items-center justify-center gap-1 bg-[#F6F8FA] w-max px-2 py-1 text-xs ${data?.status.toLowerCase() === "completed"
            ? "text-success"
            : "text-errorTwo"
            } border-[0.4px] border-strokeGreyTwo rounded-full uppercase`}
        >
          <GoDotFill />
          {data?.status}
        </p>
      }
      leftHeaderContainerClass="pl-2"
    >
      <div className="bg-white">
        <header
          className={`flex items-center ${transactionID ? "justify-between" : "justify-end"
            } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
        >
          {!transactionID ? null : (
            <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
              {transactionID}
            </p>
          )}
          <DropDown {...dropDownList} />
        </header>
        <div className="flex flex-col w-full gap-4 px-4 py-2">
          <DataStateWrapper
            isLoading={false}
            error={""}
            errorStates={{
              errorStates: [
                {
                  endpoint: "",
                  errorExists: false,
                  errorCount: 0,
                  toastShown: false,
                },
              ],
              isNetworkError: false,
              isPermissionError: false,
            }}
            refreshData={() => Promise.resolve()}
            errorMessage="Failed to fetch transaction details"
          >
            <div className="flex flex-col w-full gap-4">
              <div className="flex items-center justify-between h-[44px] p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-full">
                <Tag name="Transaction ID" />
                <p className="text-textDarkGrey text-xs font-bold">
                  {data.transactionId}
                </p>
              </div>

              <div className="flex items-center justify-between h-[44px] p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-full">
                <Tag name="Amount" />
                <div className="flex items-center justify-end w-max gap-1">
                  <NairaSymbol />
                  <p className="text-textDarkGrey text-xs font-bold">
                    {formatNumberWithCommas(data.amount)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                  <img src={producticon} alt="Product Icon" /> PRODUCT DETAILS
                </p>
                <div className="flex items-center justify-between">
                  <Tag name="Product Category" />
                  <ProductTag productTag={data.productCategory} />
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Product Type" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {data.productType}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Product Name" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {data.productName}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Product ID" />
                  <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
                    {data.productId}
                  </p>
                </div>
              </div>

              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                  <img src={creditcardicon} alt="Card Icon" /> GENERAL DETAILS
                </p>
                <div className="flex items-center justify-between">
                  <Tag name="Date" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {formatDateTime("date", data.datetime)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Time" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {formatDateTime("time", data.datetime)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                  <img src={customericon} alt="Customer Icon" /> CUSTOMER
                  DETAILS
                </p>
                <div className="flex items-center justify-between">
                  <Tag name="Name" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {data.customerName}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Email" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {data.customerEmail}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Phone Number" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {data.customerPhone}
                  </p>
                </div>
              </div>
            </div>
          </DataStateWrapper>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionModal;
