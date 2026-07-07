import { useState } from "react";
import { toast } from "react-toastify";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { getApiErrorMessage } from "@/utils/helpers";
import { formatDateTime, formatNumberWithCommas, resolveApiAssetUrl } from "@/utils/helpers";
import { NairaSymbol } from "@/Components/CardComponents/CardComponent";
import useTokens from "@/hooks/useTokens";
import {
  canSendInvoiceToCustomer,
  getSaleCustomerEmail,
  normalizeRoleKey,
} from "@/utils/authSession";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  SENT:           "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  DRAFT:          "bg-[#F6F8FA] text-textDarkGrey border-strokeGreyTwo",
  PARTIALLY_PAID: "bg-[#FFF3D5] text-[#A58730] border-[#F3D890]",
  PAID:           "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
  OVERDUE:        "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  VOID:           "bg-[#F1F5F9] text-[#94A3B8] border-[#CBD5E1]",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status] ?? STATUS_STYLES.SENT}`}>
    {status.replace(/_/g, " ")}
  </span>
);

// ─── Pay modal ────────────────────────────────────────────────────────────────

const PayModal = ({
  invoice,
  prefillAmount,
  installmentLabel,
  onClose,
  onDone,
}: {
  invoice: any;
  prefillAmount?: number;
  installmentLabel?: string;
  onClose: () => void;
  onDone: () => void;
}) => {
  const { apiCall } = useApiCall();
  const balance = invoice.balance ?? Math.max(0, invoice.totalAmount - (invoice.liveAmountPaid ?? invoice.amountPaid ?? 0));
  const [amount, setAmount] = useState<string>(prefillAmount ? String(prefillAmount) : "");
  const [method, setMethod] = useState("CASH");
  const [notes, setNotes]   = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError]   = useState("");

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    if (amt > balance)    { setError(`Amount exceeds balance (₦${formatNumberWithCommas(balance)})`); return; }
    setPaying(true); setError("");
    try {
      await apiCall({
        method: "post",
        endpoint: `/v1/invoices/${invoice.id}/pay`,
        data: { amount: amt, paymentMethod: method, notes: notes || undefined },
        headers: { "Idempotency-Key": `${invoice.id}-pay-${Date.now()}` },
      });
      toast.success("Payment recorded successfully");
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.message?.[0] ?? err?.message ?? "Payment failed");
    } finally { setPaying(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-textDarkGrey">
          Pay Invoice — {invoice.invoiceNumber}
        </h3>

        {installmentLabel && (
          <p className="text-xs text-primary-hex font-semibold bg-[#EFF6FF] px-3 py-1.5 rounded-full">
            {installmentLabel}
          </p>
        )}

        <p className="text-xs text-textLightGrey">
          Balance: <span className="font-bold text-textDarkGrey">₦{formatNumberWithCommas(balance)}</span>
        </p>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Amount (₦)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Payment method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}
            className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full bg-white focus:outline-none">
            <option value="CASH">Cash</option>
            {/* <option value="WALLET">Wallet</option> */}
            <option value="ONLINE">Online</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Notes (optional)</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment notes…"
            className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full focus:outline-none" />
        </div>

        {error && <p className="text-xs text-errorTwo font-semibold px-1">{error}</p>}

        <div className="flex gap-2 mt-1">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">Cancel</button>
          <button onClick={submit} disabled={paying}
            className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white disabled:opacity-60">
            {paying ? "Processing…" : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Generate invoice confirmation ────────────────────────────────────────────

const GenerateConfirm = ({ saleId, onClose, onDone }: { saleId: string; onClose: () => void; onDone: () => void }) => {
  const { apiCall } = useApiCall();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    if (!saleId?.trim()) {
      setError("Sale reference is missing. Close this panel and open the sale again.");
      return;
    }
    setGenerating(true); setError("");
    try {
      await apiCall({
        method: "post",
        endpoint: "/v1/invoices/generate",
        data: { saleId: saleId.trim() },
        headers: { "Idempotency-Key": `gen-${saleId}-${Date.now()}` },
      });
      toast.success("Invoice generated successfully");
      onDone();
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Failed to generate invoice"));
    } finally { setGenerating(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-textDarkGrey">Generate Invoice</h3>
        <p className="text-xs text-textLightGrey leading-relaxed">
          This will create a master invoice for this sale. You can add sub-invoices or record payments against it afterwards.
        </p>
        {error && <p className="text-xs text-errorTwo font-semibold px-1">{error}</p>}
        <div className="flex gap-2 mt-1">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">Cancel</button>
          <button onClick={confirm} disabled={generating}
            className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white disabled:opacity-60">
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Create Sub-Invoice modal ─────────────────────────────────────────────────

const SubInvoiceModal = ({
  masterInvoice,
  onClose,
  onDone,
}: {
  masterInvoice: any;
  onClose: () => void;
  onDone: () => void;
}) => {
  const { apiCall } = useApiCall();
  const liveBalance = masterInvoice.balance ??
    Math.max(0, masterInvoice.totalAmount - (masterInvoice.liveAmountPaid ?? masterInvoice.amountPaid ?? 0));

  const [amount, setAmount]   = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote]       = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError]     = useState("");

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)    { setError("Enter a valid amount"); return; }
    if (amt > liveBalance)   { setError(`Amount exceeds master balance (₦${formatNumberWithCommas(liveBalance)})`); return; }
    setCreating(true); setError("");
    try {
      await apiCall({
        method: "post",
        endpoint: "/v1/invoices/sub",
        data: {
          masterInvoiceId: masterInvoice.id,
          amount: amt,
          dueDate: dueDate || undefined,
          note: note || undefined,
        },
        headers: { "Idempotency-Key": `sub-${masterInvoice.id}-${Date.now()}` },
      });
      toast.success("Sub-invoice created");
      onDone();
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Failed to create sub-invoice"));
    } finally { setCreating(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-textDarkGrey">Create Sub-Invoice</h3>
        <p className="text-xs text-textLightGrey">
          Under <span className="font-semibold text-textDarkGrey">{masterInvoice.invoiceNumber}</span>
          {" "}· Available balance:{" "}
          <span className="font-bold text-textDarkGrey">₦{formatNumberWithCommas(liveBalance)}</span>
        </p>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Amount (₦) *</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder={`Max ₦${formatNumberWithCommas(liveBalance)}`}
            className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Due date (optional)</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full focus:outline-none bg-white" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textDarkGrey">Note (optional)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note…"
            className="px-3 py-2 text-sm border border-strokeGreyThree rounded-full focus:outline-none" />
        </div>

        {error && <p className="text-xs text-errorTwo font-semibold px-1">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">Cancel</button>
          <button onClick={submit} disabled={creating}
            className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white disabled:opacity-60">
            {creating ? "Creating…" : "Create Sub-Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Invoice card ─────────────────────────────────────────────────────────────

const InvoiceCard = ({
  invoice,
  paymentMode,
  saleData,
  onRefresh,
  onRefreshSalesTable,
}: {
  invoice: any;
  paymentMode?: string;
  saleData?: any;
  onRefresh: () => void;
  onRefreshSalesTable?: () => Promise<any> | void;
}) => {
  const { apiCall } = useApiCall();
  const userData      = useTokens();
  const roleKey       = normalizeRoleKey(userData?.role?.role as string | undefined);
  const isTenantAdmin = roleKey === "TENANT_ADMIN";
  const canManage     = isTenantAdmin || roleKey === "INVOICE_OFFICER";
  const canSendToCustomer = canSendInvoiceToCustomer(userData);
  const [showPay, setShowPay]           = useState(false);
  const [showSub, setShowSub]           = useState(false);
  const [voidConfirm, setVoidConfirm]   = useState(false);
  const [voidReason, setVoidReason]     = useState("");
  const [voiding, setVoiding]           = useState(false);
  const [regenConfirm, setRegenConfirm] = useState(false);
  const [downloadConfirm, setDownloadConfirm] = useState(false);
  const [sendConfirm, setSendConfirm]   = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [sendLoading, setSendLoading]   = useState(false);
  const [receiptSendLoading, setReceiptSendLoading] = useState<Record<string, boolean>>({});
  const [receiptSendConfirm, setReceiptSendConfirm] = useState<string | null>(null);

  const balance   = invoice.balance ?? Math.max(0, invoice.totalAmount - (invoice.liveAmountPaid ?? invoice.amountPaid ?? 0));
  const isVoid    = invoice.status === "VOID";
  const isPaid    = invoice.derivedStatus === "PAID" || invoice.status === "PAID";
  const isMaster  = invoice.type === "MASTER";
  const hasActiveSubs = Array.isArray(invoice.subInvoices) && invoice.subInvoices.some((s: any) => s.status !== "VOID");
  const isPayg    = paymentMode === "INSTALLMENT";

  // PAYG installment context — read from the specific saleItem (per-item tracking)
  const installmentSaleItem = saleData?.saleItems?.find(
    (si: any) => si.paymentMode === "INSTALLMENT" || (si.installmentDuration ?? 0) > 0,
  );
  const monthlyPayment  = installmentSaleItem?.monthlyPayment ?? saleData?.totalMonthlyPayment;
  const remainingInst   = installmentSaleItem?.remainingInstallments ?? saleData?.remainingInstallments;
  const totalInst       = installmentSaleItem?.installmentDuration ?? saleData?.totalInstallmentDuration;
  const paidCount       = totalInst && remainingInst != null ? totalInst - remainingInst : undefined;
  const installmentLabel = isPayg && monthlyPayment
    ? `Pay ₦${formatNumberWithCommas(monthlyPayment)}${paidCount != null ? ` — Installment ${paidCount + 1} of ${totalInst}` : ""}`
    : undefined;
  const handleDownload = () => {
    if (!invoice?.pdfUrl) return;
    window.open(resolveApiAssetUrl(invoice.pdfUrl), "_blank", "noopener,noreferrer");
    setDownloadConfirm(false);
  };

  const handleRegen = async () => {
    setRegenLoading(true);
    try {
      await apiCall({ method: "POST", endpoint: `/v1/invoices/${invoice.id}/pdf` });
      toast.success("PDF generated");
      onRefresh();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "PDF generation failed"));
    } finally {
      setRegenLoading(false);
      setRegenConfirm(false);
    }
  };

  const customerEmail = getSaleCustomerEmail(saleData);

  const handleSend = async () => {
    if (!customerEmail) {
      toast.error("Customer has no email on file — add an email to the customer profile first.");
      return;
    }
    setSendLoading(true);
    try {
      const res = await apiCall({ method: "POST", endpoint: `/v1/invoices/${invoice.id}/send` });
      toast.success((res as any)?.message ?? `Invoice emailed to ${customerEmail}`);
      onRefresh();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Failed to send invoice"));
    } finally {
      setSendLoading(false);
      setSendConfirm(false);
    }
  };

  const handleSendReceipt = async (paymentId: string) => {
    setReceiptSendLoading((m) => ({ ...m, [paymentId]: true }));
    try {
      const res = await apiCall({
        method: "POST",
        endpoint: `/v1/invoices/${invoice.id}/receipt/send`,
        data: { paymentId },
      });
      toast.success((res as any)?.message ?? "Receipt sent to customer");
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Failed to send receipt"));
    } finally {
      setReceiptSendLoading((m) => ({ ...m, [paymentId]: false }));
      setReceiptSendConfirm(null);
    }
  };

  const receiptByPaymentId: Record<string, { receiptNumber: string; pdfUrl?: string | null }> = {};
  if (Array.isArray(invoice.receipts)) {
    for (const r of invoice.receipts) {
      if (r.paymentId) receiptByPaymentId[r.paymentId] = r;
    }
  }

  const handleVoid = async () => {
    setVoiding(true);
    try {
      await apiCall({
        method: "patch",
        endpoint: `/v1/invoices/${invoice.id}/void`,
        data: { reason: voidReason.trim() || "Voided from sale details" },
      });
      toast.success("Invoice voided");
      onRefresh();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Failed to void invoice"));
    } finally {
      setVoiding(false);
      setVoidConfirm(false);
      setVoidReason("");
    }
  };

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-2xl border ${isVoid ? "bg-[#F8FAFC] border-strokeGreyThree opacity-70" : "bg-white border-strokeGreyThree shadow-[0_8px_24px_rgba(15,23,42,0.04)]"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[13px] font-bold text-textDarkGrey truncate">{invoice.invoiceNumber}</span>
          <div className="flex items-center gap-2 flex-wrap">
            {invoice.type === "SUB" && <span className="text-[10px] text-textLightGrey">Sub-invoice</span>}
            {invoice.dueDate && (
              <span className="text-[11px] text-textLightGrey">
                Due: <span className="font-semibold text-textDarkGrey">{formatDateTime("datetime", invoice.dueDate)}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 flex-wrap shrink-0">
          <StatusBadge status={invoice.derivedStatus ?? invoice.status} />
          {invoice.pdfUrl && (
            <button type="button" onClick={() => setDownloadConfirm(true)}
              className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-[#F6F8FA] border border-strokeGreyTwo text-textDarkGrey flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              PDF
            </button>
          )}
          {!isVoid && canManage && isTenantAdmin && (
            <button onClick={() => setRegenConfirm(true)} disabled={regenLoading}
              className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey disabled:opacity-60 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {regenLoading ? "…" : "Gen PDF"}
            </button>
          )}
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 rounded-xl bg-[#FAFCFF] border border-[#E9EEF5]">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] text-textLightGrey">Total</span>
          <div className="flex items-center gap-0.5"><NairaSymbol /><span className="text-xs font-bold text-textDarkGrey">{formatNumberWithCommas(invoice.totalAmount)}</span></div>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] text-textLightGrey">Paid</span>
          <div className="flex items-center gap-0.5"><NairaSymbol /><span className="text-xs font-semibold text-[#059669]">{formatNumberWithCommas(invoice.liveAmountPaid ?? invoice.amountPaid ?? 0)}</span></div>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] text-textLightGrey">Balance</span>
          <div className="flex items-center gap-0.5"><NairaSymbol /><span className={`text-xs font-bold ${balance > 0 ? "text-errorTwo" : "text-[#059669]"}`}>{formatNumberWithCommas(Math.max(0, balance))}</span></div>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] text-textLightGrey">Type</span>
          <span className="text-xs text-textDarkGrey font-semibold">{invoice.type}</span>
        </div>
      </div>

      {/* Payments — send receipt per completed payment */}
      {!isVoid && canSendToCustomer && Array.isArray(invoice.payments) && invoice.payments.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          <p className="text-[10px] font-semibold tracking-wide text-textLightGrey uppercase">Payments</p>
          {invoice.payments.map((pmt: any) => {
            const receipt = receiptByPaymentId[pmt.id];
            const sending = !!receiptSendLoading[pmt.id];
            return (
              <div key={pmt.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl border border-[#E9EEF5] bg-[#FAFCFF]">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[11px] font-semibold text-textDarkGrey">
                    {pmt.paymentMethod?.replace(/_/g, " ") ?? "Payment"}
                  </span>
                  <span className="text-[10px] text-textLightGrey">
                    {formatDateTime("datetime", pmt.paymentDate ?? pmt.createdAt)}
                    {receipt ? ` · ${receipt.receiptNumber}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-0.5">
                    <NairaSymbol />
                    <span className="text-xs font-bold text-[#059669]">{formatNumberWithCommas(pmt.amount)}</span>
                  </div>
                  {receipt ? (
                    <>
                      {receipt.pdfUrl && (
                        <button type="button" onClick={() => window.open(resolveApiAssetUrl(receipt.pdfUrl!), "_blank", "noopener,noreferrer")}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                          PDF
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setReceiptSendConfirm(pmt.id)}
                        disabled={sending}
                        className="px-2.5 py-1 text-[10px] font-semibold rounded-full border border-blue-300 text-blue-600 disabled:opacity-60">
                        {sending ? "…" : "Send Receipt"}
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-textLightGrey italic">No receipt yet</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions — Pay / Void / Send to Customer */}
      {!isVoid && (
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <div className="flex gap-2 flex-wrap items-center">
          {!isPaid && (
            <>
              {(!isMaster || !hasActiveSubs) && (
                <button onClick={() => setShowPay(true)}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-full bg-primary-hex text-white">
                  {installmentLabel ?? "Pay"}
                </button>
              )}
              {isMaster && !isPayg && !hasActiveSubs && canManage && (
                <button onClick={() => setShowSub(true)}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                  + Sub-Invoice
                </button>
              )}
              {canManage && (
                <button onClick={() => setVoidConfirm(true)}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                  Void
                </button>
              )}
            </>
          )}
          {canSendToCustomer && (
            <button
              type="button"
              onClick={() => setSendConfirm(true)}
              disabled={sendLoading}
              title={customerEmail ? `Email invoice to ${customerEmail}` : "Customer email required"}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-full border border-blue-400 bg-[#EFF6FF] text-blue-700 disabled:opacity-60 flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              {sendLoading ? "Sending…" : "Send to Customer"}
            </button>
          )}
          </div>
        </div>
      )}

      {/* Modals */}
      {voidConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Void Invoice</h3>
            <p className="text-xs text-textLightGrey">
              Void <strong>{invoice.invoiceNumber}</strong>? This cannot be undone.
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-textDarkGrey">Reason (optional)</label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Duplicate invoice, customer request…"
                rows={3}
                className="px-3 py-2 text-sm border border-strokeGreyThree rounded-2xl resize-none focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setVoidConfirm(false); setVoidReason(""); }}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button onClick={handleVoid} disabled={voiding}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-[#DC2626] text-white disabled:opacity-60">
                {voiding ? "Voiding…" : "Confirm Void"}
              </button>
            </div>
          </div>
        </div>
      )}
      {receiptSendConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Send Receipt to Customer</h3>
            <p className="text-xs text-textLightGrey">
              {customerEmail
                ? <>Email the receipt for this payment to <strong>{customerEmail}</strong>?</>
                : "Email the receipt for this payment to the customer?"}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setReceiptSendConfirm(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button
                onClick={() => void handleSendReceipt(receiptSendConfirm)}
                disabled={!!receiptSendLoading[receiptSendConfirm] || !customerEmail}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-blue-600 text-white disabled:opacity-60">
                {receiptSendLoading[receiptSendConfirm] ? "Sending…" : "Yes, Send"}
              </button>
            </div>
          </div>
        </div>
      )}
      {sendConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Send Invoice to Customer</h3>
            <p className="text-xs text-textLightGrey">
              {customerEmail
                ? <>This will email invoice <strong>{invoice.invoiceNumber}</strong> (PDF + balance summary) to <strong>{customerEmail}</strong>. Continue?</>
                : <>The customer has no email on file. Add an email on the customer profile before sending.</>}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setSendConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button onClick={() => handleSend()} disabled={sendLoading || !customerEmail}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-blue-600 text-white disabled:opacity-60">
                {sendLoading ? "Sending…" : "Yes, Send"}
              </button>
            </div>
          </div>
        </div>
      )}
      {regenConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Generate Invoice PDF</h3>
            <p className="text-xs text-textLightGrey">
              This will generate or replace the invoice PDF. Continue?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setRegenConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button onClick={() => void handleRegen()} disabled={regenLoading}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white disabled:opacity-60">
                {regenLoading ? "Generating…" : "Yes, Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
      {downloadConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-textDarkGrey">Download Invoice PDF</h3>
            <p className="text-xs text-textLightGrey">
              This will open the latest invoice PDF in a new tab. Continue?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDownloadConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-full border border-strokeGreyTwo text-textDarkGrey">
                Cancel
              </button>
              <button onClick={handleDownload}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {showPay && (
        <PayModal
          invoice={invoice}
          prefillAmount={isPayg && monthlyPayment ? Math.min(monthlyPayment, balance) : undefined}
          installmentLabel={installmentLabel}
          onClose={() => setShowPay(false)}
          onDone={async () => {
            setShowPay(false);
            onRefresh();
            await onRefreshSalesTable?.();
          }}
        />
      )}
      {showSub && (
        <SubInvoiceModal
          masterInvoice={invoice}
          onClose={() => setShowSub(false)}
          onDone={() => { setShowSub(false); onRefresh(); }}
        />
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const SaleInvoices = ({
  saleId,
  saleItemId,
  paymentMode,
  saleData,
  onRefreshSalesTable,
}: {
  /** Parent Sales record id (preferred) */
  saleId: string;
  /** Legacy: SaleItem id from the sales table row */
  saleItemId?: string;
  paymentMode?: string;
  saleData?: any;
  onRefreshSalesTable?: () => Promise<any> | void;
}) => {
  const [showGenerate, setShowGenerate] = useState(false);

  const effectiveSaleId = saleId || saleData?.id || saleItemId || "";

  const { data: invoices, isLoading, error, mutate: refresh } = useGetRequest(
    `/v1/invoices/sale/${effectiveSaleId}`,
    !!effectiveSaleId,
    30000,
  );

  const list: any[]   = Array.isArray(invoices) ? invoices : [];
  const hasMaster     = list.some((i) => i.type === "MASTER" && i.status !== "VOID");
  const mode =
    paymentMode ??
    saleData?.paymentMode ??
    saleData?.saleItems?.find((si: any) => si?.paymentMode)?.paymentMode;
  const isOneOff = mode === "ONE_OFF";

  if (isLoading) return (
    <div className="flex items-center justify-center py-10">
      <div className="w-5 h-5 border-2 border-primary-hex border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-10">
      <p className="text-xs text-errorTwo">Failed to load invoices</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Generate button (ONE_OFF only, no active master) */}
      {isOneOff && !hasMaster && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-textLightGrey">No invoice generated yet</p>
          <button onClick={() => setShowGenerate(true)}
            className="px-4 py-1.5 text-xs font-semibold rounded-full bg-primary-hex text-white">
            + Generate Invoice
          </button>
        </div>
      )}

      {isOneOff && hasMaster && (
        <div className="flex items-center justify-end">
          <span className="text-[11px] text-textLightGrey italic">Master invoice exists — void it to regenerate.</span>
        </div>
      )}

      {list.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <p className="text-xs text-textLightGrey">
            {!isOneOff ? "PAYG invoice auto-generated on sale creation (if enabled in settings)." : "No invoices found."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              paymentMode={paymentMode}
              saleData={saleData}
              onRefresh={refresh}
              onRefreshSalesTable={onRefreshSalesTable}
            />
          ))}
        </div>
      )}

      {showGenerate && (
        <GenerateConfirm
          saleId={effectiveSaleId}
          onClose={() => setShowGenerate(false)}
          onDone={() => { setShowGenerate(false); refresh(); }}
        />
      )}
    </div>
  );
};

export default SaleInvoices;
