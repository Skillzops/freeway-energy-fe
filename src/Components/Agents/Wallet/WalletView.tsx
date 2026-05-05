import React from "react";
import creditcardicon from "@/assets/creditcardgrey.svg";
import { DropDown } from "@/Components/DropDownComponent/DropDown";

type ReceiptProps = {
  status: string;
  referenceId: string;
  amount: number;
  date: string;
  time: string;
  topUpMode: string;
  transactionStatus: string;
  type: string;
  onClose: () => void;
};

const WalletViewReceipt: React.FC<ReceiptProps> = ({
  status: _status,
  referenceId,
  amount,
  date,
  time,
  topUpMode,
  transactionStatus,
  type
}) => {
  const dropDownList = {
    items: ["Purchase Credit", "Top Up Wallet", "View Transaction History"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          break;
        case 1:
          break;
        case 2:
          break;
        default:
          break;
      }
    },
    showCustomButton: true
  };

  return (
    <div className="bg-white rounded-[20px] border border-gray-200 w-full h-full p-6 text-sm font-primary relative flex flex-col justify-between">
      {/* Ref ID and Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-base font-medium text-gray-700">
          {referenceId}
        </span>
        <div className="h-[32px] flex items-center justify-center">
          <DropDown {...dropDownList} />
        </div>
      </div>

      {/* Reference ID */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">Reference ID</span>
        <span className="text-sm font-medium text-gray-800">{referenceId}</span>
      </div>

      {/* Amount */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
        <span className="text-xs text-gray-500">Amount</span>
        <span className="text-lg font-bold text-green-700">
          ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* GENERAL DETAILS */}
      <div className="mb-6">
        <p className="flex items-center gap-1 text-xs text-textLightGrey font-semibold pb-2">
          <img src={creditcardicon} alt="Credit Card Icon" /> GENERAL DETAILS
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Date</span>
          <span className="text-gray-800">{date}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Time</span>
          <span className="text-gray-800">{time}</span>
        </div>
      </div>

      {/* OTHER DETAILS */}
      <div>
        <p className="flex items-center gap-1 text-xs text-textLightGrey font-semibold pb-2">
          <img src={creditcardicon} alt="Credit Card Icon" /> OTHER DETAILS
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Top-Up Mode</span>
          <span className="text-gray-800">{topUpMode}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Status</span>
          <span className="text-gray-800">{transactionStatus}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Type</span>
          <span className="text-gray-800">{type}</span>
        </div>
      </div>
    </div>);

};

export default WalletViewReceipt;
