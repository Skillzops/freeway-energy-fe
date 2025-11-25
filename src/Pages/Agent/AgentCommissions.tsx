// src/Components/DashBoardCard/AgentCommissions.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApiCall } from "@/utils/useApiCall";
import ListPagination from "@/Components/PaginationComponent/ListPagination";
import { DataStateWrapper } from "@/Components/Loaders/DataStateWrapper";
import customerbadge from "@/assets/RedIcons/affiliate-marketing.png";

import dropdown from "@/assets/table/dropdown.svg";
import PageLayout from "./PageLayout";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";

// ==== Types (match API) ====
type CommissionCustomer = { name?: string; phone?: string };
type CommissionRow = {
  id: string;
  transactionRef: string;
  amount: number;
  commissionAmount: string | number;
  paymentDate: string; // ISO
  paymentMethod: string; // e.g. WALLET
  customer?: CommissionCustomer;
  saleId?: string;
};
type CommissionSummary = {
  totalCommission: number;
  totalPayments: number;
  commissionRate: number; // 7 => 7%
};
type AgentCommissionsResponse = {
  data: CommissionRow[];
  total: number;
  page: string;
  limit: string;
  totalPages: number;
  summary: CommissionSummary;
};

// ==== Helpers ====
const toISODateStart = (d: string) =>
  d ? new Date(`${d}T00:00:00.000Z`).toISOString() : undefined;
const toISODateEnd = (d: string) =>
  d ? new Date(`${d}T23:59:59.999Z`).toISOString() : undefined;
