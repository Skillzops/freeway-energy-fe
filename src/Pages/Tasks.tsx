import { useEffect, useMemo, useState } from "react";
import PageLayout from "./PageLayout";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import { PaginationType, Table } from "@/Components/TableComponent/Table";
import { NameTag, SimpleTag } from "@/Components/CardComponents/CardComponent";
import { useGetRequest } from "@/utils/useApiCall";
import taskBadge from "@/assets/RedIconsSvg/Reports.svg";
import pendingIcon from "@/assets/table/clock.svg";
import gradientsales from "@/assets/sales/gradientsales.svg";

type TaskStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | string;

type RawTask = {
  id: string;
  saleId?: string;
  status?: TaskStatus;
  scheduledDate?: string | null;
  createdAt?: string;
  progress?: number;
  customer?: {
    firstname?: string;
    lastname?: string;
  };
  sale?: {
    id?: string;
    category?: string;
    status?: string;
    paymentMode?: string;
    saleItems?: Array<{
      devices?: Array<{ serialNumber?: string; firmwareVersion?: string }>;
    }>;
  };
  requestingAgent?: {
    user?: {
      firstname?: string;
      lastname?: string;
    };
  };
  installerAgent?: {
    user?: {
      firstname?: string;
      lastname?: string;
    };
  };
};

type TaskEntry = {
  titleRef: string;
  sale: string;
  device: string;
  status: string;
  agent: string;
  installer: string;
  dueDate: string;
  progress: number;
};

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

const extractRows = (data: any): RawTask[] => {
  const directRows = data?.tasks ?? data?.items ?? data?.list;
  if (Array.isArray(data)) return data;
  if (Array.isArray(directRows)) return directRows;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.tasks)) return data.data.tasks;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.list)) return data.data.list;
  return [];
};

const extractTotal = (data: any) =>
  Number(
    data?.total ??
      data?.count ??
      data?.meta?.total ??
      data?.pagination?.total ??
      data?.data?.total ??
      data?.data?.count ??
      data?.data?.meta?.total ??
      data?.data?.pagination?.total ??
      extractRows(data)?.length ??
      0
  ) || 0;

const toCount = (data: any) => extractTotal(data);

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB");
};

const progressFromStatus = (task: RawTask) => {
  if (typeof task?.progress === "number") return Math.max(0, Math.min(100, task.progress));
  const status = task?.status?.toUpperCase?.() || "";
  if (status === "COMPLETED") return 100;
  if (status === "IN_PROGRESS") return 60;
  if (status === "ACCEPTED") return 40;
  if (status === "PENDING") return 20;
  return 0;
};

const statusColor = (status: string) => {
  const s = status?.toUpperCase?.() || "";
  if (s === "COMPLETED") return "#00AF50";
  if (s === "PENDING") return "#E4951B";
  if (s === "IN_PROGRESS" || s === "ACCEPTED") return "#3D6AB2";
  if (s === "REJECTED" || s === "CANCELLED") return "#FC4C5D";
  return "#9BA4BA";
};

const generateTaskEntries = (data: any): TaskEntry[] => {
  const rows: RawTask[] = extractRows(data);

  return rows.map((task: RawTask) => {
    const titleRef = task?.sale?.id || task?.saleId || task?.id || "—";
    const customerName = `${task?.customer?.firstname || ""} ${task?.customer?.lastname || ""}`.trim() || "—";

    const saleRef = task?.sale?.id || task?.saleId || "—";
    const saleMeta = [task?.sale?.category, task?.sale?.paymentMode || task?.sale?.status]
      .filter(Boolean)
      .join(" · ");

    const firstDevice = task?.sale?.saleItems?.[0]?.devices?.[0]?.serialNumber || "—";
    const firstFirmware = task?.sale?.saleItems?.[0]?.devices?.[0]?.firmwareVersion || "";

    const agentName =
      `${task?.requestingAgent?.user?.firstname || ""} ${task?.requestingAgent?.user?.lastname || ""}`.trim() ||
      "—";
    const installerName =
      `${task?.installerAgent?.user?.firstname || ""} ${task?.installerAgent?.user?.lastname || ""}`.trim() ||
      "—";

    return {
      titleRef: `${titleRef}\n${customerName}`,
      sale: `${saleRef}${saleMeta ? `\n${saleMeta}` : ""}`,
      device: `${firstDevice}${firstFirmware ? `\n${firstFirmware}` : ""}`,
      status: task?.status || "—",
      agent: agentName,
      installer: installerName,
      dueDate: formatDate(task?.scheduledDate || task?.createdAt),
      progress: progressFromStatus(task),
    };
  });
};

