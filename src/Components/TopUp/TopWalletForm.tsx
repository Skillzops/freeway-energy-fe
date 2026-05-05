import { useState } from "react";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { Input } from "../InputComponent/Input";
import { useApiCall } from "@/utils/useApiCall";
import { toast } from "react-toastify";
import { PaymentGateway } from "@/enums/enum";

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
            const response = await apiCall({
                endpoint: "/v1/wallet/topup",
                method: "post",
                data: {
                    amount: parseFloat(amount),
                    gateway: PaymentGateway.PAYSTACK,
                },
            });

            const paystackUrl =
                response?.data?.paymentData?.data?.authorization_url ||
                response?.data?.paymentData?.authorization_url;

            if (!paystackUrl) {
                throw new Error("Paystack authorization URL not returned");
            }

            if (typeof window !== "undefined") {
                window.open(paystackUrl, "_blank", "noopener,noreferrer");
            }

            toast.info(
                `Paystack top-up initialized for ₦${parseFloat(amount).toLocaleString()}. Complete payment in the opened tab.`,
            );
            refreshTable();
            handleClose(); // Close the modal
        } catch (err) {
            toast.error("Failed to initialize Paystack top-up. Please try again.");
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