import { useState } from "react";
import { toast } from "react-toastify";
import { useApiCall } from "@/utils/useApiCall";
import PaymentModeSelector from "./PaymentModeSelector";
import { formatNumberWithCommas } from "@/utils/helpers";
import { NairaSymbol } from "../CardComponents/CardComponent";
import { useFlutterwave } from "flutterwave-react-v3";

const public_key =
  import.meta.env.VITE_FLW_PUBLIC_KEY ||
  "FLWPUBK_TEST-720d3bd8434091e9b28a01452ebdd2e0-X";
const base_url = import.meta.env.VITE_API_BASE_URL;

interface PayNextPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
  remainingBalance: number;
  suggestedAmount: number;
  onPaymentSuccess: () => void;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
}

const PayNextPayment: React.FC<PayNextPaymentProps> = ({
  isOpen,
  onClose,
  saleId,
  remainingBalance,
  suggestedAmount,
  onPaymentSuccess,
  customerEmail,
  customerName,
  customerPhone,
}) => {
  const { apiCall } = useApiCall();
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("CASH");
  const [paymentAmount, setPaymentAmount] = useState<number>(suggestedAmount);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showOnlinePayment, setShowOnlinePayment] = useState<boolean>(false);

  // Verify payment with backend (same as SaleTransactions.tsx)
  const verifyPayment = async (tx_ref: string, transaction_id?: string) => {
    try {
      

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

  // Reset form when component opens
  useState(() => {
    if (isOpen) {
      setPaymentAmount(suggestedAmount);
      setPaymentError(null);
      setPaymentMethod("CASH");
      setShowOnlinePayment(false);
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

  const handleOnlinePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      setPaymentError("Payment amount must be greater than zero.");
      return;
    }

    if (paymentAmount > remainingBalance) {
      setPaymentError(`Payment amount cannot exceed remaining balance of ₦${formatNumberWithCommas(remainingBalance)}`);
      return;
    }

    // Customer email is now optional for online payments
    // Use a default email if not provided
    const paymentEmail = customerEmail || "customer@example.com";

    if (!public_key) {
      setPaymentError("Payment system configuration error. Please contact support.");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      // First, create a payment record with PENDING status
      const paymentResponse = await apiCall({
        endpoint: "/v1/sales/record-cash-payment",
        method: "post",
        data: {
          saleId: saleId,
          paymentMethod: "ONLINE",
          amount: paymentAmount,
          status: "PENDING",
          paymentNote: `Online payment of ₦${formatNumberWithCommas(paymentAmount)}`
        },
        successMessage: "", // Don't show success message yet
      });

      if (paymentResponse?.data) {
        // Use Flutterwave hook with configuration (same as SaleTransactions.tsx)
        const handleFlutterPayment = useFlutterwave({
          public_key,
          tx_ref: `next_payment_${Date.now()}_${saleId}`,
          amount: paymentAmount,
          currency: "NGN",
          redirect_url: `${window.location.origin}/sales`,
          payment_options: "banktransfer, card, ussd, account",
          customer: {
            email: paymentEmail,
            name: customerName || "",
            phone_number: customerPhone || "",
          },
          customizations: {
            title: "Next Payment",
            description: `Payment of ₦${formatNumberWithCommas(paymentAmount)} for sale ${saleId}`,
            logo: "https://res.cloudinary.com/bluebberies/image/upload/v1726242207/Screenshot_2024-09-04_at_2.43.01_PM_fcjlf3.png",
          },
          meta: {
            saleId: saleId,
            paymentType: "next_payment",
          },
        });

        handleFlutterPayment({
          callback: async (response: any) => {
    
            
            if (response.status === "successful") {
              // Pass both tx_ref and transaction_id for verification
              const isVerified = await verifyPayment(response.tx_ref, response.transaction_id);
              if (!isVerified) {
                setPaymentError("Payment completed but verification failed. Please contact support with reference: " + response.tx_ref);
              } else {
                onPaymentSuccess();
                onClose();
                toast.success(`✅ Online payment of ₦${formatNumberWithCommas(paymentAmount)} completed successfully!`);
              }
            } else {
              toast.error("Payment failed. Please try again.");
              setPaymentError("Payment was not successful. Please try again.");
            }
          },
          onClose: () => {
            toast.info("Payment was cancelled");
            setIsProcessingPayment(false);
          },
        });
      }
    } catch (error: any) {
      console.error("Error processing online payment:", error);
      const errorMessage = error?.response?.data?.message || "Failed to process online payment. Please try again.";
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
            disabled={isProcessingPayment}
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