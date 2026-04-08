import { useState } from "react";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { Input } from "../InputComponent/Input";
import { useApiCall } from "@/utils/useApiCall";
import { toast } from "react-toastify";

const TopUpWalletForm = ({
  handleClose,
  refreshTable



}: {handleClose: () => void;refreshTable: () => void;}) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { apiCall } = useApiCall();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setError("");
  };

  const validate = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter a valid amount");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await apiCall({
        endpoint: "/v1/wallet/topup",
        method: "post",
        data: { amount: parseFloat(amount) },
        successMessage: "Wallet topped up successfully"
      });

      // Show success toast with amount
      toast.success(`Wallet topped up successfully with ₦${parseFloat(amount).toLocaleString()}`);

      refreshTable();
      handleClose(); // Close the modal
    } catch (_err) {
      toast.error("Failed to top up wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between w-full h-full min-h-[360px]">
            <div className="flex flex-col gap-3 mt-8">
                <Input
          type="number"
          name="amount"
          label="Amount"
          value={amount}
          onChange={handleInputChange}
          placeholder="Enter amount"
          required
          errorMessage={error} />

            </div>

            <div className="flex items-center justify-between gap-1 mt-4">
                <SecondaryButton
          variant="secondary"
          onClick={handleClose}
          disabled={loading}>

                    Cancel
                </SecondaryButton>
                <SecondaryButton onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </SecondaryButton>
            </div>
        </div>);

};

export default TopUpWalletForm;
