import { useState } from "react";
// import SecondaryButton from "../SecondaryButton/SecondaryButton";
// import { Input } from "../InputComponent/Input";
import { useApiCall } from "@/utils/useApiCall";
import { toast } from "react-toastify";
import { PaymentGateway } from "@/enums/enum";
import SecondaryButton from "@/Components/SecondaryButton/SecondaryButton";
import { Input } from "@/Components/InputComponent/Input";

const TopUpWalletForm = ({
  handleClose,
  refreshTable,
}: {
  handleClose: () => void;
  refreshTable: () => void;
}) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { apiCall } = useApiCall();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setError("");
  };

  const validate = () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const parsedAmount = parseFloat(amount);

    setLoading(true);
    try {
      const res = await apiCall({
        endpoint: "/v1/wallet/topup",
        method: "post",
        data: {
          amount: Number(parsedAmount),
          gateway: PaymentGateway.FLUTTERWAVE,
        },
      });

      console.log(res, "res___");

      if (!res?.status) return;

      toast.success(res?.data?.message, { autoClose: 80000000 });

      // 👇 Get the payment link from the response
      const paymentLink = res?.data?.paymentLink; // <-- update this path to match your API

      if (paymentLink && typeof window !== "undefined") {
        window.open(paymentLink, "_blank", "noopener,noreferrer");
      }

      refreshTable();
      handleClose(); // Close the modal
    } catch (err) {
      toast.error("Failed to top up wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between w-full h-full min-h-[360px]">
      <div className="flex flex-col gap-3">
        <Input
          type="number"
          name="amount"
          label="Amount"
          value={amount}
          onChange={handleInputChange}
          placeholder="Enter amount"
          required
          errorMessage={error}
        />
      </div>

      <div className="flex items-center justify-between gap-1 mt-4">
        <SecondaryButton
          variant="secondary"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </SecondaryButton>
        <SecondaryButton onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </SecondaryButton>
      </div>
    </div>
  );
};

export default TopUpWalletForm;
