import { CardComponent } from "../CardComponents/CardComponent";
import { SaleTransactionsType } from "./SalesDetailsModal";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import { useFlutterwave } from "flutterwave-react-v3";
import { useApiCall } from "@/utils/useApiCall";
import PaymentModeSelector from "./PaymentModeSelector";
import { formatNumberWithCommas } from "@/utils/helpers";
import { NairaSymbol } from "../CardComponents/CardComponent";

type PaymentInfo = {
  id: string;
  transactionRef: string;
  amount: number;
  paymentStatus: "PENDING" | "INCOMPLETE" | "COMPLETED";
  paymentDate: string;
  saleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

interface PaymentVerificationResponse {
  status?: string;
  message?: string;
  jobId?: string;
  paymentStatus?: "PENDING" | "INCOMPLETE" | "COMPLETED"
}

interface PaymentSummaryProps {
  totalAmount: number;
  totalPaid: number;
  remainingBalance: number;
  paymentProgress: number;
  isInstallment: boolean;
  totalInstallments?: number;
  paymentsMade?: number;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  totalAmount,
  totalPaid,
  remainingBalance,
  paymentProgress,
  isInstallment,
  totalInstallments = 0,
  paymentsMade = 0
}) => {
  if (!isInstallment) return null;

  // Calculate installment progress
  const installmentProgress = totalInstallments > 0 ? (paymentsMade / totalInstallments) * 100 : 0;
  const remainingInstallments = Math.max(totalInstallments - paymentsMade, 0);

  return (
    <div className="flex flex-col p-4 gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Progress</h3>
      
      {/* Progress Bar - Now based on installment count */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className="bg-gradient-to-r from-gold to-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(installmentProgress, 100)}%` }}
        ></div>
      </div>

      {/* Installment Progress Display */}
      <div className="flex justify-between items-center mb-3 p-2 bg-white rounded-lg border">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Installments Made</p>
          <span className="text-lg font-bold text-green-600">{paymentsMade}</span>
        </div>
        <div className="text-gray-400 text-xl">/</div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Required</p>
          <span className="text-lg font-bold text-gray-700">{totalInstallments}</span>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Remaining</p>
          <span className="text-lg font-bold text-red-600">{remainingInstallments}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Total Amount */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
          <div className="flex items-center justify-center gap-1">
            <NairaSymbol color="#374151" />
            <span className="text-sm font-bold text-gray-700">
              {formatNumberWithCommas(totalAmount)}
            </span>
          </div>
        </div>

        {/* Amount Paid */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
          <div className="flex items-center justify-center gap-1">
            <NairaSymbol color="#059669" />
            <span className="text-sm font-bold text-green-600">
              {formatNumberWithCommas(totalPaid)}
            </span>
          </div>
        </div>

        {/* Balance Remaining */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Balance</p>
          <div className="flex items-center justify-center gap-1">
            <NairaSymbol color="#DC2626" />
            <span className="text-sm font-bold text-red-600">
              {formatNumberWithCommas(remainingBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Percentage - Now based on installments */}
      <div className="text-center mt-2">
        <span className="text-xs text-gray-600">
          {installmentProgress.toFixed(1)}% of Installments Completed
        </span>
      </div>
    </div>
  );
};

const public_key =
  import.meta.env.VITE_FLW_PUBLIC_KEY ||
  "FLWPUBK_TEST-720d3bd8434091e9b28a01452ebdd2e0-X";

const SaleTransactions = ({
  data,
  saleData,
}: {
  data: {
    entries: SaleTransactionsType[];
    paymentInfo: PaymentInfo[];
    customer: {
      name: string;
      phone_number: any;
      email: any;
    };
  };
  saleData?: {
    totalPrice: number;
    totalPaid: number;
    paymentMode: string;
    totalInstallments?: number;
    paymentsMade?: number;
  };
}) => {
  const { apiCall } = useApiCall();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState<boolean>(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("ONLINE");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Calculate payment summary data
  const calculatePaymentSummary = () => {
    const isInstallment = saleData?.paymentMode === "INSTALLMENT";
    const totalAmount = saleData?.totalPrice || 0;
    const totalPaid = saleData?.totalPaid || 0;
    const remainingBalance = Math.max(totalAmount - totalPaid, 0);
    const paymentProgress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

    const result = {
      totalAmount,
      totalPaid,
      remainingBalance,
      paymentProgress,
      isInstallment,
      totalInstallments: saleData?.totalInstallments,
      paymentsMade: saleData?.paymentsMade
    };

    console.log('=== calculatePaymentSummary result ===');
    console.log('result:', result);
    console.log('saleData?.totalInstallments:', saleData?.totalInstallments);
    console.log('=== End ===');

    return result;
  };

  const paymentSummary = calculatePaymentSummary();

  // Update payment amount based on remaining balance for installments
  useEffect(() => {
    if (selectedPaymentId && paymentSummary.isInstallment) {
      // For installments, default to remaining balance or minimum payment
      const suggestedAmount = Math.min(paymentSummary.remainingBalance, paymentSummary.totalAmount * 0.1); // 10% minimum or remaining balance
      setPaymentAmount(suggestedAmount > 0 ? suggestedAmount : 0);
    }
  }, [selectedPaymentId, paymentSummary.remainingBalance, paymentSummary.isInstallment]);

  // Verify payment with backend
  const verifyPayment = async (tx_ref: string, transaction_id?: string) => {
    try {
      console.log('Verifying payment with tx_ref:', tx_ref, 'transaction_id:', transaction_id);

      // Build the endpoint with required parameters
      let endpoint = `/v1/payment/verify/callback?tx_ref=${tx_ref}`;
      if (transaction_id) {
        endpoint += `&transaction_id=${transaction_id}`;
      }

      const response = await apiCall({
        endpoint,
        method: "get",
        showToast: false,
      }) as { data: PaymentVerificationResponse };

      console.log('Payment verification response:', response);

      // Check for successful verification or processing status
      if (response?.data?.status === "successful" ||
        response?.data?.status === "processing") {

        // If payment status is COMPLETED, show success message
        if (response?.data?.paymentStatus === "COMPLETED") {
          toast.success("Payment completed successfully!");
        }
        // If payment status is INCOMPLETE, show incomplete payment message
        else if (response?.data?.paymentStatus === "INCOMPLETE") {
          toast.warning("Payment is incomplete. Please complete the payment.");
        }
        // If payment status is PENDING, show pending message
        else if (response?.data?.paymentStatus === "PENDING") {
          toast.info("Payment is pending verification.");
        }

        // Add delay to ensure backend data is updated before refresh
        setTimeout(() => {
          window.location.reload();
        }, 1500); // 1.5 second delay
        return true;
      } else {
        console.error("Payment verification failed - unexpected response:", response);
        throw new Error("Payment verification failed - invalid response");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);

      // More detailed error handling
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

  const handlePayment = useCallback((paymentId: string) => {
    const selectedPaymentData = data?.paymentInfo?.find(
      (p) => p.id === paymentId
    );

    if (!selectedPaymentData) {
      setPaymentError("Payment information not found.");
      return;
    }

    if (!data.customer.email) {
      setPaymentError("Customer email is required for payment.");
      return;
    }

    if (!selectedPaymentData.amount || selectedPaymentData.amount <= 0) {
      setPaymentError("Invalid payment amount.");
      return;
    }

    setPaymentError(null);

    // Use Flutterwave hook with configuration
    const handleFlutterPayment = useFlutterwave({
      public_key,
      tx_ref: selectedPaymentData.transactionRef,
      amount: selectedPaymentData.amount,
      currency: "NGN",
      redirect_url: `${window.location.origin}/sales`,
      payment_options: "banktransfer, card, ussd, account",
      customer: {
        email: data.customer.email,
        name: data.customer.name,
        phone_number: data.customer.phone_number,
      },
      customizations: {
        title: "Product Purchase",
        description: `Payment for sale ${selectedPaymentData.saleId}`,
        logo: "https://res.cloudinary.com/bluebberies/image/upload/v1726242207/Screenshot_2024-09-04_at_2.43.01_PM_fcjlf3.png",
      },
      meta: {
        saleId: selectedPaymentData.saleId,
      },
    });

    handleFlutterPayment({
      callback: async (response: any) => {
        console.log("Flutterwave payment response:", response);
        
        if (response.status === "successful") {
          // Pass both tx_ref and transaction_id for verification
          const isVerified = await verifyPayment(response.tx_ref, response.transaction_id);
          if (!isVerified) {
            setPaymentError("Payment completed but verification failed. Please contact support with reference: " + response.tx_ref);
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
  }, [data, verifyPayment]);

  const handleCompletePayment = async (paymentId: string) => {
    const selectedPaymentData = data?.paymentInfo?.find(
      (p) => p.id === paymentId
    );

    if (!selectedPaymentData) {
      setPaymentError("Payment information not found.");
      return;
    }

    // Show payment mode selector for user to choose payment method
    setSelectedPaymentId(paymentId);

    // Set default payment amount based on payment type
    if (paymentSummary.isInstallment) {
      // For installments, use the full remaining balance for "Complete Payment"
      setPaymentAmount(paymentSummary.remainingBalance);
    } else {
      // For non-installments, use the original payment amount
      setPaymentAmount(selectedPaymentData.amount);
    }

    setShowPaymentSelector(true);
  };

  const handleCashPayment = async () => {
    if (!selectedPaymentId || !paymentAmount) {
      setPaymentError("Payment information missing.");
      return;
    }

    const selectedPaymentData = data?.paymentInfo?.find(
      (p) => p.id === selectedPaymentId
    );

    if (!selectedPaymentData) {
      setPaymentError("Payment information not found.");
      return;
    }

    // Validate payment amount for installments
    if (paymentSummary.isInstallment) {
      if (paymentAmount > paymentSummary.remainingBalance) {
        setPaymentError(`Payment amount cannot exceed remaining balance of ₦${formatNumberWithCommas(paymentSummary.remainingBalance)}`);
        return;
      }
      if (paymentAmount <= 0) {
        setPaymentError("Payment amount must be greater than zero.");
        return;
      }
    }

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      // Calculate new totals after this payment
      const newTotalPaid = paymentSummary.totalPaid + paymentAmount;
      const newRemainingBalance = paymentSummary.totalAmount - newTotalPaid;

      // For installments, check if this will be the final installment
      const totalInstallments = saleData?.totalInstallments || 0;
      const currentPaymentsMade = saleData?.paymentsMade || 0;
      const newPaymentsMade = currentPaymentsMade + 1;

      // Determine if payment is complete based on installment count (for installments) or amount (for one-off)
      const isFullyPaid = paymentSummary.isInstallment
        ? (newPaymentsMade >= totalInstallments)
        : (newRemainingBalance <= 0);

      const response = await apiCall({
        endpoint: "/v1/sales/record-cash-payment",
        method: "post",
        data: {
          saleId: selectedPaymentData.saleId,
          paymentMethod: "CASH",
          amount: paymentAmount,
          status: isFullyPaid ? "COMPLETED" : "INCOMPLETE",
          // Additional tracking data
          totalPaid: newTotalPaid,
          remainingBalance: Math.max(newRemainingBalance, 0),
          paymentNote: `Installment payment - ${isFullyPaid ? 'Final payment' : `₦${formatNumberWithCommas(Math.max(newRemainingBalance, 0))} remaining`}`
        },
        successMessage: isFullyPaid
          ? `🎉 Congratulations! All ${totalInstallments} installments completed!`
          : `✅ Installment ${newPaymentsMade}/${totalInstallments} recorded! ${totalInstallments - newPaymentsMade} remaining.`,
      });

      if (response?.data) {
        toast.success(isFullyPaid
          ? `🎉 Congratulations! All ${totalInstallments} installments completed!`
          : `✅ Installment ${newPaymentsMade}/${totalInstallments} recorded! ${totalInstallments - newPaymentsMade} remaining.`
        );
        setShowPaymentSelector(false);
        setSelectedPaymentId(null);
        // Add delay to ensure backend data is updated before refresh
        setTimeout(() => {
          window.location.reload();
        }, 1500); // 1.5 second delay
      }
    } catch (error: any) {
      console.error("Error processing cash payment:", error);
      const errorMessage = error?.response?.data?.message || "Failed to process cash payment. Please try again.";
      setPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOnlinePayment = () => {
    if (!selectedPaymentId) {
      setPaymentError("Payment information missing.");
      return;
    }

    // Close the payment selector and trigger online payment
    setShowPaymentSelector(false);
    handlePayment(selectedPaymentId);
  };

  const handlePaymentMethodSubmit = () => {
    if (paymentMethod === "CASH") {
      handleCashPayment();
    } else {
      handleOnlinePayment();
    }
  };

  const getDropdownItems = (paymentStatus: string) => {
    // For installment payments with remaining balance, always show Complete Payment
    if (paymentSummary.isInstallment && paymentSummary.remainingBalance > 0) {
      switch (paymentStatus) {
        case "PENDING":
          return ["Make Payment", "Complete Payment"];
        case "INCOMPLETE":
          return ["Complete Payment"];
        case "COMPLETED":
          return ["Complete Payment"]; // Still show Complete Payment if installment has remaining balance
        default:
          return ["Make Payment", "Complete Payment"];
      }
    }
    
    // For non-installment payments, use original logic
    switch (paymentStatus) {
      case "PENDING":
        return ["Make Payment"];
      case "INCOMPLETE":
        return ["Complete Payment"];
      case "COMPLETED":
        return []; // No actions for completed payments
      default:
        return ["Make Payment"];
    }
  };

  const getDropDownList = (paymentStatus: string) => ({
    items: getDropdownItems(paymentStatus),
    onClickLink: (index: number, cardData: any) => {
      const items = getDropdownItems(paymentStatus);
      const action = items[index];



      switch (action) {
        case "Make Payment":
          handlePayment(cardData?.productId);
          break;
        case "Complete Payment":
          handleCompletePayment(cardData?.productId);
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  });


  // Display error if any
  const displayError = paymentError;

  return (
    <div className="flex flex-col gap-4">
      {displayError && (
        <div className="p-3 border border-red-500 rounded-md bg-red-50">
          <p className="text-red-600 text-sm">{displayError}</p>
        </div>
      )}

      {/* Payment Summary for Installments */}
      <PaymentSummary {...paymentSummary} />

      {showPaymentSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Complete Payment</h3>

            {/* Show remaining balance for installments */}
            {paymentSummary.isInstallment && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Remaining Balance:</span>
                  <div className="flex items-center gap-1 font-semibold text-dark-700">
                    <NairaSymbol />
                    <span>{formatNumberWithCommas(paymentSummary.remainingBalance)}</span>
                  </div>
                </div>
              </div>
            )}

            <PaymentModeSelector
              value={paymentMethod}
              onChange={(value) => setPaymentMethod(value as "ONLINE" | "CASH")}
              amount={paymentAmount}
              onAmountChange={setPaymentAmount}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPaymentSelector(false);
                  setSelectedPaymentId(null);
                  setPaymentError(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isProcessingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentMethodSubmit}
                disabled={isProcessingPayment || !paymentAmount || (paymentSummary.isInstallment && paymentAmount > paymentSummary.remainingBalance)}
                className="flex-1 px-4 py-2 bg-primaryGradient text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment
                  ? "Processing..."
                  : paymentMethod === "CASH"
                    ? "Record Cash Payment"
                    : "Pay Online"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {data?.entries?.map((item, index) => {
          // Calculate effective status for installment payments
          const getEffectiveStatus = () => {
            if (paymentSummary.isInstallment) {
              // For installments, show overall payment status based on remaining balance
              if (paymentSummary.remainingBalance <= 0) {
                return "COMPLETED";
              } else if (paymentSummary.totalPaid > 0) {
                return "INCOMPLETE";
              } else {
                return "PENDING";
              }
            }
            // For non-installments, use original status
            return item?.paymentStatus;
          };

          const effectiveStatus = getEffectiveStatus();

          return (
            <CardComponent
              key={index}
              variant="salesTransactions"
              transactionId={item?.transactionId}
              productId={item?.transactionId}
              transactionStatus={effectiveStatus}
              datetime={item?.datetime}
              productType={item?.productCategory}
              productTag={item?.paymentMode}
              transactionAmount={item?.amount}
              dropDownList={getDropDownList(item?.paymentStatus)}
              showDropdown={
                item?.paymentStatus !== "COMPLETED" || 
                (paymentSummary.isInstallment && paymentSummary.remainingBalance > 0)
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default SaleTransactions;
