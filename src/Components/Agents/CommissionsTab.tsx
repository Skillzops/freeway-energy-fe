import React, { useState } from "react";
import { useGetRequest } from "@/utils/useApiCall";
import { DataStateWrapper } from "@/Components/Loaders/DataStateWrapper";
import ListPagination from "@/Components/PaginationComponent/ListPagination";

type Props = { agentID: string };

const LIMITS = [10, 20, 50, 100];

const toISOStart = (d: string) =>
  d ? new Date(`${d}T00:00:00.000Z`).toISOString() : undefined;
const toISOEnd = (d: string) =>
  d ? new Date(`${d}T23:59:59.999Z`).toISOString() : undefined;

const money = (n: number | string) =>
  `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const when = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "");

const CommissionsTab: React.FC<Props> = ({ agentID }) => {
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Build query string
  const qs = (() => {
    const u = new URL("/x", "http://local");
    u.searchParams.set("page", String(page));
    u.searchParams.set("limit", String(limit));
    const s = toISOStart(start);
    const e = toISOEnd(end);
    if (s) u.searchParams.set("startDate", s);
    if (e) u.searchParams.set("endDate", e);
    return u.search;
  })();

  // Fetch
  const {
    data,
    isLoading,
    error,
    errorStates,
    mutate,
  } = useGetRequest(
    agentID ? `/v1/agents/${agentID}/commissions${qs}` : null,
    !!agentID,
    60000
  );

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const summary = data?.summary;

  if (page > totalPages && totalPages > 0) setPage(1);

  const clearFilters = () => {
    setStart("");
    setEnd("");
    setPage(1);
  };

  return (
    <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
      {/* Header controls (capsule style) */}
      <div className="w-full bg-saleGradient px-4 py-3 rounded-xl">
        <div className="flex items-center justify-between w-full h-[40px] rounded-full border-[0.6px] px-4 py-2 bg-paleGrayGradient border-strokeGreyThree">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="comm-start" className="text-xs font-medium text-textGrey">Start</label>
              <input
                id="comm-start"
                type="date"
                value={start}
                onChange={(e) => { setStart(e.target.value); setPage(1); }}
                className="text-xs font-medium text-textGrey pl-2 pr-2 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="comm-end" className="text-xs font-medium text-textGrey">End</label>
              <input
                id="comm-end"
                type="date"
                value={end}
                onChange={(e) => { setEnd(e.target.value); setPage(1); }}
                className="text-xs font-medium text-textGrey pl-2 pr-2 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full"
              />
            </div>
            <div className="relative flex w-max">
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="text-xs font-medium text-textGrey pl-2 pr-6 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full appearance-none"
                title="Items per page"
              >
                {LIMITS.map((n) => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium h-[28px] px-3 rounded-full border-[0.6px] border-strokeGreyThree bg-[#F6F8FA] text-textDarkGrey hover:bg-[#EEF1F4] transition"
            >
              Clear Filters
            </button>
          </div>

          <div className="flex items-center gap-2 pl-2 pr-1 bg-primaryGradient border-[0.6px] border-strokeGreyThree rounded-full">
            <span className="text-xs font-medium text-white">
              TOTAL COMMISSION: {money(summary?.totalCommission ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-full bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree text-[11px]">
          <span className="text-textGrey">Total Payments</span>
          <span className="font-semibold text-textBlack">{summary?.totalPayments ?? 0}</span>
        </div>
        <div className="flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-full bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree text-[11px]">
          <span className="text-textGrey">Commission Rate</span>
          <span className="font-semibold text-textBlack">
            {Number(summary?.commissionRate ?? 0).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Table */}
      <DataStateWrapper
        isLoading={!!isLoading}
        error={error}
        errorStates={errorStates}
        errorMessage="Failed to fetch commissions"
        refreshData={mutate}
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
                {rows.map((r: any) => (
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

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Showing {(rows.length && (page - 1) * limit + 1) || 0}–{(page - 1) * limit + rows.length} of{" "}
          {Number(total).toLocaleString()}
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
  );
};

export default CommissionsTab;
