import { useEffect, useMemo, useState } from "react";
import PageLayout from "./PageLayout";
import settingsbadge from "@/assets/settings/settingsbadge.png";
import inventorygradient from "@/assets/inventory/inventorygradient.svg";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import { Table, PaginationType } from "@/Components/TableComponent/Table";
import { DateTimeTag } from "@/Components/CardComponents/CardComponent";
import SecondaryModal from "@/Components/ModalSecondary/SecondaryModal";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { ErrorComponent } from "./ErrorPage";

type QueueSummary = {
  queue: string;
  count: number;
};

type GroupedReason = {
  reason: string;
  count: number;
};

type FailedJobRow = {
  no: number;
  id: string;
  name: string;
  failedAt?: string;
  reason: string;
  attempts: number;
  queue: string;
  raw: any;
};

type BulkActionType = "refresh" | "retryAll" | "cleanup" | "removeAll" | null;

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const pickFirstNumber = (...values: unknown[]): number => {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const unwrapPayload = (value: any): any => {
  if (value && typeof value === "object") {
    if (value.data !== undefined) return value.data;
    if (value.result !== undefined) return value.result;
    if (value.results !== undefined) return value.results;
  }
  return value;
};

const getArrayFromPayload = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const candidates = [
    value.items,
    value.jobs,
    value.failedJobs,
    value.results,
    value.records,
    value.queues,
    value.queueStats,
    value.stats,
    value.groups,
    value.reasons,
    value.list,
    value.rows,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

const normalizeQueueStats = (input: any): QueueSummary[] => {
  const payload = unwrapPayload(input);
  const statsArray = getArrayFromPayload(payload);

  if (statsArray.length > 0) {
    const queueMap = new Map<string, number>();

    statsArray.forEach((item: any) => {
      const queueName =
        item?.queue ??
        item?.queueName ??
        item?.name ??
        item?.id ??
        item?.key;
      if (!queueName) return;

      const count = pickFirstNumber(
        item?.count,
        item?.failed,
        item?.failedJobs,
        item?.failedJobsCount,
        item?.failedCount,
        item?.total,
        item?.value
      );

      const normalizedQueue = String(queueName);
      const current = queueMap.get(normalizedQueue) ?? 0;
      queueMap.set(normalizedQueue, Math.max(current, count));
    });

    return Array.from(queueMap.entries())
      .map(([queue, count]) => ({ queue, count }))
      .sort((a, b) => b.count - a.count || a.queue.localeCompare(b.queue));
  }

  if (!payload || typeof payload !== "object") return [];

  const excludedKeys = new Set([
    "count",
    "total",
    "totalCount",
    "totalFailedJobs",
    "failedJobsCount",
    "page",
    "limit",
    "meta",
    "pagination",
  ]);

  return Object.entries(payload)
    .filter(([key]) => !excludedKeys.has(key))
    .map(([key, value]) => {
      if (typeof value === "number") return { queue: key, count: toNumber(value) };
      if (value && typeof value === "object") {
        return {
          queue: String((value as any).queue ?? (value as any).name ?? key),
          count: pickFirstNumber(
            (value as any).count,
            (value as any).failed,
            (value as any).failedJobs,
            (value as any).failedJobsCount,
            (value as any).failedCount,
            (value as any).total,
            (value as any).value
          ),
        };
      }
      return { queue: key, count: 0 };
    })
    .filter((item) => item.queue && item.queue !== "data");
};

const normalizeGroupedReasons = (input: any): GroupedReason[] => {
  const payload = unwrapPayload(input);
  const grouped = getArrayFromPayload(payload);

  return grouped
    .map((item: any) => {
      const reason =
        item?.reason ??
        item?.failureReason ??
        item?.name ??
        item?._id ??
        "Unknown reason";
      const count = pickFirstNumber(
        item?.count,
        item?.total,
        item?.failedJobs,
        item?.jobsCount,
        item?.value
      );

      return { reason: String(reason), count };
    })
    .filter((item) => item.reason);
};

const normalizeFailedJobs = (
  input: any,
  currentPage: number,
  entriesPerPage: number,
  queue: string
): { rows: FailedJobRow[]; total: number } => {
  const payload = unwrapPayload(input);
  const jobs = getArrayFromPayload(payload);

  const total = pickFirstNumber(
    payload?.total,
    payload?.count,
    payload?.totalCount,
    payload?.meta?.total,
    payload?.pagination?.total,
    payload?.allRecordsCount,
    jobs.length
  );

  const rows = jobs.map((item: any, index: number) => {
    const serial = (currentPage - 1) * entriesPerPage + index + 1;
    const id = String(
      item?.id ?? item?._id ?? item?.jobId ?? item?.jobID ?? item?.jid ?? serial
    );

    const reasonValue =
      item?.reason ??
      item?.failedReason ??
      item?.failureReason ??
      item?.error ??
      item?.message ??
      item?.stacktrace ??
      item?.stack ??
      item?.data?.error ??
      item?.data?.message ??
      "N/A";

    const reason =
      typeof reasonValue === "string"
        ? reasonValue
        : JSON.stringify(reasonValue ?? "N/A");

    return {
      no: serial,
      id,
      name: String(
        item?.name ??
          item?.jobName ??
          item?.taskName ??
          item?.processName ??
          item?.data?.name ??
          "N/A"
      ),
      failedAt:
        item?.failedAt ??
        item?.timestamp ??
        item?.createdAt ??
        item?.failed_at,
      reason,
      attempts: pickFirstNumber(
        item?.attempts,
        item?.attempt,
        item?.retryCount,
        item?.attemptCount,
        item?.tries,
        item?.data?.attempts
      ),
      queue,
      raw: item,
    };
  });

  return { rows, total };
};

const extractCountValue = (input: any): number => {
  const payload = unwrapPayload(input);
  return pickFirstNumber(
    payload,
    payload?.count,
    payload?.failed,
    payload?.total,
    payload?.totalCount,
    payload?.failedJobs,
    payload?.failedJobsCount,
    payload?.queueFailedJobs,
    payload?.data?.count,
    payload?.data?.total,
    payload?.data?.failedJobs,
    payload?.data?.failedJobsCount
  );
};

const stringifyDetails = (value: any): string => {
  if (value === undefined || value === null) return "No details available.";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const buttonBaseClass =
  "h-[30px] px-3 rounded-full text-xs border transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

const FailedJobs = () => {
  const { apiCall } = useApiCall();
  const [selectedQueue, setSelectedQueue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [bulkActionLoading, setBulkActionLoading] = useState<BulkActionType>(null);

  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsQueue, setDetailsQueue] = useState<string>("");
  const [detailsJobId, setDetailsJobId] = useState<string>("");
  const [detailsPayload, setDetailsPayload] = useState<any>(null);

  const {
    data: countData,
    isLoading: countLoading,
    mutate: mutateCount,
  } = useGetRequest("/v1/failed-jobs/count", true, 60000);

  const {
    data: allQueuesStatsData,
    isLoading: allQueuesStatsLoading,
    mutate: mutateAllQueuesStats,
  } = useGetRequest("/v1/failed-jobs/stats/all", true, 60000);

  const queueStats = useMemo(
    () => normalizeQueueStats(allQueuesStatsData),
    [allQueuesStatsData]
  );

  useEffect(() => {
    if (queueStats.length === 0) return;
    if (!selectedQueue) {
      setSelectedQueue(queueStats[0].queue);
      return;
    }
    if (!queueStats.some((item) => item.queue === selectedQueue)) {
      setSelectedQueue(queueStats[0].queue);
    }
  }, [queueStats, selectedQueue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedQueue]);

  const encodedQueue = encodeURIComponent(selectedQueue);

  const {
    data: queueStatsData,
    mutate: mutateQueueStats,
  } = useGetRequest(
    selectedQueue ? `/v1/failed-jobs/stats/${encodedQueue}` : null,
    true,
    60000
  );

  const {
    data: groupedReasonData,
    mutate: mutateGroupedReasons,
  } = useGetRequest(
    selectedQueue
      ? `/v1/failed-jobs/${encodedQueue}/grouped-by-reason`
      : null,
    true,
    60000
  );

  const {
    data: failedJobsData,
    isLoading: failedJobsLoading,
    mutate: mutateFailedJobs,
    error: failedJobsError,
    errorStates: failedJobsErrorStates,
  } = useGetRequest(
    selectedQueue
      ? `/v1/failed-jobs/${encodedQueue}?page=${currentPage}&limit=${entriesPerPage}`
      : null,
    true,
    60000
  );

  const groupedReasons = useMemo(
    () => normalizeGroupedReasons(groupedReasonData),
    [groupedReasonData]
  );

  const groupedReasonTotal = useMemo(
    () => groupedReasons.reduce((sum, item) => sum + toNumber(item.count), 0),
    [groupedReasons]
  );

  const selectedQueueCount = useMemo(() => {
    const queueStatsPayload = unwrapPayload(queueStatsData);
    const hasQueueStatsPayload =
      queueStatsPayload !== undefined && queueStatsPayload !== null;
    if (hasQueueStatsPayload) {
      return extractCountValue(queueStatsData);
    }

    const countFromAllStats =
      queueStats.find((item) => item.queue === selectedQueue)?.count ?? 0;
    return countFromAllStats || groupedReasonTotal;
  }, [queueStatsData, queueStats, selectedQueue, groupedReasonTotal]);

  const totalFailedJobs = useMemo(() => {
    const countPayload = unwrapPayload(countData);
    const hasCountPayload =
      countPayload !== undefined && countPayload !== null;
    if (hasCountPayload) {
      return extractCountValue(countData);
    }

    const allStatsPayload = unwrapPayload(allQueuesStatsData);
    const countFromAllStats = pickFirstNumber(
      allStatsPayload?.totalFailedJobs,
      allStatsPayload?.failedJobsCount,
      allStatsPayload?.total,
      allStatsPayload?.count
    );
    if (countFromAllStats) return countFromAllStats;

    return queueStats.reduce((sum, item) => sum + toNumber(item.count), 0);
  }, [countData, allQueuesStatsData, queueStats]);

  const normalizedJobs = useMemo(
    () =>
      normalizeFailedJobs(
        failedJobsData,
        currentPage,
        entriesPerPage,
        selectedQueue
      ),
    [failedJobsData, currentPage, entriesPerPage, selectedQueue]
  );

  const refetchCurrentData = async () => {
    const jobsMutations: Promise<any>[] = [
      Promise.resolve(mutateCount()),
      Promise.resolve(mutateAllQueuesStats()),
    ];

    if (selectedQueue) {
      jobsMutations.push(
        Promise.resolve(mutateQueueStats()),
        Promise.resolve(mutateGroupedReasons()),
        Promise.resolve(mutateFailedJobs())
      );
    }

    await Promise.all(jobsMutations);
  };

  const handleRefresh = async () => {
    setBulkActionLoading("refresh");
    try {
      await refetchCurrentData();
    } finally {
      setBulkActionLoading(null);
    }
  };

  const runQueueAction = async (
    action: BulkActionType,
    endpoint: string,
    method: "post" | "delete",
    successMessage: string
  ) => {
    if (!selectedQueue) return;

    setBulkActionLoading(action);
    try {
      await apiCall({
        endpoint,
        method,
        successMessage,
      });
      await refetchCurrentData();
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleRetryAll = async () => {
    if (!selectedQueue) return;
    await runQueueAction(
      "retryAll",
      `/v1/failed-jobs/${encodeURIComponent(selectedQueue)}/retry-all`,
      "post",
      `Retry request sent for ${selectedQueue}.`
    );
  };

  const handleCleanup = async () => {
    if (!selectedQueue) return;
    await runQueueAction(
      "cleanup",
      `/v1/failed-jobs/${encodeURIComponent(selectedQueue)}/cleanup`,
      "post",
      `Cleanup request sent for ${selectedQueue}.`
    );
  };

  const handleRemoveAll = async () => {
    if (!selectedQueue) return;
    const confirmed = window.confirm(
      `Remove all failed jobs in "${selectedQueue}"? This cannot be undone.`
    );
    if (!confirmed) return;

    await runQueueAction(
      "removeAll",
      `/v1/failed-jobs/${encodeURIComponent(selectedQueue)}/remove-all`,
      "delete",
      `All failed jobs removed from ${selectedQueue}.`
    );
  };

  const handleRetryJob = async (row: FailedJobRow) => {
    const loadingKey = `retry-${row.id}`;
    setActionLoadingKey(loadingKey);
    try {
      await apiCall({
        endpoint: `/v1/failed-jobs/${encodeURIComponent(
          row.queue
        )}/${encodeURIComponent(row.id)}/retry`,
        method: "post",
        successMessage: `Retry request sent for job ${row.id}.`,
      });
      await refetchCurrentData();
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleRemoveJob = async (row: FailedJobRow) => {
    const confirmed = window.confirm(
      `Remove failed job "${row.id}" from "${row.queue}"? This cannot be undone.`
    );
    if (!confirmed) return;

    const loadingKey = `remove-${row.id}`;
    setActionLoadingKey(loadingKey);
    try {
      await apiCall({
        endpoint: `/v1/failed-jobs/${encodeURIComponent(
          row.queue
        )}/${encodeURIComponent(row.id)}`,
        method: "delete",
        successMessage: `Failed job ${row.id} removed.`,
      });
      await refetchCurrentData();
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleViewDetails = async (row: FailedJobRow) => {
    setIsDetailsOpen(true);
    setDetailsQueue(row.queue);
    setDetailsJobId(row.id);
    setDetailsPayload(null);
    setDetailsLoading(true);
    try {
      const response = await apiCall({
        endpoint: `/v1/failed-jobs/${encodeURIComponent(
          row.queue
        )}/${encodeURIComponent(row.id)}`,
        method: "get",
        showToast: false,
      });
      const payload = unwrapPayload(response?.data);
      setDetailsPayload(payload ?? response?.data ?? row.raw);
    } catch {
      setDetailsPayload(row.raw ?? null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const paginationInfo: PaginationType = () => ({
    total: normalizedJobs.total,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  });

  const detailsText = useMemo(
    () => stringifyDetails(detailsPayload),
    [detailsPayload]
  );

  const queueActionDisabled = !selectedQueue || queueStats.length === 0;

  const actionButtons = (row: FailedJobRow) => {
    const retryLoading = actionLoadingKey === `retry-${row.id}`;
    const removeLoading = actionLoadingKey === `remove-${row.id}`;

    return (
      <div className="flex items-center gap-2 min-w-[220px]">
        <button
          type="button"
          className="h-[28px] px-2.5 rounded-full border border-[#D4DCE8] bg-[#F6F8FA] text-[11px] text-textBlack hover:bg-[#EEF2F7]"
          onClick={() => handleViewDetails(row)}
        >
          View
        </button>
        <button
          type="button"
          className="h-[28px] px-2.5 rounded-full border border-[#22B45E] text-[#22B45E] text-[11px] hover:bg-[#EAFBF0] disabled:opacity-60"
          onClick={() => handleRetryJob(row)}
          disabled={retryLoading}
        >
          {retryLoading ? "Retrying..." : "Retry"}
        </button>
        <button
          type="button"
          className="h-[28px] px-2.5 rounded-full border border-[#FF5F5F] text-[#FF5F5F] text-[11px] hover:bg-[#FFF1F1] disabled:opacity-60"
          onClick={() => handleRemoveJob(row)}
          disabled={removeLoading}
        >
          {removeLoading ? "Removing..." : "Remove"}
        </button>
      </div>
    );
  };

  const columnList = [
    { title: "JOB ID", key: "id" },
    { title: "NAME", key: "name" },
    {
      title: "FAILED AT",
      key: "failedAt",
      valueIsAComponent: true,
      customValue: (value: string) => {
        if (!value || Number.isNaN(new Date(value).getTime())) {
          return <span className="text-xs text-textLightGrey">-</span>;
        }
        return <DateTimeTag datetime={value} showAll={true} />;
      },
    },
    {
      title: "REASON",
      key: "reason",
      valueIsAComponent: true,
      customValue: (value: string) => (
        <span
          className="inline-block max-w-[520px] overflow-hidden text-ellipsis whitespace-nowrap"
          title={value || "N/A"}
        >
          {value || "N/A"}
        </span>
      ),
    },
    { title: "ATTEMPTS", key: "attempts" },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (_: any, row: FailedJobRow) => actionButtons(row),
    },
  ];

  const errorMessage =
    (failedJobsError as any)?.response?.data?.message ||
    (failedJobsError as any)?.message ||
    "Failed to fetch failed jobs.";

  return (
    <PageLayout pageName="Failed Jobs Management" badge={settingsbadge}>
      <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
        <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
          <TitlePill
            icon={inventorygradient}
            iconBgColor="bg-[#FDEEC2]"
            topText="TOTAL"
            bottomText="FAILED JOBS"
            value={countLoading ? "..." : totalFailedJobs}
          />
          <TitlePill
            icon={inventorygradient}
            iconBgColor="bg-[#FDEEC2]"
            topText="QUEUE"
            bottomText="FAILED JOBS"
            value={selectedQueue ? selectedQueueCount : 0}
          />
        </div>

        <div className="flex flex-wrap w-full sm:w-auto items-center justify-between sm:justify-end gap-2 min-w-max">
          <button
            type="button"
            className={`${buttonBaseClass} border-[#D4DCE8] bg-white text-textBlack`}
            onClick={handleRefresh}
            disabled={bulkActionLoading === "refresh"}
          >
            {bulkActionLoading === "refresh" ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            className={`${buttonBaseClass} border-[#22B45E] text-[#22B45E] bg-white`}
            onClick={handleRetryAll}
            disabled={queueActionDisabled || bulkActionLoading === "retryAll"}
          >
            {bulkActionLoading === "retryAll" ? "Retrying..." : "Retry All"}
          </button>
          <button
            type="button"
            className={`${buttonBaseClass} border-[#D99A18] text-[#C78600] bg-white`}
            onClick={handleCleanup}
            disabled={queueActionDisabled || bulkActionLoading === "cleanup"}
          >
            {bulkActionLoading === "cleanup" ? "Cleaning..." : "Cleanup Old"}
          </button>
          <button
            type="button"
            className={`${buttonBaseClass} border-[#FF5F5F] text-[#FF5F5F] bg-white`}
            onClick={handleRemoveAll}
            disabled={queueActionDisabled || bulkActionLoading === "removeAll"}
          >
            {bulkActionLoading === "removeAll" ? "Removing..." : "Remove All"}
          </button>
        </div>
      </section>

      <div className="flex flex-col w-full px-2 py-8 gap-4 lg:flex-row md:p-8">
        <aside className="w-full lg:max-w-[240px] rounded-[20px] border-[0.6px] border-strokeGreyThree bg-white p-4">
          {allQueuesStatsLoading ? (
            <p className="text-sm text-textLightGrey">Loading queues...</p>
          ) : queueStats.length === 0 ? (
            <p className="text-sm text-textLightGrey">No queue data available.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {queueStats.map((item) => {
                const active = item.queue === selectedQueue;
                return (
                  <button
                    key={item.queue}
                    type="button"
                    onClick={() => setSelectedQueue(item.queue)}
                    className={`group relative w-full rounded-full px-3 py-1.5 flex items-center justify-between gap-2 text-left outline-none ring-0 transition-[background,transform,box-shadow] duration-200 hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-primary-hex focus-visible:ring-opacity-60 ${
                      active
                        ? "bg-gradient-to-r from-[var(--brand-primary-hex)] to-accent text-white shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
                        : "bg-white text-black hover:bg-black/5"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium truncate ${
                        active
                          ? "text-white"
                          : "text-black/80 group-hover:text-black"
                      }`}
                    >
                      {item.queue}
                    </span>
                    <span
                      className={`ml-auto inline-flex items-center justify-center min-w-[22px] h-[18px] px-1.5 rounded-full text-[10px] font-medium border border-black/10 transition-colors ${
                        active
                          ? "bg-white/90 text-black"
                          : "bg-black/5 text-black/70 group-hover:bg-primary-hex/10 group-hover:text-primary-hex"
                      }`}
                    >
                      {toNumber(item.count)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="w-full">
          {!selectedQueue ? (
            <div className="w-full min-h-[220px] rounded-[20px] border border-strokeGreyThree bg-white flex items-center justify-center">
              <p className="text-sm text-textLightGrey">
                {allQueuesStatsLoading
                  ? "Loading queue data..."
                  : "Select a queue to view failed jobs."}
              </p>
            </div>
          ) : failedJobsError ? (
            <ErrorComponent
              message={errorMessage}
              className="rounded-[20px]"
              refreshData={mutateFailedJobs}
              errorData={failedJobsErrorStates}
            />
          ) : (
            <Table
              tableTitle={selectedQueue ? `Failed Jobs: ${selectedQueue}` : "Failed Jobs"}
              columnList={columnList}
              loading={failedJobsLoading}
              tableData={normalizedJobs.rows}
              refreshTable={refetchCurrentData}
              paginationInfo={paginationInfo}
              clearFilters={() => {
                setCurrentPage(1);
                setEntriesPerPage(20);
              }}
            />
          )}
        </section>
      </div>

      <SecondaryModal
        isOpen={isDetailsOpen}
        onClose={() => {
          if (!detailsLoading) setIsDetailsOpen(false);
        }}
        description={
          detailsJobId
            ? `Job ${detailsJobId}${detailsQueue ? ` (${detailsQueue})` : ""}`
            : "Job details"
        }
        width="w-[95vw] max-w-[1200px]"
        height="h-[80vh]"
      >
        <div className="h-full">
          {detailsLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-textDarkGrey">Loading job details...</p>
            </div>
          ) : (
            <div className="h-full overflow-auto rounded-xl border border-strokeGreyThree bg-[#F6F8FA] p-4">
              <pre className="whitespace-pre-wrap break-words text-[13px] leading-7 text-textDarkGrey font-mono">
                {detailsText}
              </pre>
            </div>
          )}
        </div>
      </SecondaryModal>
    </PageLayout>
  );
};

export default FailedJobs;
