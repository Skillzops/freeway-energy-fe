import React, { useState, useEffect } from "react";
import roletwo from "@/assets/table/roletwo.svg";
import { SelectInput, Input } from "@/Components/InputComponent/Input";

interface PaymentModeSelectorProps {
  value: "ONLINE" | "CASH";
  onChange: (value: string) => void;
  errorMessage?: string;
  saleId?: string;
  amount?: number;
  onAmountChange?: (amount: number) => void;
  onNotesChange?: (notes: string) => void;
  paymentGateway?: "OGARANYA" | "FLUTTERWAVE";
  onPaymentGatewayChange?: (gateway: "OGARANYA" | "FLUTTERWAVE") => void;
}

const PaymentModeSelector: React.FC<PaymentModeSelectorProps> = ({
  value,
  onChange,
  errorMessage,
  saleId: _saleId,
  amount,
  onAmountChange,
  onNotesChange,
  paymentGateway,
  onPaymentGatewayChange
}) => {
  const [paymentAmount, setPaymentAmount] = useState(amount?.toString() || "");
  const [_notes, setNotes] = useState("");
  const [_selectedGateway, setSelectedGateway] = useState<
    "OGARANYA" | "FLUTTERWAVE">(
    paymentGateway || "OGARANYA");

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

  const _handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    if (onNotesChange) {
      onNotesChange(newNotes);
    }
  };

  const _handleGatewayChange = (gateway: string) => {
    const gatewayValue = gateway as "OGARANYA" | "FLUTTERWAVE";
    setSelectedGateway(gatewayValue);
    if (onPaymentGatewayChange) {
      onPaymentGatewayChange(gatewayValue);
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
        { label: "Online Payment", value: "ONLINE" }]
        }
        errorMessage={errorMessage} />


      {/* Amount input - only show when amount prop is provided (for PayNextPayment) */}
      {amount !== undefined && onAmountChange &&
      <div className="flex flex-col gap-2 mt-4">
          <Input
          type="number"
          name="paymentAmount"
          label="PAYMENT AMOUNT"
          value={paymentAmount}
          onChange={handleAmountChange}
          placeholder="Enter payment amount"
          required={true} />

        </div>
      }
      
      <p className="text-xs text-textLightGrey">
        Online payment will be processed through the selected gateway.
      </p>
    </div>);

};

export default PaymentModeSelector;
