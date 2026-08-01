import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageLayout from "../PageLayout";
import { useApiCall } from "@/utils/useApiCall";
import { getApiErrorMessage } from "@/utils/helpers";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import SecondaryButton from "@/Components/SecondaryButton/SecondaryButton";
import wallet from "@/assets/agents/wallet.svg";

type Outcome = "loading" | "success" | "failure" | "pending";

const verifiedSessionKey = (ref: string) => `wallet-topup-verified:${ref}`;

const WalletTopUpResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { apiCall } = useApiCall();
  const verifyStarted = useRef(false);

  // Hosted Paystack checkout returns `reference`. Keep the legacy names so
  // existing links from other providers still reconcile correctly.
  const txRef = (
    searchParams.get("reference") ??
    searchParams.get("tx_ref") ??
    searchParams.get("trxref")
  )?.trim() ?? "";
  const transactionId = searchParams.get("transaction_id")?.trim() ?? "";
  const gatewayStatus = searchParams.get("status")?.toLowerCase() ?? "";

  const [outcome, setOutcome] = useState<Outcome>("loading");
  const [message, setMessage] = useState("");
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!txRef || txRef === "undefined") {
      setOutcome("failure");
      setMessage("Missing payment reference. Return to your wallet and try again.");
      return;
    }

    if (sessionStorage.getItem(verifiedSessionKey(txRef)) === "done") {
      setOutcome(gatewayStatus === "cancelled" ? "failure" : "success");
      setMessage("This top-up was already processed.");
      return;
    }

    if (verifyStarted.current) return;
    verifyStarted.current = true;

    if (gatewayStatus === "cancelled") {
      sessionStorage.setItem(verifiedSessionKey(txRef), "done");
      setOutcome("failure");
      setMessage("Payment was cancelled. No funds were added to your wallet.");
      return;
    }

    (async () => {
      try {
        let endpoint = `/v1/payment/verify/callback?tx_ref=${encodeURIComponent(txRef)}`;
        if (transactionId) {
          endpoint += `&transaction_id=${encodeURIComponent(transactionId)}`;
        }

        const response = await apiCall({
          endpoint,
          method: "get",
          showToast: false,
        });

        const data = response?.data ?? {};
        const status = String(data.status ?? "").toLowerCase();

        sessionStorage.setItem(verifiedSessionKey(txRef), "done");

        if (
          status === "verified" ||
          status === "already_completed" ||
          status === "success"
        ) {
          setOutcome("success");
          setMessage(data.message ?? "Your wallet has been credited successfully.");
          if (typeof data.newBalance === "number") setNewBalance(data.newBalance);
          if (typeof data.amount === "number") setAmount(data.amount);
          toast.success("Wallet top-up successful");
          return;
        }

        if (status === "processing") {
          setOutcome("pending");
          setMessage(
            "Your payment is being confirmed. Refresh your wallet in a minute — balance updates automatically.",
          );
          return;
        }

        if (status === "pending") {
          setOutcome("pending");
          setMessage(
            data.message ??
              "Payment not confirmed yet. Check again shortly or contact support with your reference.",
          );
          return;
        }

        setOutcome("failure");
        setMessage(data.message ?? "We could not confirm this top-up.");
      } catch (error) {
        sessionStorage.setItem(verifiedSessionKey(txRef), "done");
        setOutcome("failure");
        setMessage(
          getApiErrorMessage(
            error,
            "Could not verify wallet top-up. Contact support with your payment reference.",
          ),
        );
      }
    })();
  }, [apiCall, gatewayStatus, transactionId, txRef]);

  const goToWallets = () => {
    navigate("/agent/wallets/all", { replace: true });
  };

  return (
    <PageLayout pageName="Wallet top-up" badge={wallet} showheaderBadge={false}>
      <section className="flex flex-col items-center justify-center w-full min-h-[420px] px-4 py-12">
        {outcome === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner />
            <p className="text-sm text-textLightGrey">Confirming your payment…</p>
            {txRef && (
              <p className="text-xs text-textLightGrey font-mono">Ref: {txRef}</p>
            )}
          </div>
        )}

        {outcome === "success" && (
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-[#d1fae5] flex items-center justify-center text-2xl text-[#059669]">
              ✓
            </div>
            <h2 className="text-lg font-semibold text-[#0f172a]">Top-up successful</h2>
            <p className="text-sm text-textLightGrey">{message}</p>
            {amount != null && (
              <p className="text-sm">
                Amount credited: <strong>₦{amount.toLocaleString("en-NG")}</strong>
              </p>
            )}
            {newBalance != null && (
              <p className="text-sm">
                New balance: <strong>₦{newBalance.toLocaleString("en-NG")}</strong>
              </p>
            )}
            {txRef && (
              <p className="text-xs text-textLightGrey font-mono">Reference: {txRef}</p>
            )}
            <SecondaryButton onClick={goToWallets}>Go to wallet</SecondaryButton>
          </div>
        )}

        {outcome === "pending" && (
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-[#fef3c7] flex items-center justify-center text-2xl text-[#b45309]">
              …
            </div>
            <h2 className="text-lg font-semibold text-[#0f172a]">Payment processing</h2>
            <p className="text-sm text-textLightGrey">{message}</p>
            {txRef && (
              <p className="text-xs text-textLightGrey font-mono">Reference: {txRef}</p>
            )}
            <SecondaryButton onClick={goToWallets}>Go to wallet</SecondaryButton>
          </div>
        )}

        {outcome === "failure" && (
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-[#fee2e2] flex items-center justify-center text-2xl text-[#dc2626]">
              ✕
            </div>
            <h2 className="text-lg font-semibold text-[#0f172a]">Top-up not completed</h2>
            <p className="text-sm text-textLightGrey">{message}</p>
            {txRef && (
              <p className="text-xs text-textLightGrey font-mono">Reference: {txRef}</p>
            )}
            <div className="flex flex-wrap gap-2 justify-center">
              <SecondaryButton onClick={goToWallets}>Back to wallet</SecondaryButton>
              <Link
                to="/agent/wallets/all"
                className="text-sm text-primary underline"
                onClick={(e) => {
                  e.preventDefault();
                  goToWallets();
                }}
              >
                Try another top-up
              </Link>
            </div>
          </div>
        )}
      </section>
    </PageLayout>
  );
};

export default WalletTopUpResult;
