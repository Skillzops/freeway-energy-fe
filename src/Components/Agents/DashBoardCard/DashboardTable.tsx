import React, { useMemo } from "react";
import walletIcon from "@/assets/agents/wallet.svg";
// import { DropDown } from "../DropDownComponent/DropDown";
import { useGetAgentSalesQuery, AgentSaleItem } from "@/redux/AgentTransactions";
import { DropDown } from "@/Components/DropDownComponent/DropDown";

type WalletCardProps = {
  onPurchaseCredit: () => void;
  onTopUpWallet: () => void;
  onViewTransactionHistory?: () => void;
  walletBalance: number;
};

const formatCurrency = (n: number | undefined) =>
  (Number(n) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const WalletCard: React.FC<WalletCardProps> = ({
  onPurchaseCredit,
  onTopUpWallet,
  onViewTransactionHistory = () => { },
  walletBalance,
}) => {
  const { data, isFetching } = useGetAgentSalesQuery({ page: 1, limit: 6 });

  type Activity = {
    id: string;
    qty: number;
    totalPrice: number;
    amountPaid: number;
    paymentStatus: string;
    paymentMode?: string;
    createdAt?: string;
  };

  const activities: Activity[] = useMemo(() => {
    const items = (data?.items ?? []) as AgentSaleItem[];

    return items.map((item) => {
      const lastPayment = item.sale?.payment?.[item.sale.payment.length - 1];
      return {
        id: item.id,
        qty: Number(item.quantity) || 0,
        totalPrice: Number(item.totalPrice) || 0,
        amountPaid: Number(item.sale?.totalPaid) || 0,
        paymentStatus: lastPayment?.paymentStatus ?? "—",
        paymentMode: item.paymentMode,
        createdAt: item.createdAt,
      };
    });
  }, [data?.items]);

  const dd = {
    items: ["Purchase Credit", "Top Up Wallet", "View Transaction History"],
    onClickLink: (i: number) => {
      if (i === 0) return onPurchaseCredit();
      if (i === 1) return onTopUpWallet();
      if (i === 2) return onViewTransactionHistory();
    },
    showCustomButton: true,
  };

  return (
    <div className="bg-walletCream rounded-2xl shadow-sm p-6 border border-[#E3F0FF] w-[359px] h-[640px] flex flex-col items-center gap-6">
      <div className="w-[327px] min-h-[160px] border border-gray-300 rounded-lg bg-white">
        <div className="flex items-center gap-3 mb-6 pt-4 pl-2">
          <div className="p-2 rounded-full bg-[#F5F9FF]">
            <img src={walletIcon} alt="Wallet" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-textGrey font-primary">Your</p>
            <p className="font-primary">Wallet Balance</p>
          </div>
        </div>
        <div className="pl-2 mt-10">
          <div className="flex items-end gap-1">
            <span className="text-sm font-medium text-textBlack">₦</span>
          </div>
          <div>
            <span className="text-[28px] font-secondary text-textBlack">
              {formatCurrency(walletBalance)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-skyblue flex justify-end items-center gap-2 w-[327px] h-[48px] rounded-full">
        <div className="w-[97px] h-[32px] bg-milk border border-gray-300 flex items-center justify-center rounded-full">
          <button
            onClick={onPurchaseCredit}
            className="w-[73px] h-[20px] font-primary text-[10px] font-medium leading-[140%]"
          >
            Purchase Token
          </button>
        </div>
        <div className="w-[97px] h-[32px] bg-milk border border-gray-300 flex items-center justify-center rounded-full">
          <button
            onClick={onTopUpWallet}
            className="w-[73px] h-[20px] font-primary text-[10px] font-medium leading-[140%]"
          >
            Top Up Wallet
          </button>
        </div>
        <div className="h-[32px] flex items-center justify-center">
          <DropDown {...dd} />
        </div>
      </div>

      <div className="w-[327px] h-[6px] text-left">
        <h3 className="font-primary font-bold text-[8px] leading-[100%] uppercase tracking-wider text-activities">
          Recent Activity
        </h3>
      </div>

      <div className="space-y-3 w-[327px] h-[368px] bg-activities2 overflow-y-auto">
        {isFetching ? (
          <div className="px-2 text-xs text-textGrey">Loading…</div>
        ) : activities.length === 0 ? (
          <div className="text-xs text-textGrey">No activity yet.</div>
        ) : (
          activities.map((a, idx) => (
            <div
              key={a.id ?? idx}
              className="mx-2 p-2 bg-white border border-gray-200 rounded-md"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] text-textGrey">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="text-[10px] text-textGrey">
                  {a.createdAt
                    ? new Date(a.createdAt).toLocaleDateString()
                    : "—"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                <div className="text-textGrey">Quantity</div>
                <div className="text-textBlack font-medium">{a.qty}</div>

                <div className="text-textGrey">Total price</div>
                <div className="text-textBlack font-medium">
                  ₦{formatCurrency(a.totalPrice)}
                </div>

                <div className="text-textGrey">Amount paid</div>
                <div className="text-textBlack font-medium">
                  ₦{formatCurrency(a.amountPaid)}
                </div>

                <div className="text-textGrey">PaymentStatus</div>
                <div className="text-textBlack font-medium">
                  {a.paymentStatus}
                </div>

                <div className="text-textGrey">PaymentMode</div>
                <div className="text-textBlack font-medium">
                  {a.paymentMode ?? "—"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WalletCard;

