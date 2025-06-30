import React, { useState, useEffect } from "react";
import { SelectInput, Input } from "../InputComponent/Input";
import roletwo from "../../assets/table/roletwo.svg";

interface PaymentModeSelectorProps {
  value: "ONLINE" | "CASH";
  onChange: (value: string) => void;
  errorMessage?: string;
  saleId?: string;
  amount?: number;
  onAmountChange?: (amount: number) => void;
}

const PaymentModeSelector: React.FC<PaymentModeSelectorProps> = ({
  value,
  onChange,
  errorMessage,
  saleId,
  amount,
  onAmountChange,
}) => {
  const [paymentAmount, setPaymentAmount] = useState(amount?.toString() || "");
  const [notes, setNotes] = useState("");

  // Update local state when amount prop changes
  useEffect(() => {
    if (amount) {
      setPaymentAmount(amount.toString());
    }
  }, [amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setPaymentAmount(newAmount);
    if (onAmountChange) {
      onAmountChange(Number(newAmount));
    }
  };

  return (
    <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
      <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
        <img src={roletwo} alt="Settings Icon" /> CHOOSE PAYMENT METHOD
      </p>
      <SelectInput
        label="Payment Method"
        value={value}
        onChange={onChange}
        options={[
          { label: "Online Payment", value: "ONLINE" },
          { label: "Cash Payment", value: "CASH" },
        ]}
        errorMessage={errorMessage}
      />

      {value === "CASH" && (
        <div className="flex flex-col gap-4 mt-4">
          <Input
            type="number"
            name="paymentAmount"
            label="PAYMENT AMOUNT"
            value={paymentAmount}
            onChange={handleAmountChange}
            placeholder="Enter payment amount"
            required={true}
          />
          <Input
            type="text"
            name="notes"
            label="PAYMENT NOTES"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter payment notes"
            required={false}
          />
          <p className="text-xs text-textLightGrey">
            Payment will be processed when you complete the sale.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentModeSelector; 