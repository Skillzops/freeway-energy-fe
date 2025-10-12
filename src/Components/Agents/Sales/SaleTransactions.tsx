import { CardComponent } from "../CardComponents/CardComponent";
import { SaleTransactionsType } from "./SalesDetailsModal";
import { useCallback, useEffect, useState } from "react";
import PaymentModeSelector from "./PaymentModeSelector";
import { NairaSymbol } from "../CardComponents/CardComponent";
import PayNextPayment from "./PayNextPayment";
import { formatNumberWithCommas } from "@/utils/helpers";
import { useApiCall } from "@/utils/useApiCall";

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
  isRefreshing?: boolean;
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
  isRefreshing = false,
}) => {
  if (!isInstallment) return null;

  // Calculate installment progress based on installments made
  const installmentProgress =
    totalInstallments > 0 ? (paymentsMade / totalInstallments) * 100 : 0;

  return (
    <div className="flex flex-col p-4 gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mb-4" style={{ background: 'linear-gradient(to right, rgb(239 246 255), rgb(238 242 255))' }}>
      <h3 className="text-sm font-bold text-gray-700 mb-2">Payment Progress</h3>

      {/* Progress Bar - Based on payment amount */}
      <div className="w-full bg-gray-200 rounded-full h-1 mb-3 relative">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${
            totalPaid > totalAmount
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : "bg-gradient-to-r from-gold to-primary"
          }`}
          style={{ width: `${Math.min(paymentProgress, 100)}%` }}
        ></div>
        
        {/* Loading overlay */}
        {isRefreshing && (
          <div className="absolute inset-0 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse opacity-70"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        )}
        
        {/* Overpayment indicator */}
        {totalPaid > totalAmount && !isRefreshing && (
          <div className="w-full bg-yellow-200 rounded-full h-0.5 mt-1">
            <div
              className="bg-yellow-500 h-0.5 rounded-full"
              style={{ width: `${Math.min(((totalPaid - totalAmount) / totalAmount) * 100, 100)}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Installment Progress Display */}
      <div className={`flex justify-between items-center mb-3 p-2 bg-white rounded-lg border relative ${isRefreshing ? 'opacity-70' : ''}`}>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Installments Made</p>
          <span className={`text-lg font-bold text-green-600 ${isRefreshing ? 'animate-pulse' : ''}`}>
            {paymentsMade}
          </span>
        </div>
        <div className="text-gray-400 text-xl">/</div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Required</p>
          <span className="text-lg font-bold text-gray-700">
            {totalInstallments}
          </span>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Remaining</p>
          <span className="text-lg font-bold text-red-600">
            {remainingInstallments}
          </span>
        </div>
        {isRefreshing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
            <div className="text-xs text-blue-600 font-medium">Updating...</div>
          </div>
        )}
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
            <span className={`text-sm font-bold ${remainingBalance > 0 ? "text-red-600" : "text-green-600"}`}>
              {remainingBalance > 0 ? formatNumberWithCommas(remainingBalance.toString()) : "Fully Paid"}
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
              Pay Next - ₦{formatNumberWithCommas(Math.min(remainingBalance, 6000).toString())}
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

const public_key =
  import.meta.env.VITE_FLW_PUBLIC_KEY ||
  "FLWPUBK_TEST-720d3bd8434091e9b28a01452ebdd2e0-X";

