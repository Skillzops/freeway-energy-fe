import React, { useState, useMemo, useEffect, useRef } from "react";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import searchIcon from "@/assets/search.svg";
import { IoClose } from "react-icons/io5";
import { FiCopy } from "react-icons/fi";



const MAX_INLINE_TOKENS = 0;

export type RawTask = {
  id: string;
  installerAgentId: string | null;
  requestingAgentId: string;
  saleId: string;
  customerId: string;
  pickupLocation: string | null;
  installationAddress: string | null;
  scheduledDate: string | null;
  status: "PENDING" | "ASSIGNED" | "COMPLETED" | "REJECTED" | string;
  createdAt: string;
  updatedAt: string;
  description?: string | null;

  customer?: {
    id: string;
    firstname: string;
    lastname: string;
    phone: string;
    alternatePhone?: string | null;
    installationAddress?: string | null;
    location?: string | null;
  };

  sale?: {
    id: string;
    category: string;
    status: string;
    saleItems?: Array<{
      id: string;
      devices?: Array<{
        id: string;
        serialNumber?: string;
        tokens?: Array<{
          id: string;
          token: string;
          duration?: number;
          tokenReleased?: boolean;
          createdAt?: string;
        }>;
      }>;
    }>;
  };

  installerAgent?: {
    id: string;
    agentId: number;
    category: string;
    user?: {
      id: string;
      firstname: string;
      lastname: string;
      email?: string;
    };
  };
};

type AnyTasksResponse =
  | RawTask[]
  | {
      tasks?: RawTask[];
      data?: RawTask[];
      items?: RawTask[];
      list?: RawTask[];
      total?: number;
      count?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
      meta?: { total?: number; page?: number; limit?: number; totalPages?: number };
    };

type TasksTableProps = {
  data?: AnyTasksResponse;
  isLoading: boolean;
  error: any;
  refreshTable: () => void;
  paginationInfo: () => {
    total?: number;
    currentPage: number;
    entriesPerPage: number;
    setCurrentPage: (n: number) => void;
    setEntriesPerPage: (n: number) => void;
  };
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
};

