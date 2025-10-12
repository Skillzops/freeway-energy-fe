import { useState } from "react";
import { toast } from "react-toastify";
import { NairaSymbol } from "../CardComponents/CardComponent";
import { Input } from "@/Components/InputComponent/Input";
import { formatNumberWithCommas } from "@/utils/helpers";
import { useApiCall } from "@/utils/useApiCall";

interface PaymentVerificationResponse {
  status?: string;
  message?: string;
  jobId?: string;
  paymentStatus?: "PENDING" | "INCOMPLETE" | "COMPLETED"
}

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
  const [amountToPay, setAmountToPay] = useState<number>(suggestedAmount);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Reset form when component opens
  useState(() => {
    if (isOpen) {
      setAmountToPay(suggestedAmount);
      setPaymentError(null);
    }
  });

  const handleCashPayment = async () => {
    if (!amountToPay || amountToPay <= 0) {
      setPaymentError("Payment amount must be greater than zero.");
      return;
    }

    if (amountToPay > remainingBalance) {
      setPaymentError(`Payment amount cannot exceed remaining balance of ₦${formatNumberWithCommas(remainingBalance)}`);
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      const response = await apiCall({
        endpoint: "/v1/sales/record-cash-payment", //Look into this endpoint
        method: "post",
        data: {
          saleId: saleId,
          paymentMethod: "CASH",
          amount: amountToPay,
          status: "COMPLETED",
          paymentNote: `Cash payment of ₦${formatNumberWithCommas(amountToPay)}`
        },
        successMessage: `Payment of ₦${formatNumberWithCommas(amountToPay)} recorded successfully!`,
      });

      if (response?.data) {
        // Call the success callback to refresh data
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

  const handleWalletPayment = async () => {
    // Add validation before processing
    if (!amountToPay || amountToPay <= 0) {
      setPaymentError("Payment amount must be greater than zero.");
      return;
    }

    if (amountToPay > remainingBalance) {
      setPaymentError(`Payment amount cannot exceed remaining balance of ₦${formatNumberWithCommas(remainingBalance)}`);
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      // Process wallet payment for agents
      const response = await apiCall({
        endpoint: "/v1/sales/create-next-payment", //Agent wallet payment endpoint
        method: "post",
        data: {
          saleId: saleId,
          amount: amountToPay,
          paymentMethod: "ONLINE"
        },
        successMessage: `Payment of ₦${formatNumberWithCommas(amountToPay)} completed successfully!`,
      });

      if (response?.data) {
        // Payment successful - refresh data and close modal
        onPaymentSuccess();
        onClose();
      } else {
        setPaymentError("Payment response data not received");
        toast.error("Payment completed but response data not received. Please refresh to see updates.");
        // Still call onPaymentSuccess to refresh data even if response is unclear
        onPaymentSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Error processing wallet payment:", error);
      const errorMessage = error?.response?.data?.message || "Failed to process wallet payment. Please try again.";
      setPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
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

        {/* Amount Input */}
        <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <Input
            type="number"
            name="amountToPay"
            label="AMOUNT TO PAY"
            value={amountToPay.toString()}
            onChange={(e) => setAmountToPay(Number(e.target.value))}
            placeholder="Enter payment amount"
            required={true}
            description="Amount will be deducted from your wallet balance."
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isProcessingPayment}
          >
            Cancel
          </button>
          <button
            onClick={handleWalletPayment}
            disabled={
              isProcessingPayment ||
              !amountToPay ||
              amountToPay <= 0 ||
              amountToPay > remainingBalance
            }
            className="flex-1 px-4 py-2 bg-primaryGradient text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingPayment
              ? "Processing..."
              : "Pay from Wallet"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayNextPayment;