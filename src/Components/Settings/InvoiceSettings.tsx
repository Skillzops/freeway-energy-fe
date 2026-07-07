import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { SmallInput, ToggleInput } from "@/Components/InputComponent/Input";
import ApiErrorMessage from "@/Components/ApiErrorMessage";

type InvoiceSettingsData = {
  id?: string;
  invoicePrefix: string;
  receiptPrefix?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
  footerNote?: string;
  taxEnabled: boolean;
  taxName: string;
  taxRate: number;
  autoInvoicePaygo: boolean;
  allowSubInvoices: boolean;
  autoGenerateReceiptOnPayment: boolean;
  autoEmailReceiptToCustomer: boolean;
  taxNumber?: string;
  currency: string;
  currencySymbol: string;
  paymentTerms?: string;
  defaultDueDays?: number;
  nextSequence?: number;
  companyName?: string;
  companyAddress?: string;
  companyLogoUrl?: string;
};

/** Fields sent on save — excludes read-only counters from GET response */
const settingsPayload = (form: InvoiceSettingsData) => {
  const { nextSequence: _next, id: _id, ...payload } = form;
  return payload;
};

const DEFAULT: InvoiceSettingsData = {
  invoicePrefix: "INV",
  receiptPrefix: "RCT",
  bankName: "",
  accountNumber: "",
  accountName: "",
  bankCode: "",
  footerNote: "",
  taxEnabled: false,
  taxName: "VAT",
  taxRate: 7.5,
  autoInvoicePaygo: false,
  allowSubInvoices: true,
  autoGenerateReceiptOnPayment: false,
  autoEmailReceiptToCustomer: false,
  taxNumber: "",
  currency: "NGN",
  currencySymbol: "₦",
  paymentTerms: "",
  defaultDueDays: 30,
  companyName: "",
  companyAddress: "",
  companyLogoUrl: "",
};

// ─── Reusable row ─────────────────────────────────────────────────────────────

const SettingRow = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-strokeGreyThree last:border-b-0">
    <div className="flex flex-col gap-0.5 flex-1">
      <span className="text-xs font-semibold text-textDarkGrey">{label}</span>
      {hint && <span className="text-[11px] text-textLightGrey">{hint}</span>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

// ─── Toggle row ───────────────────────────────────────────────────────────────

const ToggleRow = ({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <SettingRow label={label} hint={hint}>
    <ToggleInput defaultChecked={checked} onChange={onChange} key={String(checked)} />
  </SettingRow>
);

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title }: { title: string }) => (
  <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium py-3">
    {title}
  </p>
);

// ─── Main component ───────────────────────────────────────────────────────────