const Tasks = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [tableQueryParams, setTableQueryParams] = useState<Record<string, any> | null>({});
  const [queryValue, setQueryValue] = useState("");
  const [isSearchQuery, setIsSearchQuery] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedInstallerId, setSelectedInstallerId] = useState<string | null>(null);
  const [selectedSortField, setSelectedSortField] = useState("createdAt");
  const [selectedSortOrder, setSelectedSortOrder] = useState("desc");

  const [agentKeyword, setAgentKeyword] = useState("");
  const [installerKeyword, setInstallerKeyword] = useState("");
  const debouncedAgentKeyword = useDebouncedValue(agentKeyword, 300);
  const debouncedInstallerKeyword = useDebouncedValue(installerKeyword, 300);

  const queryString = Object.entries(tableQueryParams || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const {
    data: tasksData,
    isLoading,
    mutate: refreshTasks,
  } = useGetRequest(
    `/v1/tasks?page=${currentPage}&limit=${entriesPerPage}${queryString ? `&${queryString}` : ""}`,
    true,
    60000
  );

  const totalReq = useGetRequest(`/v1/tasks?page=1&limit=1`, true, 60000);
  const pendingReq = useGetRequest(`/v1/tasks?page=1&limit=1&status=PENDING`, true, 60000);
  const inProgressReq = useGetRequest(`/v1/tasks?page=1&limit=1&status=IN_PROGRESS`, true, 60000);
  const completedReq = useGetRequest(`/v1/tasks?page=1&limit=1&status=COMPLETED`, true, 60000);

  const salesAgentsReq = useGetRequest(
    `/v1/agents?category=SALES&limit=50&search=${encodeURIComponent(debouncedAgentKeyword.trim())}`,
    true,
    60000
  );
  const installersReq = useGetRequest(
    `/v1/agents?category=INSTALLER&limit=50&search=${encodeURIComponent(debouncedInstallerKeyword.trim())}`,
    true,
    60000
  );

  const salesAgents = useMemo(() => salesAgentsReq?.data?.agents || salesAgentsReq?.data?.data || [], [salesAgentsReq?.data]);
  const installers = useMemo(() => installersReq?.data?.agents || installersReq?.data?.data || [], [installersReq?.data]);

  const agentOptions = useMemo(() => {
    return salesAgents
      .map((agent: any) => ({
        id: agent?.id,
        label: `${agent?.user?.firstname || ""} ${agent?.user?.lastname || ""}`.trim() || agent?.id,
      }))
      .filter((item: any) => item.id);
  }, [salesAgents]);

  const installerOptions = useMemo(() => {
    return installers
      .map((agent: any) => ({
        id: agent?.id,
        label: `${agent?.user?.firstname || ""} ${agent?.user?.lastname || ""}`.trim() || agent?.id,
      }))
      .filter((item: any) => item.id);
  }, [installers]);

  const clearFilters = () => {
    setTableQueryParams({});
    setQueryValue("");
    setIsSearchQuery(false);
    setSelectedStatus("");
    setSelectedAgentId(null);
    setSelectedInstallerId(null);
    setSelectedSortField("createdAt");
    setSelectedSortOrder("desc");
    setAgentKeyword("");
    setInstallerKeyword("");
    setCurrentPage(1);
  };

  const filterList: any[] = [
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setCurrentPage(1);
        setTableQueryParams((prev) => ({ ...(prev || {}), search: query || undefined }));
      },
      isSearch: true,
    },
    {
      name: selectedStatus || "Status",
      items: ["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"],
      onClickLink: async (index: number) => {
        const selected = ["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"][index];
        setSelectedStatus(selected);
        setCurrentPage(1);
        setTableQueryParams((prev) => ({ ...(prev || {}), status: selected }));
      },
    },
    {
      name:
        selectedAgentId && agentOptions.length
          ? agentOptions.find((o: any) => o.id === selectedAgentId)?.label || "Agents"
          : "Agents",
      items: agentOptions.map((o: any) => o.label),
      title: "Sales Agents",
      searchable: true,
      searchPlaceholder: "Type then click 🔍",
      searchMode: "api",
      onDropdownSearch: (keyword: string) => setAgentKeyword(keyword),
      isLoading: salesAgentsReq?.isLoading,
      onClickLink: async (index: number) => {
        const selected = agentOptions[index];
        if (!selected) return;
        setSelectedAgentId(selected.id);
        setCurrentPage(1);
        setTableQueryParams((prev) => ({ ...(prev || {}), agentId: selected.id }));
      },
    },
    {
      name:
        selectedInstallerId && installerOptions.length
          ? installerOptions.find((o: any) => o.id === selectedInstallerId)?.label || "Installers"
          : "Installers",
      items: installerOptions.map((o: any) => o.label),
      title: "Installers",
      searchable: true,
      searchPlaceholder: "Type then click 🔍",
      searchMode: "api",
      onDropdownSearch: (keyword: string) => setInstallerKeyword(keyword),
      isLoading: installersReq?.isLoading,
      onClickLink: async (index: number) => {
        const selected = installerOptions[index];
        if (!selected) return;
        setSelectedInstallerId(selected.id);
        setCurrentPage(1);
        setTableQueryParams((prev) => ({ ...(prev || {}), installerId: selected.id }));
      },
    },
    {
      name: "Due Date",
      isDate: true,
      onDateClick: (startDate: string, endDate?: string) => {
        setCurrentPage(1);
        setTableQueryParams((prev) => ({
          ...(prev || {}),
          dueDateFrom: startDate,
          dueDateTo: endDate || startDate,
        }));
      },
    },
    {
      name:
        selectedSortField === "createdAt"
          ? "Sort: Created Date"
          : selectedSortField === "scheduledDate"
          ? "Sort: Due Date"
          : "Sort: Status",
      items: ["Created Date", "Due Date", "Status"],
      onClickLink: async (index: number) => {
        const mapping = ["createdAt", "scheduledDate", "status"];
        const selected = mapping[index] || "createdAt";
        setSelectedSortField(selected);
        setCurrentPage(1);
        setTableQueryParams((prev) => ({ ...(prev || {}), sortField: selected }));
      },
    },
    {
      name: selectedSortOrder === "asc" ? "Order: Ascending" : "Order: Descending",
      items: ["Descending", "Ascending"],
      onClickLink: async (index: number) => {
        const selected = index === 1 ? "asc" : "desc";
        setSelectedSortOrder(selected);
        setCurrentPage(1);
        setTableQueryParams((prev) => ({ ...(prev || {}), sortOrder: selected }));
      },
    },
  ];

  const columnList: any[] = [
    {
      title: "TITLE/REF",
      key: "titleRef",
      valueIsAComponent: true,
      customValue: (value: string) => {
        const [title, sub] = String(value || "").split("\n");
        return (
          <div>
            <p className="text-[14px] font-semibold text-textBlack">{title || "—"}</p>
            <p className="text-xs text-textLightGrey">{sub || "—"}</p>
          </div>
        );
      },
    },
    {
      title: "SALE",
      key: "sale",
      valueIsAComponent: true,
      customValue: (value: string) => {
        const [title, sub] = String(value || "").split("\n");
        return (
          <div>
            <p className="text-[14px] font-semibold text-textBlack">{title || "—"}</p>
            <p className="text-xs text-textLightGrey">{sub || "—"}</p>
          </div>
        );
      },
    },
    {
      title: "DEVICE",
      key: "device",
      valueIsAComponent: true,
      customValue: (value: string) => {
        const [title, sub] = String(value || "").split("\n");
        return (
          <div>
            <p className="text-[14px] font-semibold text-textBlack">{title || "—"}</p>
            <p className="text-xs text-textLightGrey">{sub || ""}</p>
          </div>
        );
      },
    },
    {
      title: "STATUS",
      key: "status",
      valueIsAComponent: true,
      customValue: (value: string) => (
        <SimpleTag
          text={value || "—"}
          dotColour={statusColor(value || "")}
          containerClass={`font-medium ${statusColor(value || "")}`}
        />
      ),
    },
    {
      title: "AGENT",
      key: "agent",
      valueIsAComponent: true,
      customValue: (value: string) => <NameTag name={value || "—"} />,
    },
    {
      title: "INSTALLER",
      key: "installer",
      valueIsAComponent: true,
      customValue: (value: string) => <NameTag name={value || "—"} />,
    },
    {
      title: "DUE DATE",
      key: "dueDate",
      valueIsAComponent: true,
      customValue: (value: string) => (
        <p className="flex items-center justify-center bg-[#F6F8FA] px-2 py-1 w-max border-[0.4px] border-strokeGreyTwo rounded-full text-xs text-textDarkGrey font-semibold">
          {value || "—"}
        </p>
      ),
    },
    {
      title: "PROGRESS",
      key: "progress",
      valueIsAComponent: true,
      customValue: (value?: number) => {
        const progress = typeof value === "number" ? value : 0;
        const color = progress >= 100 ? "bg-[#76D99A]" : progress > 0 ? "bg-[#FF6363]" : "bg-[#D6DBE6]";
        return (
          <div className="w-[170px] h-[24px] rounded-full bg-[#ECEEF3] overflow-hidden relative">
            <div className={`h-full ${color}`} style={{ width: `${progress}%` }} />
            <span className="absolute inset-y-0 right-2.5 flex items-center text-[11px] font-semibold text-textBlack">
              {progress}%
            </span>
          </div>
        );
      },
    },
  ];

  const paginationInfo: PaginationType = () => ({
    total: extractTotal(tasksData),
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  });

  return (
    <PageLayout pageName="Tasks" badge={taskBadge}>
      <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
        <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
          <TitlePill icon={taskBadge} iconBgColor="bg-[#E3FAD6]" topText="Total" bottomText="TASKS" value={toCount(totalReq?.data)} />
          <TitlePill icon={pendingIcon} iconBgColor="bg-[#FDEEC2]" topText="Pending" bottomText="TASKS" value={toCount(pendingReq?.data)} />
          <TitlePill icon={gradientsales} iconBgColor="bg-[#FDEEC2]" topText="In Progress" bottomText="TASKS" value={toCount(inProgressReq?.data)} />
          <TitlePill icon={taskBadge} iconBgColor="bg-[#E3FAD6]" topText="Completed" bottomText="TASKS" value={toCount(completedReq?.data)} />
        </div>
      </section>

      <div className="flex flex-col w-full px-2 py-8 md:p-8">
        <Table
          showHeader
          tableTitle="ALL TASKS"
          tableTitleClassname="text-[12px] md:text-[13px] tracking-[0.2px]"
          filterList={filterList}
          columnList={columnList}
          tableData={generateTaskEntries(tasksData)}
          loading={isLoading}
          refreshTable={refreshTasks}
          paginationInfo={paginationInfo}
          queryValue={isSearchQuery ? queryValue : ""}
          clearFilters={clearFilters}
        />
      </div>
    </PageLayout>
  );
};

export default Tasks;
