import React, { useCallback, useEffect, useState } from "react";
import settingsicon from "@/assets/settings.svg";
import producticon from "@/assets/product-grey.svg";
import { SaleStore } from "@/stores/SaleStore";
import { NameTag } from "../CardComponents/CardComponent";
import { ProductDetailRow } from "./ProductSaleDisplay";
import { IoReturnUpBack } from "react-icons/io5";
import { formatNumberWithCommas } from "@/utils/helpers";
import creditcardicon from "@/assets/creditcardgrey.svg";
import { toast } from "react-toastify";
import { useApiCall } from "@/utils/useApiCall";
import ProceedButton from "@/Components/ProceedButtonComponent/ProceedButtonComponent";
import { Tag } from "@/Components/Products/ProductDetails";


// -------- Types --------
interface SalePayload {
  paymentMethod: "CASH" | "ONLINE" | "WALLET";
  monthlypayment?: number;
  [key: string]: any;
}

interface SaleResponse {
  sale?: {id: string | number;};
  paymentData?: {amount: number;};
}

interface SalesSummaryProps {
  setSummaryState: React.Dispatch<React.SetStateAction<boolean>>;
  resetSaleModalState: () => void;
  loading: boolean;
  getIsFormFilled: () => boolean;
  apiErrorMessage: React.ReactNode;
  payload: SalePayload;
  refreshTable?: () => Promise<any>;
}