const InvoiceSettings = () => {
  const { apiCall } = useApiCall();
  const receiptsEnabled = true;
  const { data, isLoading, mutate } = useGetRequest("/v1/invoices/settings", true, 30000);

  const [form, setForm] = useState<InvoiceSettingsData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>("");

  // Sync loaded settings into form
  useEffect(() => {
    if (data) {
      setForm({
        invoicePrefix: data.invoicePrefix ?? DEFAULT.invoicePrefix,
        receiptPrefix: data.receiptPrefix ?? "RCT",
        bankName: data.bankName ?? "",
        accountNumber: data.accountNumber ?? "",
        accountName: data.accountName ?? "",
        bankCode: data.bankCode ?? "",
        footerNote: data.footerNote ?? "",
        taxEnabled: data.taxEnabled ?? false,
        taxName: data.taxName ?? "VAT",
        taxRate: data.taxRate ?? 7.5,
        autoInvoicePaygo: data.autoInvoicePaygo ?? false,
        allowSubInvoices: data.allowSubInvoices ?? true,
        autoGenerateReceiptOnPayment: data.autoGenerateReceiptOnPayment ?? false,
        autoEmailReceiptToCustomer: data.autoEmailReceiptToCustomer ?? false,
        taxNumber: data.taxNumber ?? "",
        currency: data.currency ?? "NGN",
        currencySymbol: data.currencySymbol ?? "₦",
        paymentTerms: data.paymentTerms ?? "",
        defaultDueDays: data.defaultDueDays ?? 30,
        companyName: data.companyName ?? "",
        companyAddress: data.companyAddress ?? "",
        companyLogoUrl: data.companyLogoUrl ?? "",
        nextSequence: data.nextSequence,
      });
    }
  }, [data]);

  const set = (key: keyof InvoiceSettingsData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setApiError("");
    try {
      await apiCall({
        method: "post",
        endpoint: "/v1/invoices/settings",
        data: settingsPayload(form),
      });
      toast.success("Invoice settings saved successfully");
      mutate();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save settings";
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[200px]">
        <div className="w-6 h-6 border-2 border-primary-hex border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-textDarkGrey">Invoicing</h2>
          <p className="text-xs text-textLightGrey mt-0.5">
            Configure invoice generation, tax settings, and bank details.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold rounded-full bg-primary-hex text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {apiError && <ApiErrorMessage apiError={apiError as any} />}

      {/* ── Invoice Generation ── */}
      <div className="flex flex-col p-4 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <SectionHeader title="INVOICE GENERATION" />

        <ToggleRow
          label="Auto-generate invoice for PAYG sales"
          hint="When enabled, a master invoice is automatically created when a PAYG (installment) sale is recorded."
          checked={form.autoInvoicePaygo}
          onChange={(v) => set("autoInvoicePaygo", v)}
        />
        <ToggleRow
          label="Allow sub-invoices"
          hint="Permit splitting a master invoice into smaller sub-invoices for direct (one-off) sales."
          checked={form.allowSubInvoices}
          onChange={(v) => set("allowSubInvoices", v)}
        />
        {receiptsEnabled && (
          <ToggleRow
            label="Auto-generate receipt when payment completes"
            hint="When enabled, a receipt PDF is generated automatically for completed invoice payments."
            checked={form.autoGenerateReceiptOnPayment}
            onChange={(v) => set("autoGenerateReceiptOnPayment", v)}
          />
        )}
        {receiptsEnabled && (
          <ToggleRow
            label="Auto-email receipt to customer"
            hint="When enabled, generated receipts are emailed automatically to the customer if an email is available."
            checked={form.autoEmailReceiptToCustomer}
            onChange={(v) => set("autoEmailReceiptToCustomer", v)}
          />
        )}

        <SettingRow label="Invoice prefix" hint="Prepended to every invoice number (e.g. INV-2025-ABCD-0001)">
          <SmallInput
            type="text"
            name="invoicePrefix"
            value={form.invoicePrefix}
            onChange={(e) => set("invoicePrefix", e.target.value.toUpperCase())}
            placeholder="INV"
          />
        </SettingRow>
        {receiptsEnabled && (
          <SettingRow label="Receipt prefix" hint="Prepended to every receipt number (e.g. RCT-2025-ABCD-0001)">
            <SmallInput
              type="text"
              name="receiptPrefix"
              value={form.receiptPrefix ?? "RCT"}
              onChange={(e) => set("receiptPrefix", e.target.value.toUpperCase())}
              placeholder="RCT"
            />
          </SettingRow>
        )}

        {form.nextSequence !== undefined && (
          <SettingRow label="Next sequence number" hint="Auto-incrementing counter. Read-only.">
            <span className="text-xs font-bold text-textDarkGrey px-3 py-1 bg-[#F6F8FA] border border-strokeGreyTwo rounded-full">
              {form.nextSequence}
            </span>
          </SettingRow>
        )}
      </div>

      {/* ── Tax ── */}
      <div className="flex flex-col p-4 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <SectionHeader title="TAX" />

        <ToggleRow
          label="Enable tax on invoices"
          hint="When enabled, the configured tax is added to every invoice total."
          checked={form.taxEnabled}
          onChange={(v) => set("taxEnabled", v)}
        />

        <SettingRow label="Tax name" hint='Displayed on the invoice (e.g. "VAT", "GST")'>
          <SmallInput
            type="text"
            name="taxName"
            value={form.taxName}
            onChange={(e) => set("taxName", e.target.value)}
            placeholder="VAT"
            disabled={!form.taxEnabled}
          />
        </SettingRow>

        <SettingRow label="Tax rate (%)" hint="Percentage applied to the invoice subtotal">
          <SmallInput
            type="number"
            name="taxRate"
            value={form.taxRate}
            onChange={(e) => set("taxRate", parseFloat(e.target.value) || 0)}
            placeholder="7.5"
            disabled={!form.taxEnabled}
          />
        </SettingRow>
        <SettingRow label="Tax number" hint="TIN / VAT registration number (optional, printed on invoice)">
          <SmallInput
            type="text"
            name="taxNumber"
            value={form.taxNumber ?? ""}
            onChange={(e) => set("taxNumber", e.target.value)}
            placeholder="12345678-0001"
            disabled={!form.taxEnabled}
          />
        </SettingRow>
      </div>

      {/* ── Company branding (PDF & emails) ── */}
      <div className="flex flex-col p-4 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <SectionHeader title="COMPANY BRANDING (PDF & EMAILS)" />

        <SettingRow label="Company name" hint="Shown in the invoice header and email sign-off">
          <SmallInput
            type="text"
            name="companyName"
            value={form.companyName ?? ""}
            onChange={(e) => set("companyName", e.target.value)}
            placeholder="Mar & Mor Energy"
          />
        </SettingRow>
        <SettingRow label="Company address" hint="Printed under the company name on invoices">
          <SmallInput
            type="text"
            name="companyAddress"
            value={form.companyAddress ?? ""}
            onChange={(e) => set("companyAddress", e.target.value)}
            placeholder="Lagos, Nigeria"
          />
        </SettingRow>
        <SettingRow label="Logo URL" hint="Public image URL for the logo on PDF invoices (optional)">
          <SmallInput
            type="url"
            name="companyLogoUrl"
            value={form.companyLogoUrl ?? ""}
            onChange={(e) => set("companyLogoUrl", e.target.value)}
            placeholder="https://..."
          />
        </SettingRow>
      </div>

      {/* ── Currency ── */}
      <div className="flex flex-col p-4 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <SectionHeader title="CURRENCY" />
        <SettingRow label="Currency code" hint='ISO 4217 code displayed on invoice (e.g. "NGN", "USD")'>
          <SmallInput
            type="text"
            name="currency"
            value={form.currency}
            onChange={(e) => set("currency", e.target.value.toUpperCase())}
            placeholder="NGN"
          />
        </SettingRow>
        <SettingRow label="Currency symbol" hint='Symbol rendered on amounts (e.g. "₦", "$")'>
          <SmallInput
            type="text"
            name="currencySymbol"
            value={form.currencySymbol}
            onChange={(e) => set("currencySymbol", e.target.value)}
            placeholder="₦"
          />
        </SettingRow>
      </div>

      {/* ── Bank Details ── */}
      <div className="flex flex-col p-4 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <SectionHeader title="BANK DETAILS (shown on invoice)" />

        <SettingRow label="Bank name">
          <SmallInput
            type="text"
            name="bankName"
            value={form.bankName}
            onChange={(e) => set("bankName", e.target.value)}
            placeholder="First Bank"
          />
        </SettingRow>
        <SettingRow label="Account name">
          <SmallInput
            type="text"
            name="accountName"
            value={form.accountName}
            onChange={(e) => set("accountName", e.target.value)}
            placeholder="Company Ltd."
          />
        </SettingRow>
        <SettingRow label="Account number">
          <SmallInput
            type="text"
            name="accountNumber"
            value={form.accountNumber}
            onChange={(e) => set("accountNumber", e.target.value)}
            placeholder="0123456789"
          />
        </SettingRow>
        <SettingRow label="Sort / bank code" hint="Optional">
          <SmallInput
            type="text"
            name="bankCode"
            value={form.bankCode ?? ""}
            onChange={(e) => set("bankCode", e.target.value)}
            placeholder="011"
          />
        </SettingRow>
        <SettingRow label="Payment terms" hint='Displayed on invoice (e.g. "Payment due within 30 days")'>
          <SmallInput
            type="text"
            name="paymentTerms"
            value={form.paymentTerms ?? ""}
            onChange={(e) => set("paymentTerms", e.target.value)}
            placeholder="Payment due within 30 days"
          />
        </SettingRow>
        <SettingRow label="Default due days" hint="Number of days after issuance before invoice is due (0 = no due date)">
          <SmallInput
            type="number"
            name="defaultDueDays"
            value={String(form.defaultDueDays ?? 30)}
            onChange={(e) => set("defaultDueDays", Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="30"
          />
        </SettingRow>
        <SettingRow label="Footer note" hint="Appears at the bottom of every invoice (optional)">
          <SmallInput
            type="text"
            name="footerNote"
            value={form.footerNote ?? ""}
            onChange={(e) => set("footerNote", e.target.value)}
            placeholder="Thank you for your business."
          />
        </SettingRow>
      </div>
    </div>
  );
};

export default InvoiceSettings;
