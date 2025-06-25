import React, { useState } from "react";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import settingsicon from "../../assets/settings.svg";
import producticon from "../../assets/product-grey.svg";
import { SaleStore } from "@/stores/SaleStore";
import { Tag } from "../Products/ProductDetails";
import { NameTag } from "../CardComponents/CardComponent";
import { ProductDetailRow } from "./ProductSaleDisplay";
import { IoReturnUpBack } from "react-icons/io5";
import { formatNumberWithCommas } from "@/utils/helpers";
import creditcardicon from "../../assets/creditcardgrey.svg";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { FlutterwaveConfig } from "flutterwave-react-v3/dist/types";
import { toast } from "react-toastify";

const SalesSummary = ({
  setSummaryState,
  resetSaleModalState,
  loading,
  getIsFormFilled,
  apiErrorMessage,
}: {
  setSummaryState: React.Dispatch<React.SetStateAction<boolean>>;
  resetSaleModalState: () => void;
  loading: boolean;
  getIsFormFilled: () => boolean;
  apiErrorMessage: React.ReactNode;
}) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const paymentInfo = SaleStore.paymentDetails;
  const handleFlutterPayment = useFlutterwave(paymentInfo as FlutterwaveConfig);

  const initializePayment = () => {
    if (paymentInfo === null) {
      setPaymentError("Payment details not found.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    handleFlutterPayment({
      callback: (response) => {
        console.log("Flutterwave Response:", response);
        setPaymentLoading(false);
        closePaymentModal();
        toast.success("Payment Successful");
      },
      onClose: () => {
        setPaymentLoading(false);
        resetSaleModalState();
        toast.info("Payment Cancelled");
      },
    });
  };

  return (
    <>
      {!SaleStore.paymentDetails.tx_ref ? (
        <>
          <div className="flex w-full">
            <p
              className="flex gap-1 items-center text-xs font-bold text-textDarkGrey cursor-pointer hover:underline"
              onClick={() => setSummaryState(false)}
            >
              <IoReturnUpBack />
              Back to form
            </p>
          </div>
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={settingsicon} alt="Settings Icon" /> GENERAL DETAILS
            </p>
            <ProductDetailRow
              label="Sale Category"
              value={SaleStore.category}
            />
            <div className="flex items-center justify-between">
              <Tag name="Customer" />
              <div className="text-xs font-bold text-textDarkGrey">
                <NameTag name={SaleStore.customer?.customerName} />
              </div>
            </div>
          </div>
          {SaleStore.products.map((item, index) => {
            const params = SaleStore.getParametersByProductId(item?.productId);
            const paramList = [
              "Payment Mode",
              "Number of Installments",
              "Initial Deposit",
              "Discount",
            ];
            const recipient = SaleStore.getRecipientByProductId(
              item?.productId
            );
            const miscellaneousCosts = SaleStore.getMiscellaneousByProductId(
              item?.productId
            ).costs;
            const miscCostsExist = Object.keys(miscellaneousCosts).length >= 1;

            return (
              <div
                key={index}
                className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]"
              >
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                  <img src={producticon} alt="Product Icon" /> PRODUCT{" "}
                  {index + 1}
                </p>

                <ProductDetailRow
                  label="Product Category"
                  value={item.productTag}
                />
                <ProductDetailRow
                  label="Product Name"
                  value={item.productName}
                />
                <ProductDetailRow
                  label="Product Units"
                  value={item.productUnits}
                />
                <ProductDetailRow
                  label="Product Price"
                  value={item.productPrice}
                />

                <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                  {Object.entries(params || {}).map(([key, value], index) =>
                    !value ? null : (
                      <ProductDetailRow
                        key={key}
                        label={paramList[index]}
                        value={
                          value >= 1 ? formatNumberWithCommas(value) : value
                        }
                        showNaira={Boolean(value >= 2)}
                      />
                    )
                  )}
                </div>

                {!miscCostsExist ? null : (
                  <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                    {Array.from(miscellaneousCosts.entries()).map(
                      ([name, cost]) => (
                        <ProductDetailRow
                          key={index}
                          label={name}
                          value={formatNumberWithCommas(cost)}
                          showNaira={true}
                        />
                      )
                    )}
                  </div>
                )}

                <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                  <ProductDetailRow
                    label="Recipient Name"
                    value={`${recipient?.firstname} ${recipient?.lastname}`}
                  />
                  <ProductDetailRow
                    label="Recipient Address"
                    value={recipient?.address as string}
                  />
                </div>
              </div>
            );
          })}

          {apiErrorMessage}

          <ProceedButton
            type="submit"
            loading={loading}
            variant={getIsFormFilled() ? "gradient" : "gray"}
            disabled={!getIsFormFilled()}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={creditcardicon} alt="Settings Icon" /> PAYMENT DETAILS
            </p>
            <div className="flex items-center justify-between">
              <Tag name="Customer Name" />
              <div className="text-xs font-bold text-textDarkGrey">
                <NameTag name={paymentInfo?.customer?.email || "N/A"} />
              </div>
            </div>
            <ProductDetailRow
              label="Payment Amount"
              value={formatNumberWithCommas(paymentInfo?.amount || 0)}
            />
            <ProductDetailRow
              label="Payment Currency"
              value={paymentInfo?.currency || ""}
            />
            <ProductDetailRow
              label="Payment Description"
              value={paymentInfo?.customizations?.description || ""}
            />
          </div>

          {paymentError && (
            <div className="p-3 mt-4 border border-red-500 rounded-md bg-red-50">
              <p className="text-red-600 text-sm">{paymentError}</p>
            </div>
          )}

          <ProceedButton
            type="button"
            onClick={initializePayment}
            loading={paymentLoading}
            variant="gradient"
            disabled={paymentLoading}
          />
        </>
      )}
    </>
  );
};

export default SalesSummary;