const SalesSummary: React.FC<SalesSummaryProps> = ({
  setSummaryState,
  resetSaleModalState,
  loading,
  getIsFormFilled,
  apiErrorMessage,
  payload,
  refreshTable
}) => {
  const { apiCall } = useApiCall();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentNotes, _setPaymentNotes] = useState<string>("");
  const paymentDetails = SaleStore.paymentDetails;

  // ---- Helpers (Installment/Misc) ----
  const isInstallmentPayment = useCallback(() => {
    return SaleStore.products.some((p) => {
      const params = SaleStore.getParametersByProductId(p?.productId);
      return params?.paymentMode === "INSTALLMENT";
    });
  }, []);

  // Initial deposit base = sum of installmentStartingPrice where mode is INSTALLMENT
  const getTotalInitialDepositBaseOnly = useCallback(() => {
    return SaleStore.products.reduce((total, product) => {
      const params = SaleStore.getParametersByProductId(product.productId);
      if (params?.paymentMode !== "INSTALLMENT") return total;
      return total + (Number(params.installmentStartingPrice) || 0);
    }, 0);
  }, []);

  // Sum of all miscellaneous for products in INSTALLMENT mode
  const getTotalMiscellaneous = useCallback(() => {
    return SaleStore.products.reduce((total, product) => {
      const params = SaleStore.getParametersByProductId(product.productId);
      if (params?.paymentMode !== "INSTALLMENT") return total;

      const misc = SaleStore.getMiscellaneousByProductId(product.productId)?.costs;
      const entries =
      typeof misc?.entries === "function" ? Array.from(misc.entries()) : Object.entries(misc as any || {});
      const sum = entries.reduce((s, [, v]) => s + (Number(v) || 0), 0);

      return total + sum;
    }, 0);
  }, []);

  // Initial deposit total (base + misc)
  const getTotalInitialDeposit = useCallback(() => {
    return getTotalInitialDepositBaseOnly() + getTotalMiscellaneous();
  }, [getTotalInitialDepositBaseOnly, getTotalMiscellaneous]);

  // Full total (your existing store calc)
  const getTotalAmount = useCallback(() => SaleStore.getTotal(), []);

  const payableNow = isInstallmentPayment() ? getTotalInitialDeposit() : getTotalAmount();

  // ---- Create Sale (Agent Wallet) ----
  const createSaleFromAgentWallet = async () => {
    const freshPayload = {
      ...payload,
      // agent flow specifics:
      monthlyPayment: SaleStore.monthlyPayment,
      paymentMethod: SaleStore.paymentMethod,
      // amount the agent will be charged now:
      amount: payableNow,
      notes: paymentNotes
    };

    const res = await apiCall({
      endpoint: "/v1/agents/create-sale",
      method: "post",
      data: freshPayload,
      successMessage: "Sale created successfully!",
      showToast: false
    });

    return res?.data as SaleResponse | undefined;
  };

  // ---- Handle Wallet Payment ----
  const handleWalletPayment = async () => {
    setPaymentError(null);
    setIsSubmitting(true);
    try {
      const saleResponse = await createSaleFromAgentWallet();
      if (!saleResponse) throw new Error("No response from server");

      // success UX
      toast.success("Wallet payment completed successfully!");
      if (refreshTable) {
        try {
          await refreshTable();
        } catch {

          /* ignore refresh failure */}
      }
      resetSaleModalState();
    } catch (error: any) {
      const message =
      error?.response?.data?.message || (
      Array.isArray(error?.response?.data?.message) ?
      error.response.data.message[0] :
      error.message || "Failed to complete wallet payment. Please try again.");
      setPaymentError(message);
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  // clear local error when store payment data changes
  useEffect(() => {
    if (paymentDetails) setPaymentError(null);
  }, [paymentDetails]);

  return (
    <>
      <div className="flex w-full">
        <p
          className="flex gap-1 items-center text-xs font-bold text-textDarkGrey cursor-pointer hover:underline"
          onClick={() => setSummaryState(false)}>

          <IoReturnUpBack />
          Back to form
        </p>
      </div>

      {/* GENERAL DETAILS */}
      <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={settingsicon} alt="Settings Icon" /> GENERAL DETAILS
        </p>
        <ProductDetailRow label="Sale Category" value={SaleStore.category} />
        <div className="flex items-center justify-between">
          <Tag name="Customer" />
          <div className="text-xs font-bold text-textDarkGrey">
            <NameTag name={SaleStore.customer?.customerName} />
          </div>
        </div>
      </div>

      {/* PER PRODUCT DETAILS */}
      {SaleStore.products.map((item, index) => {
        const params = SaleStore.getParametersByProductId(item?.productId);
        const recipient = SaleStore.getRecipientByProductId(item?.productId);

        const miscModel = SaleStore.getMiscellaneousByProductId(item?.productId)?.costs;
        const miscEntries =
        typeof miscModel?.entries === "function" ? Array.from(miscModel.entries()) : Object.entries(miscModel as any || {});
        const miscCostsExist = miscEntries.length >= 1;

        return (
          <div
            key={index}
            className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">

            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={producticon} alt="Product Icon" /> PRODUCT {index + 1}
            </p>

            <ProductDetailRow label="Product Category" value={item.productTag} />
            <ProductDetailRow label="Product Name" value={item.productName} />
            <ProductDetailRow label="Product Units" value={item.productUnits} />
            <ProductDetailRow label="Product Price" value={item.productPrice} />

            <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
              <ProductDetailRow
                label="Payment Mode"
                value={params?.paymentMode === "ONE_OFF" ? "Single Deposit" : "Installment"} />

              {params?.paymentMode === "INSTALLMENT" &&
              <>
                  <ProductDetailRow
                  label="Number of Installments"
                  value={formatNumberWithCommas(params?.installmentDuration)} />

                  <ProductDetailRow
                  label="Initial Deposit"
                  value={formatNumberWithCommas(params?.installmentStartingPrice)}
                  showNaira={true} />

                </>
              }
              {(params?.discount || 0) > 0 &&
              <ProductDetailRow label="Discount" value={`${params?.discount}%`} />
              }
            </div>

            {miscCostsExist &&
            <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <p className="text-[11px] font-semibold text-textDarkGrey">Miscellaneous</p>
                {miscEntries.map(([name, cost]) =>
              <ProductDetailRow
                key={`${index}-${name}`}
                label={String(name)}
                value={formatNumberWithCommas(Number(cost) || 0)}
                showNaira={true} />

              )}
              </div>
            }

            <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
              <ProductDetailRow
                label="Recipient Name"
                value={`${recipient?.firstname || ""} ${recipient?.lastname || ""}`.trim()} />

              <ProductDetailRow label="Recipient Address" value={recipient?.address as string} />
            </div>
          </div>);

      })}

      {/* PAYMENT SUMMARY (Wallet) */}
      <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={creditcardicon} alt="Payment Icon" /> PAYMENT SUMMARY
        </p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-textDarkGrey">Payment Method:</span>
          <span className="text-sm font-medium text-textBlack">Wallet Payment</span>
        </div>

        {isInstallmentPayment() ?
        <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textDarkGrey">Initial Deposit (Base):</span>
              <span className="text-sm font-bold text-textBlack">
                ₦{formatNumberWithCommas(getTotalInitialDepositBaseOnly())}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-textDarkGrey">Miscellaneous (Subtotal):</span>
              <span className="text-sm font-bold text-textBlack">
                ₦{formatNumberWithCommas(getTotalMiscellaneous())}
              </span>
            </div>

            <div className="h-px bg-strokeGreyThree my-1" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-textDarkGrey">Initial Deposit (Total):</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-textBlack">
                  ₦{formatNumberWithCommas(getTotalInitialDeposit())}
                </span>
              </div>
            </div>
          </> :

        <div className="flex items-center justify-between">
            <span className="text-sm text-textDarkGrey">Total Amount:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-textBlack">
                ₦{formatNumberWithCommas(getTotalAmount())}
              </span>
            </div>
          </div>
        }

        {/* Optional: show notes field (if you had one in agent flow) */}
        {/* <Textarea ... onChange={(e) => setPaymentNotes(e.target.value)} /> */}
      </div>

      {/* ERRORS */}
      {paymentError &&
      <div className="flex flex-col w-full p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">Payment Error</p>
          <p className="text-red-500 text-xs mt-1">{paymentError}</p>
        </div>
      }
      {apiErrorMessage}

      {/* CTA */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-textDarkGrey font-medium">
          Click to complete sale with wallet payment
        </p>
        <ProceedButton
          type="button"
          loading={isSubmitting || loading}
          variant={getIsFormFilled() ? "gradient" : "gray"}
          disabled={!getIsFormFilled() || isSubmitting}
          onClick={handleWalletPayment} />

      </div>
    </>);

};

export default SalesSummary;
