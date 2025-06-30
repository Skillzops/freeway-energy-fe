import React, { useState, useEffect, useCallback } from "react";
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
import { useApiCall } from "@/utils/useApiCall";
import PaymentModeSelector from "./PaymentModeSelector";

interface PaymentVerificationResponse {
  status?: string;
  message?: string;
  jobId?: string;
  paymentStatus?: "PENDING" | "INCOMPLETE" | "COMPLETED";
  amount?: number;
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
  const { apiCall } = useApiCall();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"ONLINE" | "CASH">("ONLINE");
  const [paymentAmount, setPaymentAmount] = useState<number | undefined>(undefined);

  const paymentInfo = SaleStore.paymentDetails;
  const handleFlutterPayment = useFlutterwave(paymentInfo as unknown as FlutterwaveConfig);

  // Handle cash payment
  const handleCashPayment = async () => {
    setIsSubmitting(true);
    try {
      // Create a fresh payload with current payment method
      const freshPayload = {
        ...payload,
        paymentMethod: paymentMode, // Use current payment method
      };
      
      console.log('Creating sale with fresh payload:', freshPayload);
      
      const saleResponse = await apiCall({
        endpoint: "/v1/sales/create",
        method: "post",
        data: freshPayload,
        successMessage: "Sale created successfully!",
      });

      console.log('Sale creation response:', saleResponse);

      if (saleResponse.data) {
        // Get the sale ID from the response
        const saleId = saleResponse.data.sale?.id;
        const totalAmount = saleResponse.data.paymentData?.amount;
        
        console.log('Extracted saleId:', saleId);
        console.log('Extracted total amount from API:', totalAmount);
        console.log('Full response data:', saleResponse.data);
        
        if (!saleId) {
          console.error('No sale ID found in response:', saleResponse);
          throw new Error("No sale ID received from sale creation");
        }

        if (!totalAmount) {
          console.error('No amount found in response:', saleResponse);
          throw new Error("No amount received from sale creation");
        }

        // Get the actual payment amount from the PaymentModeSelector (or use total if not set)
        const actualPaymentAmount = paymentAmount || totalAmount;
        
        console.log('Payment amount:', actualPaymentAmount);
        console.log('Total amount:', totalAmount);

        // Check if this is an installment payment - use paymentMode instead of installmentDuration
        const isInstallment = SaleStore.products.some(item => {
          const params = SaleStore.getParametersByProductId(item?.productId);
          return params?.paymentMode === "INSTALLMENT";
        });

        // Check if payment amount is less than total amount
        const isPartialPayment = actualPaymentAmount < totalAmount;

        console.log('Is installment payment:', isInstallment);
        console.log('Is partial payment:', isPartialPayment);

        // Determine payment status
        const paymentStatus = (isInstallment || isPartialPayment) ? "INCOMPLETE" : "COMPLETED";
        
        console.log('Payment status will be set to:', paymentStatus);

        // Then record the cash payment
        console.log('Recording cash payment with saleId:', saleId, 'and amount:', actualPaymentAmount);
        const paymentResponse = await apiCall({
          endpoint: "/v1/sales/record-cash-payment",
          method: "post",
          data: {
            saleId: String(saleId),
            paymentMethod: "CASH",
            amount: actualPaymentAmount,
            status: paymentStatus
          },
          successMessage: (isInstallment || isPartialPayment) ? "Initial payment recorded successfully!" : "Cash payment completed successfully!",
        });

        console.log('Cash payment response:', paymentResponse);

        if (paymentResponse.data) {
          toast.success((isInstallment || isPartialPayment) ? "Initial payment recorded successfully!" : "Cash payment completed successfully!");
          resetSaleModalState();
        }
      }
    } catch (error: any) {
      console.error("Error processing cash payment:", error);
      console.error("Error details:", {
        response: error.response?.data,
        status: error.response?.status,
        message: error.response?.data?.message
      });
      const errorMessage = error.response?.data?.message || 
                          (Array.isArray(error.response?.data?.message) ? 
                            error.response?.data?.message[0] : 
                            "Failed to process cash payment. Please try again.");
      setPaymentError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify payment with backend
  const verifyPayment = async (reference: string) => {
    try {
      console.log('Verifying payment with reference:', reference);

      const response = await apiCall({
        endpoint: `/v1/payment/verify/callback?txref=${reference}`,
        method: "get",
        showToast: false,
      }) as { data: PaymentVerificationResponse };

      console.log('Payment verification response:', response);

      if (response?.data?.status === "success" || 
          response?.data?.status === "processing") {
        if (response?.data?.paymentStatus === "COMPLETED") {
          // Check if this is an installment payment - use paymentMode instead of installmentDuration
          const isInstallment = SaleStore.products.some(item => {
            const params = SaleStore.getParametersByProductId(item?.productId);
            return params?.paymentMode === "INSTALLMENT";
          });

          // Get the total amount that should be paid (from store's calculation)
          const totalAmount = SaleStore.paymentDetails?.amount || 0;
          // Get the actual payment amount from Flutterwave response
          const actualPaymentAmount = response.data.amount || totalAmount;
          const isPartialPayment = actualPaymentAmount < totalAmount;

          console.log('Online payment - Total amount:', totalAmount);
          console.log('Online payment - Payment amount:', actualPaymentAmount);
          console.log('Online payment - Is installment:', isInstallment);
          console.log('Online payment - Is partial:', isPartialPayment);

          // Record the online payment completion
          try {
            const paymentResponse = await apiCall({
              endpoint: "/v1/sales/record-cash-payment",
              method: "post",
              data: {
                saleId: paymentInfo.metadata?.saleId,
                paymentMethod: "ONLINE",
                amount: actualPaymentAmount,
                status: (isInstallment || isPartialPayment) ? "INCOMPLETE" : "COMPLETED"
              },
              successMessage: (isInstallment || isPartialPayment) ? "Initial payment recorded successfully!" : "Payment recorded successfully!"
            });
            console.log('Payment record response:', paymentResponse);
          } catch (recordError) {
            console.error("Failed to record payment:", recordError);
            toast.error("Payment completed but failed to record. Please contact support.");
          }
          
          toast.success((isInstallment || isPartialPayment) ? "Initial payment completed successfully!" : "Payment completed successfully!");
        } else if (response?.data?.paymentStatus === "INCOMPLETE") {
          toast.warning("Payment verification shows incomplete status. Please complete the payment.");
        } else if (response?.data?.paymentStatus === "PENDING") {
          toast.info("Payment is still pending verification. Please wait for confirmation.");
        } else {
          toast.success(response?.data?.message || "Payment verification initiated successfully!");
        }
        
        resetSaleModalState();
        return true;
      } else {
        console.error("Payment verification failed - unexpected response:", response);
        throw new Error("Payment verification failed - invalid response");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);

      if (error?.response?.status === 404) {
        toast.error("Payment verification endpoint not found. Please contact support.");
      } else if (error?.response?.status === 500) {
        toast.error("Server error during payment verification. Please contact support.");
      } else if (error?.response?.data?.message) {
        toast.error(`Payment verification failed: ${error.response.data.message}`);
      } else {
        toast.error("Payment verification failed. Please contact support.");
      }

      return false;
    }
  };

  // Handle payment initialization
  const handlePayment = useCallback(() => {
    if (paymentMode === "CASH") {
      handleCashPayment();
      return;
    }

    if (paymentInfo === null) {
      setPaymentError("Payment details not found.");
      return;
    }
    setPaymentError(null);

    handleFlutterPayment({
      callback: async (response) => {
        console.log("Flutterwave Response:", response);
        setPaymentLoading(false);
        closePaymentModal();
        
        if (response.status === "successful" || response.status === "success") {
          const isVerified = await verifyPayment(response.reference || response.tx_ref || response.flw_ref);
          if (!isVerified) {
            setPaymentError("Payment completed but verification failed. Please contact support with reference: " + (response.transaction_id || response.tx_ref));
          }
        } else {
          toast.error("Payment failed. Please try again.");
          setPaymentError("Payment was not successful. Please try again.");
        }
      },
      onClose: () => {
        setPaymentLoading(false);
        toast.info("Payment was cancelled");
      },
    });
  }, [paymentInfo, paymentMode, handleFlutterPayment, verifyPayment]);

  // Clear errors when payment info changes
  useEffect(() => {
    if (paymentInfo) {
      setPaymentError(null);
    }
  }, [paymentInfo]);

  return (
    <>
      {!SaleStore.paymentDetails.reference ? (
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
                  value={String(item.productTag)}
                />
                <ProductDetailRow
                  label="Product Name"
                  value={String(item.productName)}
                />
                <ProductDetailRow
                  label="Product Units"
                  value={String(item.productUnits)}
                />
                <ProductDetailRow
                  label="Product Price"
                  value={String(item.productPrice)}
                />

                <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                  {Object.entries(params || {}).map(([key, value], index) =>
                    !value ? null : (
                      <ProductDetailRow
                        key={key}
                        label={paramList[index]}
                        value={String(
                          paramList[index] === "Discount" 
                            ? `${value}%`
                            : paramList[index] === "Initial Deposit"
                              ? formatNumberWithCommas(value)
                              : value >= 1 
                                ? formatNumberWithCommas(value) 
                                : value
                        )}
                        showNaira={paramList[index] === "Initial Deposit"}
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
                          value={String(formatNumberWithCommas(cost))}
                          showNaira={true}
                        />
                      )
                    )}
                  </div>
                )}

                <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                  <ProductDetailRow
                    label="Recipient Name"
                    value={String(`${recipient?.firstname ?? ''} ${recipient?.lastname ?? ''}`)}
                  />
                  <ProductDetailRow
                    label="Recipient Address"
                    value={String(recipient?.address ?? '')}
                  />
                </div>
              </div>
            );
          })}

          <PaymentModeSelector
            value={paymentMode}
            onChange={(val) => setPaymentMode(val as "ONLINE" | "CASH")}
            saleId={SaleStore.paymentDetails?.metadata?.saleId}
            amount={paymentAmount}
            onAmountChange={(newAmount) => {
              setPaymentAmount(newAmount);
              // Update the payment amount in the store
              if (SaleStore.paymentDetails) {
                SaleStore.paymentDetails.amount = newAmount;
              }
            }}
          />

          {apiErrorMessage}
          {paymentError && (
            <div className="p-3 mt-4 border border-red-500 rounded-md bg-red-50">
              <p className="text-red-600 text-sm">{paymentError}</p>
            </div>
          )}

          <ProceedButton
            type="submit"
            loading={isSubmitting || loading}
            variant={getIsFormFilled() ? "gradient" : "gray"}
            disabled={!getIsFormFilled()}
            onClick={handlePayment}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={creditcardicon} alt="Settings Icon" /> PAYMENT DETAILS
            </p>
            <div className="flex items-center justify-between">
              <Tag name="Customer Email" />
              <div className="text-xs font-bold text-textDarkGrey">
                <NameTag name={paymentInfo?.email || "N/A"} />
              </div>
            </div>
            <ProductDetailRow
              label="Payment Amount"
              value={String(formatNumberWithCommas(paymentInfo?.amount || 0))}
            />
            <ProductDetailRow
              label="Payment Currency"
              value={paymentInfo?.currency || ""}
            />
            <ProductDetailRow
              label="Payment Reference"
              value={String(paymentInfo?.reference || "")}
            />
          </div>

          {paymentError && (
            <div className="p-3 mt-4 border border-red-500 rounded-md bg-red-50">
              <p className="text-red-600 text-sm">{paymentError}</p>
            </div>
          )}

          <ProceedButton
            type="button"
            onClick={handlePayment}
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
