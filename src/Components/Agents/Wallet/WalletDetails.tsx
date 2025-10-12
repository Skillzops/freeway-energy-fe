import React, { useState } from "react";
import { KeyedMutator } from "swr";
// import { Tag } from "../Products/ProductDetails";
// import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import wallet from "@/assets/agents/wallet.svg";
import { Tag } from "@/Components/Products/ProductDetails";
import ProceedButton from "@/Components/ProceedButtonComponent/ProceedButtonComponent";

export type WalletDetailsType = {
  walletId: string;
  user: string;
  balance: string;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const WalletDetails = ({
  refreshTable,
  displayInput,
  ...data
}: WalletDetailsType & {
  refreshTable: KeyedMutator<any>;
  displayInput?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    walletId: data.walletId,
    user: data.user,
    balance: data.balance,
    currency: data.currency,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Submitted Wallet Data:", formData);
      if (refreshTable) await refreshTable();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={wallet} alt="Wallet Icon" /> WALLET DETAILS
        </p>

        <div className="flex items-center justify-between">
          <Tag name="User" />
          {displayInput ? (
            <input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              placeholder="Enter User"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">{data.user}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Tag name="Balance" />
          {displayInput ? (
            <input
              type="text"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              placeholder="Enter Balance"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.balance}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Tag name="Currency" />
          {displayInput ? (
            <input
              type="text"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder="Enter Currency"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.currency}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Tag name="Status" />
          {displayInput ? (
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border border-strokeGreyThree rounded-full"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">{data.status}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Tag name="Created At" />
          <p className="text-xs font-bold text-textDarkGrey">
            {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Tag name="Last Updated" />
          <p className="text-xs font-bold text-textDarkGrey">
            {new Date(data.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {displayInput && (
        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            loading={loading}
            variant="gray"
            disabled={false}
          />
        </div>
      )}
    </form>
  );
};

export default WalletDetails;