const money = (n: number | string) =>
  `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const when = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "");
const LIMITS = [10, 20, 50, 100];

// Small stat chip (matches your capsule style)
const Chip: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-full bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree">
    <span className="text-[11px] font-medium text-textGrey">{label}</span>
    <span className="text-[11px] font-semibold text-textBlack">{value}</span>
  </div>
);

const AgentCommissions: React.FC = () => {
  const { apiCall } = useApiCall();
  const apiRef = useRef(apiCall);
  useEffect(() => {
    apiRef.current = apiCall;
  }, [apiCall]);

  // Filters / paging
  const [start, setStart] = useState<string>(""); // yyyy-mm-dd
  const [end, setEnd] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Data
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [error, setError] = useState<any>(null);

  // Build endpoint with query params (stable per deps)
  const endpoint = useMemo(() => {
    const url = new URL("/v1/agents/commissions", "http://local");
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));
    const s = toISODateStart(start);
    const e = toISODateEnd(end);
    if (s) url.searchParams.set("startDate", s);
    if (e) url.searchParams.set("endDate", e);
    return url.pathname + url.search;
  }, [page, limit, start, end]);

  // Fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = (await apiRef.current({
          endpoint,
          method: "get",
        })) as { data?: AgentCommissionsResponse };

        if (!mounted) return;
        const payload = res?.data as AgentCommissionsResponse | undefined;

        setRows(payload?.data ?? []);
        setTotal(payload?.total ?? 0);
        setTotalPages(payload?.totalPages ?? 1);
        setSummary(payload?.summary ?? null);

        if ((payload?.totalPages ?? 1) < page) setPage(1);
      } catch (e) {
        if (!mounted) return;
        setError(e);
        setRows([]);
        setTotal(0);
        setTotalPages(1);
        setSummary(null);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [endpoint]);

  const clearFilters = () => {
    setStart("");
    setEnd("");
    setPage(1);
  };

  return (
    <>
      <PageLayout pageName="Commission" badge={customerbadge}>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          {/* Top capsule (kept for parity with app headers) */}
          <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
            <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
              <TitlePill
                icon={customerbadge}
                // iconBgColor="bg-[#E3FAD6]"
                topText="YOUR"
                bottomText="COMMISSION"
                value={summary?.totalCommission || 0}
              />
            </div>
            <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end" />
          </section>

          {/* ===== Section Header (controls) ===== */}
          <div className="w-full bg-saleGradient px-4 py-3 rounded-xl mb-3">
            <div className="flex items-center justify-between w-full max-w-full md:w-[975px] h-[40px] rounded-full border-[0.6px] px-4 py-2 bg-paleGrayGradient border-strokeGreyThree">
              {/* Controls (compact, capsule style) */}
              <div className="flex items-center gap-2">
                {/* Start date (explicit label, no extra icon) */}
                <div className="flex items-center gap-2">
                  <label htmlFor="start-date" className="text-xs font-medium text-textGrey">
                    Start
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value);
                      setPage(1);
                    }}
                    className="text-xs font-medium text-textGrey pl-2 pr-2 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full"
                    title="Start date"
                  />
                </div>

                {/* End date (explicit label, no extra icon) */}
                <div className="flex items-center gap-2">
                  <label htmlFor="end-date" className="text-xs font-medium text-textGrey">
                    End
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={end}
                    onChange={(e) => {
                      setEnd(e.target.value);
                      setPage(1);
                    }}
                    className="text-xs font-medium text-textGrey pl-2 pr-2 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full"
                    title="End date"
                  />
                </div>

                {/* Limit */}
                <div className="relative flex w-max">
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="text-xs font-medium text-textGrey pl-2 pr-6 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full appearance-none"
                    title="Items per page"
                  >
                    {LIMITS.map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>
                  <img src={dropdown} alt="" className="w-4 h-4 -ml-5 pointer-events-none" />
                </div>

                {/* Clear Filters */}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium h-[28px] px-3 rounded-full border-[0.6px] border-strokeGreyThree bg-[#F6F8FA] text-textDarkGrey hover:bg-[#EEF1F4] transition"
                  title="Clear start and end dates"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Sub header badge (total commission) */}
            {/* <div className="flex items-center justify-between px-4 py-2 mb-2 w-full md:w-[920px]">
              <div />
              <div className="flex items-center gap-2 pl-2 pr-1 bg-primaryGradient border-[0.6px] border-strokeGreyThree rounded-full">
                <span className="text-xs font-medium text-white">
                  TOTAL COMMISSION: {money(summary?.totalCommission ?? 0)}
                </span>
              </div>
            </div> */}
          </div>

          {/* Quick stats row (chips) */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Chip label="Total Payments" value={summary?.totalPayments ?? 0} />
            <Chip
              label="Commission Rate"
              value={`${Number(summary?.commissionRate ?? 0).toFixed(2)}%`}
            />
          </div>

          {/* ===== Table & states ===== */}
          <DataStateWrapper
            isLoading={loading}
            error={error}
            errorMessage="Failed to fetch commissions"
            refreshData={() => setPage((p) => p)}
            errorStates={null}
          >
            {rows.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-sm text-gray-500">
                No commissions found for the selected range.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F9FAFB] text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-left px-4 py-3">Transaction Ref</th>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3">Phone</th>
                      <th className="text-left px-4 py-3">Method</th>
                      <th className="text-right px-4 py-3">Amount</th>
                      <th className="text-right px-4 py-3">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-[#FAFAFA]">
                        <td className="px-4 py-3 whitespace-nowrap">{when(r.paymentDate)}</td>
                        <td className="px-4 py-3">{r.transactionRef}</td>
                        <td className="px-4 py-3">{r.customer?.name ?? "—"}</td>
                        <td className="px-4 py-3">{r.customer?.phone ?? "—"}</td>
                        <td className="px-4 py-3">{r.paymentMethod ?? "—"}</td>
                        <td className="px-4 py-3 text-right">{money(r.amount)}</td>
                        <td className="px-4 py-3 text-right">
                          {money(
                            typeof r.commissionAmount === "string"
                              ? parseFloat(r.commissionAmount)
                              : r.commissionAmount
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DataStateWrapper>

          {/* ===== Pagination footer ===== */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Showing {(rows.length && (page - 1) * limit + 1) || 0}–
              {(page - 1) * limit + rows.length} of {total.toLocaleString()}
            </div>
            <ListPagination
              totalItems={total}
              itemsPerPage={limit}
              currentPage={page}
              onPageChange={setPage}
              label="Commissions"
            />
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default AgentCommissions;
