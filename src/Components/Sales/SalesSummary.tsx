import React, { useState, useEffect, useCallback } from "react";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import settingsicon from "../../assets/settings.svg";
import producticon from "../../assets/product-grey.svg";
import { SaleStore } from "@/stores/SaleStore";
import { Tag } from "../Products/ProductDetails";
import { NairaSymbol, NameTag } from "../CardComponents/CardComponent";
import { ProductDetailRow } from "./ProductSaleDisplay";
import { IoReturnUpBack } from "react-icons/io5";
import { formatNumberWithCommas } from "@/utils/helpers";
import { toast } from "react-toastify";
import { useApiCall } from "@/utils/useApiCall";
import PaymentModeSelector from "./PaymentModeSelector";
import { useFlutterwave } from "flutterwave-react-v3";
import { FlutterwaveConfig } from "flutterwave-react-v3/dist/types";

// Flutterwave configuration
const public_key =
  import.meta.env.VITE_FLW_PUBLIC_KEY ||
  "FLWPUBK_TEST-720d3bd8434091e9b28a01452ebdd2e0-X";
const base_url = import.meta.env.VITE_API_BASE_URL;

// Payment types

interface SalePayload {
  paymentMethod: "CASH" | "ONLINE";
  [key: string]: any;
}

interface SaleResponse {
  sale?: {
    id: string | number;
  };
  paymentData?: {
  amount: number;
  tx_ref: string;
  transaction_id: string;
  };
}

interface PaymentVerificationResponse {
  status?: string;
  message?: string;
  jobId?: string;
  paymentStatus?: "PENDING" | "INCOMPLETE" | "COMPLETED"
}

interface SalesSummaryProps {
  setSummaryState: React.Dispatch<React.SetStateAction<boolean>>;
  resetSaleModalState: () => void;
  loading: boolean;
  getIsFormFilled: () => boolean;
  apiErrorMessage: React.ReactNode;
  payload: SalePayload;
  refreshTable?: () => Promise<any>;
}

