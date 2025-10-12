import React, { useState, useMemo } from "react";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import searchIcon from "@/assets/search.svg";

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
    meta?: { total?: number };
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
  `text-[11px] font-semibold px-2 py-1 rounded-full border ${s === "PENDING"
    ? "bg-[#FFF4E5] text-[#B54708] border-[#FEDF89]"
    : s === "ASSIGNED"
      ? "bg-[#E8F5FF] text-[#1E66F5] border-[#B3DAFE]"
      : s === "COMPLETED"
        ? "bg-[#D1E7DD] text-[#0F5132] border-[#BADBCC]"
        : s === "REJECTED"
          ? "bg-[#F8D7DA] text-[#842029] border-[#F5C2C7]"
          : "bg-[#F0F1F3] text-[#3F3F46] border-[#E4E4E7]"
  }`;


  function normalize(data?: AnyTasksResponse) {
  let tasks: RawTask[] = [];
  let total = 0;
  let page = 1;
  let limit = 20;

  if (!data) return { tasks, total, page, limit };

  if (Array.isArray(data)) {
    tasks = data;
    total = data.length;
  } else {
    tasks =
      data.tasks ??
      data.data ??
      data.items ??
      data.list ??
      ([] as RawTask[]);
    total = data.total ?? data.count ?? data.meta?.total ?? tasks.length ?? 0;
    page = data.page ?? 1;
    limit = data.limit ?? 20;
  }

  return { tasks, total, page, limit };
}

function filterTasks(tasks: RawTask[], searchQuery: string): RawTask[] {
  if (!searchQuery.trim()) return tasks;

  const q = searchQuery.toLowerCase().trim();

  return tasks.filter((t) => {
    const customerName = t.customer
      ? `${t.customer.firstname ?? ""} ${t.customer.lastname ?? ""}`
        .trim()
        .toLowerCase()
      : "";

    const phone = t.customer?.phone?.toLowerCase() ?? "";
    const altPhone = t.customer?.alternatePhone?.toLowerCase() ?? "";

    const installationAddress = t.customer?.installationAddress?.toLowerCase() ?? "";
    const customerLocation = t.customer?.location?.toLowerCase() ?? "";
    const taskInstallationAddress = t.installationAddress?.toLowerCase() ?? "";
    const pickupLocation = t.pickupLocation?.toLowerCase() ?? "";

    const saleCategory = t.sale?.category?.toLowerCase() ?? "";
    const saleStatus = t.sale?.status?.toLowerCase() ?? "";

    const status = t.status.toLowerCase();
    const taskId = t.id.toLowerCase();

    const installerFirst = t.installerAgent?.user?.firstname?.toLowerCase() ?? "";
    const installerLast = t.installerAgent?.user?.lastname?.toLowerCase() ?? "";
    const installerFull = `${installerFirst} ${installerLast}`.trim();
    const installerAgentIdStr = t.installerAgent?.agentId
      ? String(t.installerAgent.agentId)
      : "";

    return (
      customerName.includes(q) ||
      phone.includes(q) ||
      altPhone.includes(q) ||
      installationAddress.includes(q) ||
      customerLocation.includes(q) ||
      taskInstallationAddress.includes(q) ||
      pickupLocation.includes(q) ||
      saleCategory.includes(q) ||
      saleStatus.includes(q) ||
      status.includes(q) ||
      taskId.includes(q) ||
      installerFirst.includes(q) ||
      installerLast.includes(q) ||
      installerFull.includes(q) ||
      installerAgentIdStr.includes(q)
    );
  });
}

const TasksTable: React.FC<TasksTableProps> = ({
  data,
  isLoading,
  error,
  refreshTable,
  paginationInfo,
  // setTableQueryParams, 
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    tasks: rawTasks,
    total: originalTotal,
    // page,
    limit,
  } = normalize(data);

  const filteredTasks = useMemo(
    () => filterTasks(rawTasks, searchQuery),
    [rawTasks, searchQuery]
  );

  const {
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  } = paginationInfo();

  const rowsPerPage = entriesPerPage || limit || 20;

  const total = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3">
        <div className="w-full sm:w-80">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <img src={searchIcon} alt="Search" className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by customer, phone, installer, address..."
              className="w-full h-[36px] pl-10 pr-3 bg-[#F9F9F9] border border-gray-200 rounded-3xl text-sm focus:outline-none focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Rows:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
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
            </tr>
          </thead>

          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-10">
                  <LoadingSpinner parentClass="w-full" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-red-600">
                  Failed to load tasks.
                </td>
              </tr>
            ) : paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-gray-500">
                  {searchQuery ? "No tasks match your search." : "No tasks found."}
                </td>
              </tr>
            ) : (
              paginatedTasks.map((t, idx) => {
                const sn = startIndex + idx + 1;

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
                const saleText = `${saleCat} • ${saleStatus} • ${shortId(
                  t.sale?.id || t.saleId
                )}`;

                const instFirst = t.installerAgent?.user?.firstname ?? "";
                const instLast = t.installerAgent?.user?.lastname ?? "";
                const installerName =
                  `${instFirst} ${instLast}`.trim() || "—";
                const installerAgentId =
                  t.installerAgent?.agentId != null ? `#${t.installerAgent.agentId}` : "";

                return (
                  <tr key={t.id} className="text-sm">
                    <td className="px-4 py-2 text-gray-700">{sn}</td>

                    <td className="px-4 py-3 font-medium text-[#1F2937]">
                      {name}
                    </td>

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

                    <td className="px-4 py-3">
                      {fmtCreatedDDMMYYYY(t.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          {searchQuery && (
            <span className="mr-2">
              Showing <span className="font-semibold">{total}</span> of{" "}
              <span className="font-semibold">{originalTotal}</span> tasks •{" "}
            </span>
          )}
          Page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span> •{" "}
          <span className="font-semibold">{total}</span> total
        </p>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Prev
          </button>
          <button
            className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksTable;