const SaleTransactions = ({
  data,
  saleData,
  refreshTable,
  refreshSingleSale,
  actualSaleId,
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
  };
  refreshTable?: () => Promise<any>;
  refreshSingleSale?: () => Promise<any>;
  actualSaleId: string;
}) => {
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
  const [isRefreshingPayment, setIsRefreshingPayment] = useState<boolean>(false);

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

    // Calculate payments made - if fully paid, show total installments, otherwise show actual completed payments
    let paymentsMade = completedPayments.length;
    const totalInstallments = saleData?.totalInstallments || 0;
    const remainingInstallments = saleData?.remainingInstallments || 0;

    // For installment payments, the progress should be based on the full amount
    const displayTotalAmount = totalAmount;
    
    // If the sale is fully paid (totalPaid >= totalAmount), show all installments as completed
    if (totalPaid >= totalAmount && totalInstallments > 0) {
      paymentsMade = totalInstallments;
    }
    
    const remainingBalance = Math.max(displayTotalAmount - totalPaid, 0);
    const paymentProgress = displayTotalAmount > 0 ? (totalPaid / displayTotalAmount) * 100 : 0;

    return {
      totalAmount: displayTotalAmount,
      totalPaid,
      remainingBalance,
      isInstallment,
      totalInstallments: totalInstallments,
      remainingInstallments,
      paymentsMade: paymentsMade,
      paymentProgress,
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
  ]);


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
      suggestedAmount: suggestedAmount,
    });

    setShowPayNextPayment(true);
  };

  const handleNextPaymentSuccess = async () => {
    try {
      console.log("Payment successful, refreshing data...");
      
      // Set loading state
      setIsRefreshingPayment(true);
      
      // Multiple aggressive refresh attempts to ensure data consistency
      const performRefresh = async (attempt: number) => {
        console.log(`Refresh attempt ${attempt}...`);
        
        if (refreshSingleSale) {
          await refreshSingleSale();
        }
        
        if (refreshTable) {
          await refreshTable();
        }
      };
      
      // Immediate refresh
      await performRefresh(1);
      
      // Additional refresh attempts with delays
      setTimeout(async () => {
        await performRefresh(2);
      }, 500);
      
      setTimeout(async () => {
        await performRefresh(3);
      }, 1000);
      
      setTimeout(async () => {
        await performRefresh(4);
      }, 1500);
      
      setTimeout(async () => {
        await performRefresh(5);
        // Final attempt and clear loading state
        setIsRefreshingPayment(false);
      }, 2500);
      
    } catch (error) {
      console.error("Error refreshing data after payment:", error);
      setIsRefreshingPayment(false);
    }
  };

  const getDropdownItems = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PENDING":
        return ["Make Payment"];
      case "INCOMPLETE":
        return ["Complete Payment"];
      default:
        return [];
    }
  };

  const getDropDownList = (paymentStatus: string) => ({
    items: getDropdownItems(paymentStatus),
    onClickLink: (index: number, cardData: any) => {
      const action = getDropdownItems(paymentStatus)[index];
      
      switch (action) {
        case "Make Payment":
        case "Complete Payment":
          handlePayNextPayment(cardData?.productId);
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Payment Summary for Installment Sales */}
      <PaymentSummary
        {...paymentSummary}
        isRefreshing={isRefreshingPayment}
        onPayNextPayment={() => {
          console.log("Pay Next button clicked");
          console.log("Payment summary:", paymentSummary);
          console.log("Sale data:", saleData);
          
          // For installment payments with remaining balance, allow payment
          if (paymentSummary.isInstallment && paymentSummary.remainingBalance > 0) {
            // Calculate suggested amount (minimum of remaining balance or typical installment amount)
            const suggestedAmount = Math.min(paymentSummary.remainingBalance, 6000);
            
            setNextPaymentData({
              saleId: actualSaleId,
              suggestedAmount: suggestedAmount,
            });
            
            setShowPayNextPayment(true);
          } else {
            console.log("No remaining balance or not an installment payment");
          }
        }}
      />

      {/* Payment Mode Selector Modal */}
      {showPaymentSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Complete Payment</h3>
              <button
                onClick={() => {
                  setShowPaymentSelector(false);
                  setSelectedPaymentId(null);
                  setPaymentError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Payment Error Display */}
            {paymentError && (
              <div className="mb-4 p-3 border border-red-500 rounded-md bg-red-50">
                <p className="text-red-600 text-sm">{paymentError}</p>
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
                onClick={() => {
                  // Close the payment selector and let PayNextPayment handle the payment
                  setShowPaymentSelector(false);
                  setSelectedPaymentId(null);
                  setPaymentError(null);
                  
                  // Find the selected payment and trigger PayNextPayment
                  if (selectedPaymentId) {
                    handlePayNextPayment(selectedPaymentId);
                  }
                }}
                disabled={isProcessingPayment || !paymentAmount || paymentAmount <= 0}
                className="flex-1 px-4 py-2 bg-primaryGradient text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? "Processing..." : "Continue to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Cards */}
      <div className="flex flex-wrap items-center gap-4">
        {data?.entries?.map((item, index) => {
          return (
            <CardComponent
              key={index}
              variant="salesTransactions"
              transactionId={item?.transactionId}
              productId={item?.transactionId}
              transactionStatus={item?.paymentStatus}
              datetime={item?.datetime}
              productType={item?.productCategory}
              productTag={item?.paymentMode}
              transactionAmount={item?.amount}
              dropDownList={getDropDownList(item?.paymentStatus)}
              showDropdown={item?.paymentStatus === "COMPLETED" ? false : true}
            />
          );
        })}
      </div>

      {/* Pay Next Payment Modal */}
      {nextPaymentData && (
        <PayNextPayment
          isOpen={showPayNextPayment}
          saleId={nextPaymentData.saleId}
          remainingBalance={paymentSummary.remainingBalance}
          suggestedAmount={nextPaymentData.suggestedAmount}
          onClose={() => {
            setShowPayNextPayment(false);
            setNextPaymentData(null);
          }}
          onPaymentSuccess={handleNextPaymentSuccess}
        />
      )}
    </div>
  );
};

export default SaleTransactions;
