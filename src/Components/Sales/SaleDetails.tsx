import { Tag } from "../Products/ProductDetails";
import { SaleDetailsType } from "./SalesDetailsModal";
import producticon from "../../assets/product-grey.svg";
import {
  NairaSymbol,
  NameTag,
  ProductTag,
} from "../CardComponents/CardComponent";
import { formatDateTime, formatNumberWithCommas } from "@/utils/helpers";
import customericon from "../../assets/customers/customericon.svg";
import creditcardicon from "../../assets/creditcardgrey.svg";

type InstallmentAccountDetails = {
  id: string;
  flw_ref: string;
  order_ref: string;
  account_number: string;
  account_status: string;
  frequency: number;
  bank_name: string;
  expiry_date: string;
  note: string;
  amount: string;
  createdAt: string;
};

const SaleDetails = ({ data }: { data: SaleDetailsType }) => {
  const iDetails: InstallmentAccountDetails =
    data?.sale?.installmentAccountDetails;

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex items-center justify-between h-[44px] p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-full">
        <Tag name="Sale ID" />
        <p className="text-textDarkGrey text-xs font-bold">{data.saleId}</p>
      </div>

      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={producticon} alt="Product Icon" /> PRODUCT DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Product Image" />
          <div className="flex items-center justify-center w-full p-2 max-w-[100px] h-[100px] gap-2 border-[0.6px] border-strokeCream rounded-full overflow-clip">
            <img
              src={data.image}
              alt="Product Image"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Product Category" />
          <ProductTag productTag={data.productCategory} />
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Product Name" />
          <p className="text-xs font-bold text-textDarkGrey">
            {data.productName}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Payment Mode" />
          <div className="flex items-center justify-center gap-1 bg-[#F6F8FA] px-2 py-1 w-max border-[0.4px] border-strokeGreyTwo rounded-full">
            <p className="text-xs text-textDarkGrey font-semibold">
              {data.paymentMode}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Quantity" />
          <p className="text-textDarkGrey text-xs font-bold">
            {formatNumberWithCommas(data.productQuantity)}
          </p>
        </div>
      </div>

      {data?.paymentMode === "INSTALLMENT" && (
        <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
            <img src={creditcardicon} alt="Card Icon" /> INSTALLMENT DETAILS
          </p>
          <div className="flex items-center justify-between">
            <Tag name="Total Price" />
            <div className="flex items-center justify-end w-max gap-1">
              <NairaSymbol />
              <p className="text-xs font-bold text-textDarkGrey">
                {formatNumberWithCommas(data.installmentData.totalPrice)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Total Paid" />
            <div className="flex items-center justify-end w-max gap-1">
              <NairaSymbol />
              <p className="text-xs font-bold text-textDarkGrey">
                {formatNumberWithCommas(data.installmentData.totalPaid)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Total Monthly Payment" />
            <div className="flex items-center justify-end w-max gap-1">
              <NairaSymbol />
              <p className="text-xs font-bold text-textDarkGrey">
                {formatNumberWithCommas(
                  data.installmentData.totalMonthlyPayment
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Installment Starting Price" />
            <div className="flex items-center justify-end w-max gap-1">
              <NairaSymbol />
              <p className="text-xs font-bold text-textDarkGrey">
                {formatNumberWithCommas(
                  data.installmentData.installmentStartingPrice
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Total Installment Duration" />
            <p className="text-xs font-bold text-textDarkGrey">
              {data.installmentData.totalInstallmentDuration} Months
            </p>
          </div>
        </div>
      )}

      {data?.paymentMode === "INSTALLMENT" && iDetails && (
        <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
            <img src={creditcardicon} alt="Card Icon" /> INSTALLMENT ACCOUNT
            DETAILS
          </p>
          <div className="flex items-center justify-between">
            <Tag name="Account Number" />
            <p className="text-xs font-bold text-textDarkGrey">
              {iDetails.account_number}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Bank Name" />
            <p className="text-xs font-bold text-textDarkGrey">
              {iDetails.bank_name}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Account Status" />
            <p className="text-xs font-bold text-textDarkGrey">
              {iDetails.account_status}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Frequency" />
            <p className="text-xs font-bold text-textDarkGrey">
              {iDetails.frequency}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Expiry Date" />
            <p className="text-xs font-bold text-textDarkGrey">
              {iDetails.expiry_date}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Amount" />
            <div className="flex items-center justify-end w-max gap-1">
              <NairaSymbol />
              <p className="text-xs font-bold text-textDarkGrey">
                {formatNumberWithCommas(iDetails.amount)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Created At" />
            <p className="text-xs font-bold text-textDarkGrey">
              {formatDateTime("date", iDetails.createdAt)}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Customer Icon" /> CUSTOMER DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Customer" />
          <p className="text-xs font-bold text-textDarkGrey">{data.customer}</p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Installation Address" />
          <p className="text-xs font-bold text-textDarkGrey">{data.address}</p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Phone Number" />
          <p className="text-xs font-bold text-textDarkGrey">{data.phone}</p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Email Address" />
          <p className="text-xs font-bold text-textDarkGrey">{data.email}</p>
        </div>
      </div>

      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={creditcardicon} alt="Card Icon" /> GENERAL DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Date Created" />
          <p className="text-xs font-bold text-textDarkGrey">
            {formatDateTime("date", data.datetime)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Time Created" />
          <p className="text-xs font-bold text-textDarkGrey">
            {formatDateTime("time", data.datetime)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Agent" />
          <NameTag name={data.agent} />
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;
