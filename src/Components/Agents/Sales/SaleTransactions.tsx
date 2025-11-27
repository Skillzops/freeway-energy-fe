import { CardComponent } from "../CardComponents/CardComponent";
import { SaleTransactionsType } from "./SalesDetailsModal";
import { useCallback, useEffect, useState } from "react";
import PaymentModeSelector from "./PaymentModeSelector";
import { NairaSymbol } from "../CardComponents/CardComponent";
import PayNextPayment from "./PayNextPayment";
import { formatNumberWithCommas } from "@/utils/helpers";
import { useApiCall } from "@/utils/useApiCall";
import settingsicon from "@/assets/settings.svg";
import { toast } from "react-toastify";


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
  paymentStatus?: "PENDING" | "INCOMPLETE" | "COMPLETED";
}

interface PaymentSummaryProps {
  totalAmount: number;
  totalPaid: number;
  remainingBalance: number;
  isInstallment: boolean;
  totalInstallments?: number;
  remainingInstallments?: number;
  paymentsMade?: number;
  paymentProgress?: number;
  onPayNextPayment?: () => void;
  totalMonthlyPayment?: number;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  totalAmount,
  totalPaid,
  remainingBalance,
  isInstallment,
  totalInstallments = 0,
  remainingInstallments = 0,
  paymentsMade = 0,
  paymentProgress = 0,
  onPayNextPayment,
  totalMonthlyPayment,

}) => {

  if (!isInstallment) return null;

  const installmentProgress =
    totalInstallments > 0 ? (paymentsMade / totalInstallments) * 100 : 0;
 

  const payNextAmountRaw =
    typeof totalMonthlyPayment === "number" && !Number.isNaN(totalMonthlyPayment)
      ? Math.min(remainingBalance, totalMonthlyPayment)
      : Math.min(remainingBalance, 6000);

      


  // const payNextAmountDisplay = Math.ceil(payNextAmountRaw);

  const payNextAmountDisplay = remainingBalance == 0 ? 0: totalMonthlyPayment

  return (
    <div className="flex flex-col p-4 gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mb-4">
      <h3 className="text-sm font-bold text-gray-700 mb-2">Payment Progress</h3>

      <div className="w-full bg-gray-200 rounded-full h-1 mb-3">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${totalPaid > totalAmount
            ? "bg-gradient-to-r from-green-500 to-green-600"
            : "bg-gradient-to-r from-gold to-primary"
            }`}
          style={{ width: `${Math.min(paymentProgress, 100)}%` }}
        ></div>
        {totalPaid > totalAmount && (
          <div className="w-full bg-yellow-200 rounded-full h-0.5 mt-1">
            <div
              className="bg-yellow-500 h-0.5 rounded-full"
              style={{
                width: `${Math.min(
                  ((totalPaid - totalAmount) / totalAmount) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        )}
      </div>

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
              {formatNumberWithCommas(totalAmount.toString())}
            </span>
          </div>
        </div>

        {/* Amount Paid */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Installment Amount Paid</p>
          <div className="flex items-center justify-center gap-1">
            <NairaSymbol color="#059669" />
            <span className="text-sm font-bold text-green-600">
              {formatNumberWithCommas(totalPaid.toString())}
            </span>
          </div>
        </div>

        {/* Balance Remaining */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Balance</p>
          <div className="flex items-center justify-center gap-1">
            <NairaSymbol color={remainingBalance > 0 ? "#DC2626" : "#059669"} />
            <span
              className={`text-sm font-bold ${remainingBalance > 0 ? "text-red-600" : "text-green-600"
                }`}
            >
              {remainingBalance > 0
                ? formatNumberWithCommas(remainingBalance.toString())
                : "Fully Paid"}
            </span>
          </div>
          {/* Overpayment Warning */}
          {totalPaid > totalAmount && (
            <div className="mt-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
              Overpaid: ₦{formatNumberWithCommas((totalPaid - totalAmount).toString())}
            </div>
          )}
          {/* Pay Next Payment Button - Small button directly under balance */}
          {remainingBalance > 0 && onPayNextPayment && (
            <button
              onClick={onPayNextPayment}
              className="mt-2 px-3 py-1 text-xs bg-primaryGradient text-white rounded-md hover:bg-primary-dark transition-colors font-medium"
            >
              {/* === CHANGED: show totalMonthlyPayment on the button === */}
              Pay Next - ₦{formatNumberWithCommas(payNextAmountDisplay.toString())}
            </button>
          )}
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

// const public_key =
//   import.meta.env.VITE_FLW_PUBLIC_KEY ||
//   "FLWPUBK_TEST-720d3bd8434091e9b28a01452ebdd2e0-X";

const SaleTransactions = ({
  data,
  saleData,
  refreshTable,
  refreshSingleSale,
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
    remainingInstallments?: number;
    paymentsMade?: number;
    paymentProgress?: number;
    miscellaneousCost?: number;
    totalMonthlyPayment?: number;
  };
  refreshTable?: () => Promise<any>;
  refreshSingleSale?: () => Promise<any>;

}) => {


  console.log(saleData, "hhhhhh", data);

  const { apiCall } = useApiCall();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] =
    useState<boolean>(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">(
    "ONLINE"
  );
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [showPayNextPayment, setShowPayNextPayment] = useState<boolean>(false);
  const [nextPaymentData, setNextPaymentData] = useState<{
    saleId: string;
    suggestedAmount: number;
  } | null>(null);

  // Calculate payment summary data
  const calculatePaymentSummary = () => {
    const isInstallment = saleData?.paymentMode === "INSTALLMENT";
    const totalAmount = saleData?.totalPrice || 0;

    // Calculate total paid and payments made from completed payment transactions
    const completedPayments =
      data?.paymentInfo?.filter(
        (payment) => payment.paymentStatus === "COMPLETED"
      ) || [];
    const totalPaid = saleData?.totalPaid || 0;
    // const totalPaid = completedPayments.reduce(
    //   (sum, payment) => sum + payment.amount,
    //   0
    // );

    // Calculate payments made - if fully paid, show total installments, otherwise show actual completed payments
    let paymentsMade = completedPayments.length ;
    const totalInstallments = saleData?.totalInstallments || 0;
    
    const remainingInstallments = saleData?.remainingInstallments || 0;

    // For installment payments, the progress should be based on the full amount
    // but we need to handle the display correctly
    const displayTotalAmount = totalAmount;

    // If the sale is fully paid (totalPaid >= totalAmount), show all installments as completed
    if (totalPaid >= totalAmount && totalInstallments > 0) {
      paymentsMade = totalInstallments;
    }

    const remainingBalance = Math.max(displayTotalAmount - totalPaid, 0);

    const remainingBalanceT = remainingBalance == 0 ? 0: saleData?.totalMonthlyPayment

    const paymentProgress =
      displayTotalAmount > 0 ? (totalPaid / displayTotalAmount) * 100 : 0;

    const suggestedAmount = remainingBalanceT;

    return {
      totalAmount: displayTotalAmount,
      totalPaid,
      remainingBalance,
      suggestedAmount,
      isInstallment,
      totalInstallments,
      remainingInstallments,
      paymentsMade: paymentsMade,
      paymentProgress,
      /** surface monthly payment into summary for the child component */
      totalMonthlyPayment: saleData?.totalMonthlyPayment,
    };
  };

  const paymentSummary = calculatePaymentSummary();


  // Update payment amount based on remaining balance for installments
  useEffect(() => {
    if (selectedPaymentId && paymentSummary.isInstallment) {
      // For installments, default to remaining balance or minimum payment
      const suggestedAmount = Math.min(
        paymentSummary.remainingBalance,
        paymentSummary.totalAmount * 0.1
      ); // 10% minimum or remaining balance
      setPaymentAmount(suggestedAmount > 0 ? suggestedAmount : 0);
    }
  }, [
    selectedPaymentId,
    paymentSummary.remainingBalance,
    paymentSummary.isInstallment,
    paymentSummary.totalAmount,
  ]);

  // Verify payment with backend
  // const verifyPayment = async (tx_ref: string, transaction_id?: string) => {
  //   try {
  //     // Build the endpoint with required parameters
  //     let endpoint = `/v1/payment/verify/callback?tx_ref=${tx_ref}`;
  //     if (transaction_id) {
  //       endpoint += `&transaction_id=${transaction_id}`;
  //     }
  //
  //     const response = (await apiCall({
  //       endpoint,
  //       method: "get",
  //       showToast: false,
  //     })) as { data: PaymentVerificationResponse };
  //
  //     // Check for successful verification or processing status
  //     if (
  //       response?.data?.status === "successful" ||
  //       response?.data?.status === "processing"
  //     ) {
  //       // If payment status is COMPLETED, show success message
  //       if (response?.data?.paymentStatus === "COMPLETED") {
  //         toast.success("Payment completed successfully!");
  //       }
  //       // If payment status is INCOMPLETE, show incomplete payment message
  //       else if (response?.data?.paymentStatus === "INCOMPLETE") {
  //         toast.warning("Payment is incomplete. Please complete the payment.");
  //       }
  //       // If payment status is PENDING, show pending message
  //       else if (response?.data?.paymentStatus === "PENDING") {
  //         toast.info("Payment is pending verification.");
  //       }
  //
  //       // Refresh the data instead of reloading the page
  //       if (refreshTable) {
  //         await refreshTable();
  //       }
  //       if (refreshSingleSale) {
  //         await refreshSingleSale();
  //       }
  //       return true;
  //     } else {
  //       console.error(
  //         "Payment verification failed - unexpected response:",
  //         response
  //       );
  //       throw new Error("Payment verification failed - invalid response");
  //     }
  //   } catch (error: any) {
  //     console.error("Payment verification error:", error);
  //
  //     // More detailed error handling
  //     if (error?.response?.status === 404) {
  //       toast.error(
  //         "Payment verification endpoint not found. Please contact support."
  //       );
  //     } else if (error?.response?.status === 500) {
  //       toast.error(
  //         "Server error during payment verification. Please contact support."
  //       );
  //     } else if (error?.response?.data?.message) {
  //       toast.error(
  //         `Payment verification failed: ${error.response.data.message}`
  //       );
  //     } else {
  //       toast.error("Payment verification failed. Please contact support.");
  //     }
  //
  //     return false;
  //   }
  // };

  // const handlePayment = useCallback((paymentId: string) => {
  //   const selectedPaymentData = data?.paymentInfo?.find(
  //     (p) => p.id === paymentId
  //   );
  //
  //   if (!selectedPaymentData) {
  //     setPaymentError("Payment information not found.");
  //     return;
  //   }
  //
  //   if (!data.customer.email) {
  //     setPaymentError("Customer email is required for payment.");
  //     return;
  //   }
  //
  //   if (!selectedPaymentData.amount || selectedPaymentData.amount <= 0) {
  //     setPaymentError("Invalid payment amount.");
  //     return;
  //   }
  //
  //   setPaymentError(null);
  //
  //   // Use Flutterwave hook with configuration
  //   const handleFlutterPayment = useFlutterwave({
  //     public_key,
  //     tx_ref: selectedPaymentData.transactionRef,
  //     amount: selectedPaymentData.amount,
  //     currency: "NGN",
  //     redirect_url: `${window.location.origin}/sales`,
  //     payment_options: "banktransfer, card, ussd, account",
  //     customer: {
  //       email: data.customer.email,
  //       name: data.customer.name,
  //       phone_number: data.customer.phone_number,
  //     },
  //     customizations: {
  //       title: "Product Purchase",
  //       description: `Payment for sale ${selectedPaymentData.saleId}`,
  //       logo: "https://res.cloudinary.com/bluebberies/image/upload/v1726242207/Screenshot_2024-09-04_at_2.43.01_PM_fcjlf3.png",
  //     },
  //     meta: {
  //       saleId: selectedPaymentData.saleId,
  //     },
  //   });
  //
  //   handleFlutterPayment({
  //     callback: async (response: any) => {
  //
  //
  //       if (response.status === "successful") {
  //         // Pass both tx_ref and transaction_id for verification
  //         const isVerified = await verifyPayment(response.tx_ref, response.transaction_id);
  //         if (!isVerified) {
  //           setPaymentError("Payment completed but verification failed. Please contact support with reference: " + response.tx_ref);
  //         }
  //       } else {
  //         toast.error("Payment failed. Please try again.");
  //         setPaymentError("Payment was not successful. Please try again.");
  //       }
  //     },
  //     onClose: () => {
  //       toast.info("Payment was cancelled");
  //     },
  //   });
  // }, [data, verifyPayment]);

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

    // Set default payment amount
    // For "Pay Next Payment", suggest a reasonable installment amount
    if (paymentSummary.remainingBalance > 0) {
      const suggestedAmount = Math.min(
        selectedPaymentData.amount,
        paymentSummary.remainingBalance
      );
      setPaymentAmount(suggestedAmount);
    } else {
      setPaymentAmount(selectedPaymentData.amount);
    }

    setShowPaymentSelector(true);
  };

  const handlePayNextPayment = (paymentId: string) => {
    const selectedPaymentData = data?.paymentInfo?.find(
      (p) => p.id === paymentId
    );

    if (!selectedPaymentData) {
      setPaymentError("Payment information not found.");
      return;
    }

    // Set up next payment data
    const suggestedAmount = Math.min(
      selectedPaymentData.amount,
      paymentSummary.remainingBalance
    );

    setNextPaymentData({
      saleId: selectedPaymentData.saleId,
      suggestedAmount: paymentSummary?.suggestedAmount,
    });

    setShowPayNextPayment(true);
  };

  const handleNextPaymentSuccess = async () => {
    // Refresh the data after successful payment
    if (refreshTable) {
      await refreshTable();
    }
    if (refreshSingleSale) {
      await refreshSingleSale();
    }
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

    // Validate payment amount
    if (paymentAmount <= 0) {
      setPaymentError("Payment amount must be greater than zero.");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      const response = await apiCall({
        endpoint: "/v1/sales/record-cash-payment",
        method: "post",
        data: {
          saleId: selectedPaymentData.saleId,
          paymentMethod: "CASH",
          amount: paymentAmount,
          status: "COMPLETED", // Mark this individual payment as completed
          paymentNote: `Cash payment of ₦${formatNumberWithCommas(
            paymentAmount.toString()
          )}`,
        },
        successMessage: `✅ Payment of ₦${formatNumberWithCommas(
          paymentAmount.toString()
        )} recorded successfully!`,
      });

      if (response?.data) {
        toast.success(
          `✅ Payment of ₦${formatNumberWithCommas(
            paymentAmount.toString()
          )} recorded successfully!`
        );
        setShowPaymentSelector(false);
        setSelectedPaymentId(null);

        // Refresh the data instead of reloading the page
        if (refreshTable) {
          await refreshTable();
        }
        if (refreshSingleSale) {
          await refreshSingleSale();
        }
      }
    } catch (error: any) {
      console.error("Error processing cash payment:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to process cash payment. Please try again.";
      setPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOnlinePayment = (paymentId: string) => {
    if (!selectedPaymentId) {
      setPaymentError("Payment information missing.");
      return;
    }

    // Close the payment selector and trigger online payment
    setShowPaymentSelector(false);
    handleOnlinePayment(paymentId);
  };

  const handlePaymentMethodSubmit = () => {
    if (paymentMethod === "CASH") {
      handleCashPayment();
    } else {
      handleOnlinePayment(selectedPaymentId as string);
    }
  };

  const getDropdownItems = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PENDING":
        return ["Make Payment", "Pay Next Payment"];
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
          handleOnlinePayment(cardData?.productId);
          break;
        case "Complete Payment":
          handleCompletePayment(cardData?.productId);
          break;
        case "Pay Next Payment":
          handlePayNextPayment(cardData?.productId);
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
      <PaymentSummary
        {...paymentSummary}
        totalMonthlyPayment={saleData?.totalMonthlyPayment}
        onPayNextPayment={() => {
          // Set up next payment data with suggested amount
          const suggestedAmount = Math.min(
            paymentSummary.remainingBalance,
            6000 // Standard ₦6,000 or remaining balance if less
          );



          setNextPaymentData({
            saleId: data?.paymentInfo?.[0]?.saleId || "",
            suggestedAmount: paymentSummary?.suggestedAmount,
          });
          setShowPayNextPayment(true);
        }}
      />

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
                    <span>
                      {formatNumberWithCommas(
                        paymentSummary.remainingBalance.toString()
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <PaymentModeSelector
              value={paymentMethod}
              onChange={(value) =>
                setPaymentMethod(value as "ONLINE" | "CASH")
              }
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
                disabled={
                  isProcessingPayment ||
                  !paymentAmount ||
                  (paymentSummary.isInstallment &&
                    paymentAmount > paymentSummary.remainingBalance)
                }
                className="flex-1 px-4 py-2 bg-primaryGradient text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment
                  ? "Processing..."
                  : paymentMethod === "CASH"
                    ? "Record Cash Payment"
                    : "Pay Online"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Miscellaneous Cost Display - match installation details style */}
      <div className="w-full mt-2">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={settingsicon} alt="Settings Icon" /> MISCELLANEOUS COST
        </p>
        <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-textDarkGrey">
              Total Miscellaneous Cost
            </span>
            <span className="text-xs font-bold text-textDarkGrey flex items-center gap-1">
              <NairaSymbol />
              {formatNumberWithCommas(saleData?.miscellaneousCost ?? 0)}
            </span>
          </div>
        </div>
      </div>
      {/* Transaction Cards */}
      <div className="flex flex-wrap items-center gap-4">
        {data?.entries?.map((item, index) => {
          const paymentInfo = data?.paymentInfo?.find(
            (payment) => payment.transactionRef === item.transactionRef
          ) as any;

          return (
            <CardComponent
              key={index}
              variant="salesTransactions"
              transactionId={item?.transactionId}
              transactionRef={item?.transactionRef}
              productId={item?.transactionId}
              transactionStatus={item?.paymentStatus}
              datetime={item?.datetime}
              productType={item?.productCategory}
              productTag={item?.paymentMode}
              transactionAmount={item?.amount}
              ogaranyaOrderRef={paymentInfo?.ogaranyaOrderRef}
              ogaranyaSmsMessage={paymentInfo?.ogaranyaSmsMessage}
              paymentMethod={paymentInfo?.paymentMethod}
              dropDownList={getDropDownList(item?.paymentStatus)}
              showDropdown={item?.paymentStatus !== "COMPLETED"}
            />
          );
        })}

        {/* Show message when all payments are completed */}
        {paymentSummary.remainingBalance <= 0 && data?.entries?.length > 0 && (
          <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <div>
                <h3 className="text-green-800 font-semibold">
                  Payment Complete!
                </h3>
                <p className="text-green-600 text-sm">
                  All payments have been successfully completed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pay Next Payment Modal */}
        {nextPaymentData && (
          <PayNextPayment
            isOpen={showPayNextPayment}
            onClose={() => {
              setShowPayNextPayment(false);
              setNextPaymentData(null);
            }}
            saleId={nextPaymentData.saleId}
            remainingBalance={paymentSummary.remainingBalance}
            suggestedAmount={nextPaymentData.suggestedAmount}
            onPaymentSuccess={handleNextPaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default SaleTransactions;