const SalesSummary: React.FC<SalesSummaryProps> = ({
  setSummaryState,
  resetSaleModalState,
  loading,
  getIsFormFilled,
  apiErrorMessage,
  payload,
  refreshTable,
}) => {
  const { apiCall } = useApiCall();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Remove unused paymentConfig state
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  const paymentInfo = SaleStore.paymentDetails;

  // Helper function to determine if payment is installment
  const isInstallmentPayment = useCallback(() => {
    return SaleStore.products.some(item => {
      const params = SaleStore.getParametersByProductId(item?.productId);
      return params?.paymentMode === "INSTALLMENT";
    });
  }, []);



  // Helper function to calculate total initial deposit (including miscellaneous costs)
  const getTotalInitialDeposit = useCallback(() => {
    console.log('=== getTotalInitialDeposit Debug ===');
    console.log('SaleStore.products:', SaleStore.products);
    
    return SaleStore.products.reduce((total, product) => {
      console.log('Processing product:', product);
      const params = SaleStore.getParametersByProductId(product.productId);
      console.log('Product params:', params);
      
      if (params?.paymentMode === "INSTALLMENT") {
        const installmentStartingPrice = params.installmentStartingPrice || 0;
        console.log('installmentStartingPrice:', installmentStartingPrice);
        
        // Get miscellaneous costs for this product
        const miscPrices = SaleStore.getMiscellaneousByProductId(product.productId);
        const miscellaneousCosts = miscPrices ? 
          Array.from(miscPrices.costs.entries()).reduce((sum, [, cost]) => sum + cost, 0) : 0;
        console.log('miscellaneousCosts:', miscellaneousCosts);
        
        const productTotal = installmentStartingPrice + miscellaneousCosts;
        console.log('productTotal for', product.productId, ':', productTotal);
        
        return total + productTotal;
      }
      return total;
    }, 0);
  }, []);

  // Create sale for both cash and online payments
  const createSale = async (): Promise<{ saleId: string; totalAmount: number; tx_ref: string }> => {
    const freshPayload = {
      ...payload,
      paymentMethod: SaleStore.paymentMethod,
    };

    console.log('Creating sale with payload:', freshPayload);
    console.log('Payment method in payload:', freshPayload.paymentMethod);
    console.log('=== Payment Amount Debug ===');
    console.log('isInstallmentPayment():', isInstallmentPayment());
    console.log('getTotalInitialDeposit():', getTotalInitialDeposit());
    console.log('SaleStore.getTotal():', SaleStore.getTotal());
    console.log('Amount being sent to backend:', isInstallmentPayment() ? getTotalInitialDeposit() : SaleStore.getTotal());
    console.log('=== End Payment Amount Debug ===');

    const saleResponse = await apiCall({
      endpoint: "/v1/sales/create",
      method: "post",
      data: freshPayload,
      successMessage: "Sale created successfully!",
    });

    console.log('Sale creation response:', saleResponse);
    console.log('Sale creation response data:', saleResponse?.data);

    if (!saleResponse?.data) {
      throw new Error("No response data received from sale creation");
    }

    const saleData = saleResponse.data as SaleResponse;
    const saleId = saleData.sale?.id;
    const totalAmount = saleData.paymentData?.amount;
    const tx_ref = saleData.paymentData?.tx_ref;

    console.log('Extracted sale data:', { saleId, totalAmount, tx_ref });

    if (!saleId) {
      console.error('No sale ID found in response:', saleResponse);
      throw new Error("No sale ID received from sale creation");
    }

    if (!totalAmount) {
      console.error('No amount found in response:', saleResponse);
      throw new Error("No amount received from sale creation");
    }

    if (!tx_ref) {
      console.error('No tx_ref found in response:', saleResponse);
      throw new Error("No tx_ref received from sale creation");
    }

    return {
      saleId: String(saleId),
      totalAmount,
      tx_ref
    };
  };



  // Record cash payment for existing sale
  const recordCashPayment = async (saleId: string, amount: number, notes: string = "") => {
    console.log('Recording cash payment:', { saleId, amount, notes });

    const paymentResponse = await apiCall({
      endpoint: "/v1/sales/record-cash-payment",
      method: "post",
      data: {
        saleId,
        amount,
        notes,
        status: "COMPLETED" // Always use COMPLETED for cash payments
      },
      showToast: false,
    });

    console.log('Cash payment record response:', paymentResponse);
    return paymentResponse;
  };



  // Handle payment initialization
  const handlePayment = useCallback(async () => {
    setPaymentError(null);
    setIsSubmitting(true);


    try {
      if (SaleStore.paymentMethod === "CASH") {
        // Step 1: Create the sale first (will be PENDING)
        console.log('Creating sale for cash payment...');
        const { saleId, totalAmount } = await createSale();
        
        // Step 2: Record cash payment with COMPLETED status
        console.log('Recording cash payment...');
        const notes = paymentNotes || `Cash payment of ₦${formatNumberWithCommas(totalAmount)}`;

        await recordCashPayment(
          saleId,
          SaleStore?.paymentDetails?.amount || totalAmount,
          notes
        );

        // Refresh table data to show updated status
        if (refreshTable) {
          try {
            console.log('Refreshing table data after cash payment...');
            await refreshTable();
            console.log('Table data refreshed successfully after cash payment');
          } catch (refreshError) {
            console.error('Failed to refresh table data after cash payment:', refreshError);
          }
        }

        toast.success("Cash payment completed successfully!");
        resetSaleModalState();
      } else {
        // Handle online payment with Flutterwave
        if (!SaleStore.customer?.email) {
          throw new Error("Customer email is required for online payment. Please update customer details.");
        }

        // Create sale first for online payments
        console.log('Creating sale for online payment...');
        const { saleId, totalAmount, tx_ref } = await createSale();
        
        const paymentAmount = totalAmount;
        
        console.log('Initiating Flutterwave payment:', { saleId, paymentAmount, tx_ref });

        // Use Flutterwave hook with configuration
        const flutterwaveConfig: FlutterwaveConfig = {
          public_key,
          tx_ref,
          amount: paymentAmount,
          currency: "NGN",
          redirect_url: `${window.location.origin}/sales`,
          payment_options: "banktransfer, card, ussd, account",
          customer: {
            email: SaleStore.customer.email,
            name: SaleStore.customer.customerName || "",
            phone_number: SaleStore.customer.phone || "",
          },
          customizations: {
            title: "Product Purchase",
            description: `Payment for sale ${saleId}`,
            logo: "https://res.cloudinary.com/bluebberies/image/upload/v1726242207/Screenshot_2024-09-04_at_2.43.01_PM_fcjlf3.png",
          },
          meta: {
            saleId: saleId,
          },
        };

        const handleFlutterPayment = useFlutterwave(flutterwaveConfig);

        handleFlutterPayment({
          callback: async (response: any) => {
            console.log("Flutterwave payment response:", response);
            console.log("Calling verifyPayment with:", {
              tx_ref: response.tx_ref,
              transaction_id: response.transaction_id
            });
            if (response.status === "successful") {
              // Pass both tx_ref and transaction_id for verification
              const isVerified = await verifyPayment(String(response.tx_ref), response.transaction_id);
              if (!isVerified) {
                setPaymentError("Payment completed but verification failed. Please contact support with reference: " + String(response.tx_ref));
              }
            } else {
              toast.error("Payment failed. Please try again.");
              setPaymentError("Payment was not successful. Please try again.");
            }
          },
          onClose: () => {
            toast.info("Payment was cancelled");
          },
        });
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      const errorMessage = error.response?.data?.message ||
        (Array.isArray(error.response?.data?.message) ?
          error.response?.data?.message[0] :
          error.message ||
          "Failed to process payment. Please try again.");
      setPaymentError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  }, [createSale, recordCashPayment, refreshTable, resetSaleModalState, paymentNotes]);

  // Clear errors when payment info changes
  useEffect(() => {
    if (paymentInfo) {
      setPaymentError(null);
    }
  }, [paymentInfo]);

  // Verify payment with backend (EXACTLY like SaleTransactions)
  const verifyPayment = async (tx_ref: string, transaction_id?: string) => {
    try {
      console.log('Verifying payment with tx_ref:', tx_ref, 'transaction_id:', transaction_id);
      let endpoint = `/v1/payment/verify/callback?tx_ref=${tx_ref}`;
      if (transaction_id) {
        endpoint += `&transaction_id=${transaction_id}`;
      }
      console.log("Verification endpoint:", endpoint);
      const response = await apiCall({
        endpoint,
        method: "get",
        showToast: false,
      }) as { data: PaymentVerificationResponse };
      console.log('Payment verification response:', response);
      if (response?.data?.status === "successful" ||
        response?.data?.status === "processing") {
        if (response?.data?.paymentStatus === "COMPLETED") {
          toast.success("Payment completed successfully!");
        } else if (response?.data?.paymentStatus === "INCOMPLETE") {
          toast.warning("Payment is incomplete. Please complete the payment.");
        } else if (response?.data?.paymentStatus === "PENDING") {
          toast.info("Payment is pending verification.");
        }
        setTimeout(() => {
          window.location.reload();
        }, 1500);
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

  // Remove old unused initialization code

  // Display error from local state
  const displayError = paymentError;

  return (
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
                  {/* Show parameters based on payment mode */}
                  <ProductDetailRow
                    label="Payment Mode"
                    value={params?.paymentMode === "ONE_OFF" ? "Single Deposit" : "Installment"}
                  />
                  {params?.paymentMode === "INSTALLMENT" && (
                    <>
                      <ProductDetailRow
                        label="Number of Installments"
                        value={formatNumberWithCommas(params?.installmentDuration)}
                      />
                      <ProductDetailRow
                        label="Initial Deposit"
                        value={formatNumberWithCommas(params?.installmentStartingPrice)}
                        showNaira={true}
                      />
                    </>
                  )}
                  {(params?.discount || 0) > 0 && (
                    <ProductDetailRow
                      label="Discount"
                      value={`${params?.discount}%`}
                      />
                  )}
                </div>

                {miscCostsExist && (
                  <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                    {Array.from(miscellaneousCosts.entries()).map(
                      ([name, cost]) => (
                        <ProductDetailRow
                          key={`${index}-${name}`}
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
                    value={`${recipient?.firstname || ''} ${recipient?.lastname || ''}`.trim()}
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
            value={SaleStore.paymentMethod as "CASH" | "ONLINE"}
            onChange={(value) => {
              SaleStore.setPaymentMethod(value as "CASH" | "ONLINE");
            }}
            saleId={SaleStore.paymentDetails?.metadata?.saleId}
            // Use initial deposit for installment, otherwise use total
            amount={isInstallmentPayment() ? getTotalInitialDeposit() : SaleStore.getTotal()}
            onAmountChange={(newAmount) => {
              // if (SaleStore.paymentDetails) {
              //   SaleStore.paymentDetails.amount = newAmount;
              // }
              SaleStore.addPaymentDetails({
                ...SaleStore.paymentDetails,
                amount: newAmount,
              });
            }}
            onNotesChange={(notes: string) => {
              setPaymentNotes(notes);
            }}
          />

          {/* Display error messages */}
          {displayError && (
            <div className="flex flex-col w-full p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">Payment Error</p>
              <p className="text-red-500 text-xs mt-1">{displayError}</p>
            </div>
          )}

          {apiErrorMessage}

          {/* Payment Summary */}
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={settingsicon} alt="Settings Icon" /> PAYMENT SUMMARY
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textDarkGrey">Payment Method:</span>
              <span className="text-sm font-medium text-textBlack">
                {SaleStore.paymentMethod === "ONLINE" ? "Online Payment (Flutterwave)" : "Cash Payment"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textDarkGrey">
                {isInstallmentPayment() ? "Initial Deposit:" : "Total Amount:"}
              </span>
              <div className="flex items-center gap-1">
                <NairaSymbol />
                <span className="text-sm font-bold text-textBlack">
                  {formatNumberWithCommas(isInstallmentPayment() ? getTotalInitialDeposit() : SaleStore.getTotal())}
                </span>
              </div>
            </div>
            {SaleStore.paymentMethod === "ONLINE" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-textDarkGrey">Customer Email:</span>
                <span className="text-sm font-medium text-textBlack">
                  {SaleStore.customer?.email || "Not provided"}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-textDarkGrey font-medium">
              {SaleStore.paymentMethod === "ONLINE" 
                ? "Click to proceed to secure payment" 
                : "Click to complete sale with cash payment"
              }
            </p>
            <ProceedButton
              type="submit"
              loading={isSubmitting || loading}
              variant={getIsFormFilled() ? "gradient" : "gray"}
              disabled={!getIsFormFilled() || isSubmitting}
              onClick={handlePayment}
            />
          </div>
    </>
  );
};

export default SalesSummary;
