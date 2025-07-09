import { useState } from "react";
import { toast } from "react-toastify";
import { useApiCall } from "@/utils/useApiCall";
import PaymentModeSelector from "./PaymentModeSelector";
import { formatNumberWithCommas } from "@/utils/helpers";
import { NairaSymbol } from "../CardComponents/CardComponent";

interface PayNextPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
  remainingBalance: number;
  suggestedAmount: number;
  onPaymentSuccess: () => void;
}

const PayNextPayment: React.FC<PayNextPaymentProps> = ({
  isOpen,
  onClose,
  saleId,
  remainingBalance,
  suggestedAmount,
  onPaymentSuccess,
}) => {
  const { apiCall } = useApiCall();
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("CASH");
  const [paymentAmount, setPaymentAmount] = useState<number>(suggestedAmount);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Reset form when component opens
  useState(() => {
    if (isOpen) {
      setPaymentAmount(suggestedAmount);
      setPaymentError(null);
      setPaymentMethod("CASH");
    }
  });

  const handleCashPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      setPaymentError("Payment amount must be greater than zero.");
      return;
    }

    if (paymentAmount > remainingBalance) {
      setPaymentError(`Payment amount cannot exceed remaining balance of ₦${formatNumberWithCommas(remainingBalance)}`);
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      const response = await apiCall({
        endpoint: "/v1/sales/record-cash-payment",
        method: "post",
        data: {
          saleId: saleId,
          paymentMethod: "CASH",
          amount: paymentAmount,
          status: "COMPLETED",
          paymentNote: `Cash payment of ₦${formatNumberWithCommas(paymentAmount)}`
        },
        successMessage: `✅ Payment of ₦${formatNumberWithCommas(paymentAmount)} recorded successfully!`,
      });

      if (response?.data) {
        onPaymentSuccess();
        onClose();
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

  const handlePaymentMethodSubmit = () => {
    if (paymentMethod === "CASH") {
      handleCashPayment();
    } else {
      handleOnlinePayment();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pay Next Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Show remaining balance */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Remaining Balance:</span>
            <div className="flex items-center gap-1 font-semibold text-dark-700">
              <NairaSymbol />
              <span>{formatNumberWithCommas(remainingBalance)}</span>
            </div>
          </div>
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
            onClick={onClose}
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
              paymentAmount <= 0 || 
              paymentAmount > remainingBalance
            }
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
  );
};

export default PayNextPayment; 