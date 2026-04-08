import React, { useState, useEffect } from "react";
import { KeyedMutator } from "swr";
import { Modal } from "@/Components/ModalComponent/Modal";
import WalletViewReceipt from "./WalletView";

const WalletModal = ({
  isOpen,
  setIsOpen,
  walletID,
  refreshTable: _refreshTable





}: {isOpen: boolean;setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;walletID: string;refreshTable: KeyedMutator<any>;}) => {
  const [receiptData, setReceiptData] = useState<null | {
    status: string;
    referenceId: string;
    amount: number;
    date: string;
    time: string;
    topUpMode: string;
    transactionStatus: string;
    type: string;
  }>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletID) return;

    setLoading(true);

    // Simulate mock API data for now
    const timeout = setTimeout(() => {
      setReceiptData({
        status: "completed",
        referenceId: "140402404",
        amount: 24000,
        date: "08/08/2024",
        time: "12:23 pm",
        topUpMode: "Flutterwave – Card",
        transactionStatus: "Successful",
        type: "Sale Deduction"
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [walletID]);

  const handleClose = () => {
    setIsOpen(false);
    setReceiptData(null);
  };

  return (
    <Modal
      layout="right"
      isOpen={isOpen}
      onClose={handleClose}
      size="large"
      leftHeaderComponents={
      receiptData ?
      <span
        className={`${
        receiptData.status.toLowerCase() === "completed" ?
        "bg-green-100 text-green-700" :
        "bg-yellow-100 text-yellow-700"} px-3 py-1 rounded-full text-xs font-bold`
        }>

            {receiptData.status.toUpperCase()}
          </span> :
      null
      }>

      <div className="flex items-center justify-between mb-4">
        <span
          className={`${
          status.toLowerCase() === "completed" ?
          "bg-green-100 text-green-700" :
          "bg-yellow-100 text-yellow-700"} px-3 py-1 rounded-full text-xs font-bold`
          }>

          {status.toUpperCase()}
        </span>
      </div>
      <div className="bg-white  ">
        {loading ?
        <div className="text-center py-10 text-gray-500 text-sm">
            Loading...
          </div> :
        receiptData ?
        <WalletViewReceipt
          {...receiptData}
          onClose={() => setIsOpen(false)} /> :


        <div className="text-center py-10 text-gray-500 text-sm">
            No wallet data found.
          </div>
        }
      </div>
    </Modal>);

};

export default WalletModal;