function fmtCreatedDDMMYYYY(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d ?? "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}, ${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

function shortId(id?: string) {
  if (!id) return "—";
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

const badgeClass = (s: string) =>
  `text-[11px] font-semibold px-2 py-1 rounded-full border ${
    s === "PENDING"
      ? "bg-[#FFF4E5] text-[#B54708] border-[#FEDF89]"
      : s === "ASSIGNED"
      ? "bg-[#E8F5FF] text-[#1E66F5] border-[#B3DAFE]"
      : s === "COMPLETED"
      ? "bg-[#D1E7DD] text-[#0F5132] border-[#BADBCC]"
      : s === "REJECTED"
      ? "bg-[#F8D7DA] text-[#842029] border-[#F5C2C7]"
      : "bg-[#F0F1F3] text-[#3F3F46] border-[#E4E4E7]"
  }`;

/** Gather all tokens across all sale items & devices; newest first */
function collectTokens(task: RawTask) {
  const items = task.sale?.saleItems ?? [];
  const tokens =
    items.flatMap((si) =>
      (si.devices ?? []).flatMap((d) =>
        (d.tokens ?? []).map((t) => ({
          ...t,
          deviceId: d.id,
          serialNumber: d.serialNumber,
        }))
      )
    ) ?? [];

  return tokens.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

/** Normalize to read server pagination fields only */
function normalize(data?: AnyTasksResponse) {
  let tasks: RawTask[] = [];
  let total = 0;
  let page = 1;
  let limit = 20;
  let totalPages: number | undefined;

  if (!data) return { tasks, total, page, limit, totalPages };

  if (Array.isArray(data)) {
    tasks = data;
    total = data.length;
    totalPages = 1;
  } else {
    tasks = data.tasks ?? data.data ?? data.items ?? data.list ?? [];
    total = data.total ?? data.count ?? data.meta?.total ?? tasks.length ?? 0;
    page = data.page ?? data.meta?.page ?? 1;
    limit = data.limit ?? data.meta?.limit ?? 20;
    totalPages = data.totalPages ?? data.meta?.totalPages;
    if (!totalPages && total && limit) totalPages = Math.max(1, Math.ceil(total / limit));
  }

  return { tasks, total, page, limit, totalPages };
}

/** Modal to view all tokens */
function TokensModal({
  isOpen,
  onClose,
  title,
  tokens,
  onCopy,
  copiedTokenId,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tokens: Array<{
    id: string;
    token: string;
    duration?: number;
    tokenReleased?: boolean;
    createdAt?: string;
    serialNumber?: string;
  }>;
  onCopy: (id: string, value: string) => void;
  copiedTokenId: string | null;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-3" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
            <IoClose className="text-xl" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto p-4">
          {tokens.length === 0 ? (
            <p className="text-sm text-gray-500">No tokens found.</p>
          ) : (
            <div className="space-y-2">
              {tokens.map((tk) => (
                <div key={tk.id} className="grid grid-cols-3 items-center gap-2 px-2.5 py-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm tracking-wide">{tk.token}</span>
                    <button
                      type="button"
                      onClick={() => onCopy(tk.id, tk.token)}
                      className="inline-flex items-center justify-center rounded border px-1.5 py-1 text-xs hover:bg-gray-50"
                      title={`Copy ${tk.token}`}
                      aria-label={`Copy token ${tk.token}`}
                    >
                      <FiCopy className="text-[14px]" />
                    </button>
                    {copiedTokenId === tk.id && <span className="text-[10px] text-green-600">Copied!</span>}
                  </div>

                  <div className="text-xs">
                    {typeof tk.duration === "number" ? (tk.duration > 0 ? `${tk.duration} days` : `${tk.duration}`) : "—"}
                  </div>

                  <div className="text-right text-xs text-gray-600">
                    {tk.serialNumber ? `${tk.serialNumber} • ` : ""}
                    {tk.tokenReleased ? "Released" : "Pending"}
                    {tk.createdAt ? ` • ${new Date(tk.createdAt).toLocaleString()}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

const TasksTable: React.FC<TasksTableProps> = ({
  data,
  isLoading,
  error,
  refreshTable,
  paginationInfo,
  setTableQueryParams,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTokens, setModalTokens] = useState<ReturnType<typeof collectTokens>>([]);
  const [modalTitle, setModalTitle] = useState("All Tokens");
  const debounceRef = useRef<number | null>(null);

  const { tasks, total, page: serverPage, limit: serverLimit, totalPages } = useMemo(
    () => normalize(data),
    [data]
  );

  const {
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  } = paginationInfo();

  // Mirror server page/limit to the local UI state (display only)
  useEffect(() => {
    if (serverPage && serverPage !== currentPage) setCurrentPage(serverPage);
    if (serverLimit && serverLimit !== entriesPerPage) setEntriesPerPage(serverLimit);
  }, [currentPage, entriesPerPage, serverPage, serverLimit, setCurrentPage, setEntriesPerPage]);

  // Server search: debounce -> push q, reset to page 1 (parent fetches)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setCurrentPage(1);
      setTableQueryParams((prev) => ({
        ...(prev || {}),
        q: searchQuery.trim() || undefined,
      }));
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchQuery, setCurrentPage, setTableQueryParams]);

  const openTokensModal = (task: RawTask, tokens: ReturnType<typeof collectTokens>) => {
    setModalTokens(tokens);
    const name = task.customer
      ? `${task.customer.firstname ?? ""} ${task.customer.lastname ?? ""}`.trim()
      : "";
    const saleShort = shortId(task.sale?.id || task.saleId);
    setModalTitle(`Tokens • ${name || "Customer"} • Sale ${saleShort}`);
    setModalOpen(true);
  };

  const handleCopy = async (id: string, value: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedTokenId(id);
      setTimeout(() => setCopiedTokenId(null), 1200);
    } catch {
      setCopiedTokenId(null);
    }
  };

  // Server-driven rows
  const rows = tasks;
  const rowsPerPage = serverLimit || entriesPerPage || 20;
  const snBase = ((serverPage ?? 1) - 1) * rowsPerPage;

  return (
    <div className="flex flex-col w-full">
      {/* Search & controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3">
        <div className="w-full sm:w-80">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <img src={searchIcon} alt="Search" className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage(1);
                  setTableQueryParams((prev) => ({
                    ...(prev || {}),
                    q: searchQuery.trim() || undefined,
                  }));
                }
              }}
              placeholder="Search by customer, phone, installer, address, token..."
              className="w-full h-[36px] pl-10 pr-3 bg-[#F9F9F9] border border-gray-200 rounded-3xl text-sm focus:outline-none focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Rows:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              const next = Math.max(1, Number(e.target.value) || 20);
              setCurrentPage(1);
              setEntriesPerPage(next); // parent request URL will include it
            }}
            className="h-[32px] px-2 border rounded-md text-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            className="ml-2 px-3 h-[32px] rounded-md border text-sm"
            type="button"
            onClick={refreshTable}
            title="Reload tasks from server"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto border border-gray-200 rounded-xl">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr className="text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">S/N</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Sale</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Installer Agent</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Token</th>
            </tr>
          </thead>

        <tbody className="divide-y">
          {isLoading ? (
            <tr>
              <td colSpan={9} className="py-10">
                <LoadingSpinner parentClass="w-full" />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-sm text-red-600">
                Failed to load tasks.
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-sm text-gray-500">
                No tasks found.
              </td>
            </tr>
          ) : (
            rows.map((t, idx) => {
              const sn = snBase + idx + 1;

              const name = t.customer
                ? `${t.customer.firstname ?? ""} ${t.customer.lastname ?? ""}`.trim() || "—"
                : "—";

              const phone = t.customer?.phone ?? "—";

              const address =
                t.customer?.installationAddress?.trim() ||
                t.customer?.location?.trim() ||
                t.installationAddress?.trim() ||
                t.pickupLocation?.trim() ||
                "—";

              const saleCat = t.sale?.category ?? "—";
              const saleStatus = t.sale?.status ?? "—";
              const saleText = `${saleCat} • ${saleStatus} • ${shortId(t.sale?.id || t.saleId)}`;

              const instFirst = t.installerAgent?.user?.firstname ?? "";
              const instLast = t.installerAgent?.user?.lastname ?? "";
              const installerName = `${instFirst} ${instLast}`.trim() || "—";
              const installerAgentId =
                t.installerAgent?.agentId != null ? `#${t.installerAgent.agentId}` : "";

              const tokens = collectTokens(t);
              const inline = tokens.slice(0, MAX_INLINE_TOKENS);
              const remaining = tokens.length - inline.length;

              return (
                <tr key={t.id} className="text-sm">
                  <td className="px-4 py-2 text-gray-700">{sn}</td>

                  <td className="px-4 py-3 font-medium text-[#1F2937]">{name}</td>

                  <td className="px-4 py-3">
                    {phone !== "—" ? (
                      <a className="text-[#2D72D2] underline" href={`tel:${phone}`}>
                        {phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-3 max-w-[360px]">
                    <span className="block truncate" title={address}>
                      {address}
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-[240px]">
                    <span className="block truncate text-[13px]" title={saleText}>
                      {saleText}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={badgeClass(t.status)}>{t.status}</span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-gray-800">{installerName}</div>
                    {installerAgentId && (
                      <div className="text-xs text-gray-500">{installerAgentId}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">{fmtCreatedDDMMYYYY(t.createdAt)}</td>

                  <td className="px-4 py-3">
                    {tokens.length === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {inline.map((tk) => (
                          <span
                            key={tk.id}
                            className="inline-flex items-center gap-1 border border-gray-200 rounded-md px-2 py-[3px] text-[12px] bg-white"
                            title={
                              tk.createdAt
                                ? `Created: ${new Date(tk.createdAt).toLocaleString()}${
                                    tk.duration ? ` • ${tk.duration} days` : ""
                                  }${tk.serialNumber ? ` • ${tk.serialNumber}` : ""}`
                                : tk.duration
                                ? `${tk.duration} days`
                                : undefined
                            }
                          >
                            <span className="font-mono tracking-wide">{tk.token}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(tk.id, tk.token)}
                              className="inline-flex items-center justify-center rounded hover:bg-gray-50 transition p-0.5"
                              title={`Copy ${tk.token}`}
                              aria-label={`Copy token ${tk.token}`}
                            >
                              <FiCopy className="text-[14px]" />
                            </button>
                            {copiedTokenId === tk.id && (
                              <span className="text-[10px] text-green-600 ml-1">Copied!</span>
                            )}
                          </span>
                        ))}

                        {/* View all button */}
                        {remaining > 0 && (
                          <button
                            type="button"
                            onClick={() => openTokensModal(t, tokens)}
                            className="text-xs px-2 py-[5px] rounded-md border hover:bg-gray-50"
                            title={`View all ${tokens.length} tokens`}
                          >
                            View all tokens (+{remaining})
                          </button>
                        )}
                        {remaining <= 0 && tokens.length > MAX_INLINE_TOKENS && (
                          <button
                            type="button"
                            onClick={() => openTokensModal(t, tokens)}
                            className="text-xs px-2 py-[5px] rounded-md border hover:bg-gray-50"
                            title={`View all ${tokens.length} tokens`}
                          >
                            View all tokens
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        </table>
      </div>

      {/* Footer strictly uses server totals */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Page <span className="font-semibold">{serverPage ?? 1}</span> of{" "}
          <span className="font-semibold">{totalPages ?? 1}</span> •{" "}
          <span className="font-semibold">{total ?? 0}</span> total
        </p>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            onClick={() => setCurrentPage(Math.max(1, (serverPage ?? 1) - 1))}
            disabled={(serverPage ?? 1) <= 1}
          >
            Prev
          </button>
          <button
            className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            onClick={() => setCurrentPage(Math.min(totalPages ?? 1, (serverPage ?? 1) + 1))}
            disabled={(serverPage ?? 1) >= (totalPages ?? 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Tokens modal */}
      <TokensModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        tokens={modalTokens}
        onCopy={handleCopy}
        copiedTokenId={copiedTokenId}
      />
    </div>
  );
};

export default TasksTable;
