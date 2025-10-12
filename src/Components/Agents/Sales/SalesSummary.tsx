import React, { useState } from "react";
import settingsicon from "../../assets/settings.svg";
import producticon from "../../assets/product-grey.svg";
import { SaleStore } from "@/stores/SaleStore";
import { NameTag } from "../CardComponents/CardComponent";
import { ProductDetailRow } from "./ProductSaleDisplay";
import { IoReturnUpBack } from "react-icons/io5";
import { formatNumberWithCommas } from "@/utils/helpers";
import creditcardicon from "../../assets/creditcardgrey.svg";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { FlutterwaveConfig } from "flutterwave-react-v3/dist/types";
import { toast } from "react-toastify";
import { useApiCall } from "@/utils/useApiCall";
import PaymentModeSelector from "./PaymentModeSelector";
import ProceedButton from "@/Components/ProceedButtonComponent/ProceedButtonComponent";
import { Tag } from "@/Components/Products/ProductDetails";

// Types for sale creation
interface SaleResponse {
  sale?: {
    id: string;
  };
  paymentData?: {
    amount: number;
    tx_ref: string;
  };
}

const SalesSummary = ({
  setSummaryState,
  resetSaleModalState,
  loading,
  getIsFormFilled,
  apiErrorMessage,
  payload,
}: {
  setSummaryState: React.Dispatch<React.SetStateAction<boolean>>;
  resetSaleModalState: () => void;
  loading: boolean;
  getIsFormFilled: () => boolean;
  apiErrorMessage: React.ReactNode;
  payload: any;
}) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { apiCall } = useApiCall();

  const paymentInfo = SaleStore.paymentDetails;
  const handleFlutterPayment = useFlutterwave(paymentInfo as FlutterwaveConfig);

  // Helper functions for payment calculations
  const isInstallmentPayment = () => {
    return SaleStore.products.some(product => {
      const params = SaleStore.getParametersByProductId(product.productId);
      return params?.paymentMode === "INSTALLMENT";
    });
  };

  const getTotalInitialDeposit = () => {
    return SaleStore.products.reduce((total, product) => {
      const params = SaleStore.getParametersByProductId(product.productId);
      if (params?.paymentMode === "INSTALLMENT") {
        return total + (params.installmentStartingPrice || 0);
      }
      return total;
    }, 0);
  };

  const getTotalAmount = () => {
    return SaleStore.products.reduce((total, product) => {
      return total + (Number(product.productPrice) * Number(product.productUnits));
    }, 0);
  };

  // Create sale for both cash and online payments
  const createSale = async (): Promise<{
    saleId: string;
    totalAmount: number;
    tx_ref: string;
    paymentData: any;
  }> => {
    const freshPayload = {
      ...payload,
      paymentMethod: SaleStore.paymentMethod,
    };

    const saleResponse = await apiCall({
      endpoint: "/v1/agents/create-sale",
      method: "post",
      data: freshPayload,
      successMessage: "Sale created successfully!",
    });

    console.log("Sale creation response:", saleResponse);
    console.log("Sale creation response data:", saleResponse?.data);

    if (!saleResponse?.data) {
      throw new Error("No response data received from sale creation");
    }

    const saleData = saleResponse.data;
    
    // Handle different possible response structures
    let saleId, totalAmount, tx_ref, paymentData;
    
    if (saleData.sale?.id) {
      // Structure: { sale: { id: ... }, paymentData: { ... } }
      saleId = saleData.sale.id;
      totalAmount = saleData.paymentData?.amount;
      paymentData = saleData.paymentData;
      tx_ref = saleData.paymentData?.tx_ref;
    } else if (saleData.id) {
      // Structure: { id: ..., amount: ..., tx_ref: ... }
      saleId = saleData.id;
      totalAmount = saleData.amount || paymentInfo?.amount;
      tx_ref = saleData.tx_ref || `sale_${Date.now()}_${saleId}`;
      paymentData = saleData;
    } else {
      // Fallback: use what we can find
      saleId = saleData.saleId || saleData._id || Date.now().toString();
      totalAmount = saleData.totalAmount || saleData.amount || paymentInfo?.amount;
      tx_ref = saleData.tx_ref || saleData.transactionRef || `sale_${Date.now()}_${saleId}`;
      paymentData = saleData;
    }

    console.log("Parsed sale data:", { saleId, totalAmount, tx_ref });

    if (!saleId) {
      throw new Error("No sale ID received from sale creation");
    }

    if (!totalAmount) {
      console.warn("No amount received from sale creation, using payment info amount");
      totalAmount = paymentInfo?.amount || 0;
    }

    if (!tx_ref) {
      console.warn("No tx_ref received from sale creation, generating one");
      tx_ref = `sale_${Date.now()}_${saleId}`;
    }

    return {
      saleId: String(saleId),
      totalAmount,
      tx_ref,
      paymentData,
    };
  };

  const initializePayment = async () => {
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      // Step 1: Create the sale first
      const saleData = await createSale();

      // Step 2: Handle payment based on method

      // Step 3: For online payments, proceed with gateway
      if (paymentInfo === null) {
        setPaymentError("Payment details not found.");
        setPaymentLoading(false);
        return;
      }

      // Update payment info with sale data (keep original amount)
      const updatedPaymentInfo = {
        ...paymentInfo,
        amount: paymentInfo.amount, // Keep the original calculated amount
        tx_ref: saleData.tx_ref,
      };

      // Step 4: Initialize payment gateway based on selection
      if (SaleStore.paymentGateway === "FLUTTERWAVE") {
        const handleUpdatedFlutterPayment = useFlutterwave(updatedPaymentInfo as FlutterwaveConfig);
        
        // FLUTTERWAVE gateway - just refresh the page after sale creation
        setPaymentLoading(false);
        toast.success("Sale created successfully!");
        resetSaleModalState();
        window.location.reload();
      } else {
        // OGARANYA gateway - just refresh the page after sale creation
        setPaymentLoading(false);
        toast.success("Sale created successfully!");
        resetSaleModalState();
        window.location.reload();
      }

    } catch (error) {
      console.error("Error creating sale:", error);
      setPaymentLoading(false);
      setPaymentError(error instanceof Error ? error.message : "Failed to create sale");
    }
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

          <PaymentModeSelector
            value={SaleStore.paymentMethod}
            onChange={(method: string) => {
              SaleStore.setPaymentMethod(method as "ONLINE");
            }}
          />

          {/* Payment Summary */}
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={creditcardicon} alt="Payment Icon" /> PAYMENT SUMMARY
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textDarkGrey">Payment Method:</span>
              <span className="text-sm font-medium text-textBlack">
                Wallet Payment
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textDarkGrey">
                {isInstallmentPayment() ? "Initial Deposit:" : "Total Amount:"}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-textBlack">
                  ₦{formatNumberWithCommas(
                    isInstallmentPayment()
                      ? getTotalInitialDeposit()
                      : getTotalAmount()
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textDarkGrey">Customer Email:</span>
              <span className="text-sm font-medium text-textBlack">
                {SaleStore.customer?.email || "Not provided"}
              </span>
            </div>
          </div>

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
                <NameTag name={paymentInfo?.customer?.name || SaleStore.customer?.customerName || "N/A"} />
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

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-textDarkGrey">
              Pay with Wallet
            </p>
            <ProceedButton
              type="button"
              onClick={initializePayment}
              loading={paymentLoading}
              variant="gradient"
              disabled={paymentLoading}
            />
          </div>
        </>
      )}
    </>
  );
};

export default SalesSummary;
