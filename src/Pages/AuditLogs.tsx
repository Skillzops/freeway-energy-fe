/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import PageLayout from "./PageLayout";
import { Table, PaginationType } from "@/Components/TableComponent/Table";
import { useGetRequest } from "@/utils/useApiCall";
import { ErrorComponent } from "./ErrorPage";
import { DateTimeTag, NameTag } from "@/Components/CardComponents/CardComponent";
import settingsbadge from "@/assets/settings/settingsbadge.png";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";

type AuditRow = {
  no: number;
  id: string;
  action: string;
  user: string;
  userId?: string;
  actorEmail?: string;
  description?: string;
  route?: string;
  createdAt?: string;
  oldValues?: any;
  newValues?: any;
  changes?: any;
};

const buildRows = (data: any): AuditRow[] => {
  const list =
    data?.logs ||
    data?.data ||
    data?.auditLogs ||
    (Array.isArray(data) ? data : data?.items) ||
    [];

  return list.map((item: any, idx: number) => {
    const userName =
      item?.user?.firstname || item?.user?.lastname
        ? `${item?.user?.firstname ?? ""} ${item?.user?.lastname ?? ""}`.trim()
        : item?.user?.email || item?.userId || "N/A";

    return {
      no: idx + 1,
      id: item?.id ?? item?._id ?? `${idx}`,
      action: item?.action ?? item?.method ?? "N/A",
      user: userName || "N/A",
      userId: item?.userId ?? item?.user?.id,
      actorEmail: item?.user?.email,
      description: item?.description ?? item?.message ?? item?.resource ?? "—",
      route: item?.route ?? item?.path ?? item?.endpoint,
      createdAt: item?.metadata?.timestamp ?? item?.createdAt ?? item?.timestamp,
      oldValues: item?.oldValues,
      newValues: item?.newValues,
      changes: item?.changes,
    };
  });
};

const AuditLogs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [tableQueryParams, setTableQueryParams] = useState<Record<string, any> | null>({});
  const [queryValue, setQueryValue] = useState("");
  const [isSearchQuery, setIsSearchQuery] = useState(false);
  const [timelineUserId, setTimelineUserId] = useState<string | null>(null);
  const [timelineUserName, setTimelineUserName] = useState<string | null>(null);

  const queryString = useMemo(
    () =>
      Object.entries(tableQueryParams || {})
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
        .join("&"),
    [tableQueryParams]
  );

  const endpoint = timelineUserId
    ? `/v1/audit-logs/user/${timelineUserId}?limit=${entriesPerPage}`
    : `/v1/audit-logs?page=${currentPage}&limit=${entriesPerPage}${queryString ? `&${queryString}` : ""}`;

  const {
    data,
    isLoading,
    mutate: refreshTable,
    error,
    errorStates,
  } = useGetRequest(endpoint, true, 60000);

  useEffect(() => {
    setTableQueryParams((prev) => ({ ...(prev || {}), sortField: "createdAt", sortOrder: "desc" }));
  }, []);

  const paginationInfo: PaginationType = () => ({
    total: timelineUserId ? buildRows(data).length : data?.total ?? data?.count ?? 0,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  });

  const filterList = [
    {
      name: "Action",
      items: ["All", "GET", "POST", "PATCH", "PUT", "DELETE"],
      onClickLink: async (index: number) => {
        const actions = ["", "GET", "POST", "PATCH", "PUT", "DELETE"];
        const picked = actions[index] || "";
        setIsSearchQuery(false);
        setQueryValue(picked || "All");
        setTableQueryParams((prev) => {
          const next = { ...(prev || {}) };
          if (!picked) {
            delete (next as any).action;
          } else {
            // Some backends expect lowercase verbs for filtering; normalize to lowercase
            (next as any).action = picked.toLowerCase();
          }
          return next;
        });
      },
    },
    {
      name: "User ID",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prev) => ({ ...(prev || {}), userId: query }));
      },
      isSearch: true,
    },
    {
      name: "Date",
      isDateRange: true,
      onDateClick: (startDate: string, endDate?: string) => {
        const end = endDate || startDate;
        setQueryValue(endDate ? `${startDate} - ${end}` : startDate);
        setIsSearchQuery(false);
        setTableQueryParams((prevParams) => ({
          ...(prevParams || {}),
          startDate,
          endDate: end,
        }));
      },
      isDate: true,
    },
  ];

  const summarizeChange = (row: AuditRow) => {
    const parts: string[] = [];
    parts.push(`Action: ${row.action || "N/A"}`);

    const hasChanges = row.changes && Object.keys(row.changes || {}).length > 0;
    if (hasChanges) {
      parts.push(`Changes: ${JSON.stringify(row.changes)}`);
    } else {
      parts.push("Changes: none provided");
    }

    const oldValueText =
      row.oldValues && Object.keys(row.oldValues || {}).length > 0
        ? JSON.stringify(row.oldValues)
        : "none";
    const newValueText =
      row.newValues && Object.keys(row.newValues || {}).length > 0
        ? JSON.stringify(row.newValues)
        : "none";

    parts.push(`Old Values: ${oldValueText}`);
    parts.push(`New Values: ${newValueText}`);

    return parts.join(" | ");
  };

  const columnList = [
    { title: "S/N", key: "no" },
    {
      title: "USER",
      key: "user",
      valueIsAComponent: true,
      customValue: (value: string) => <NameTag name={value || "N/A"} />,
    },
    {
      title: "EMAIL",
      key: "actorEmail",
    },
    {
      title: "TIME",
      key: "createdAt",
      valueIsAComponent: true,
      customValue: (value: string) => <DateTimeTag datetime={value} showAll={true} />,
    },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (_: any, row: AuditRow) => {
        const summary = summarizeChange(row);
        return <span className="text-[11px] text-textDarkGrey leading-snug">{summary}</span>;
      },
    },
  ];

  const tableTitle = timelineUserId
    ? `USER ACTIVITY: ${timelineUserName ?? timelineUserId}`
    : "AUDIT LOGS";

  const errorMessage =
    (error as any)?.response?.data?.message ||
    (error as any)?.message ||
    "Failed to fetch audit logs.";

  return (
    <PageLayout pageName="Audit Logs" badge={settingsbadge}>
      {!error ? (
        <div className="w-full px-2 py-6 md:px-6">
          {timelineUserId ? (
            <div className="flex items-center gap-2 mb-2">
              <ActionButton
                label="Back to all logs"
                onClick={() => {
                  setTimelineUserId(null);
                  setTimelineUserName(null);
                  setCurrentPage(1);
                }}
              />
            </div>
          ) : null}
          <Table
            tableTitle={tableTitle}
            filterList={filterList}
            columnList={columnList}
            loading={isLoading}
            tableData={buildRows(data)}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => {
              setTableQueryParams({});
              setQueryValue("");
              setIsSearchQuery(false);
              setCurrentPage(1);
            }}
          />
        </div>
      ) : (
        <ErrorComponent
          message={errorMessage}
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorStates}
        />
      )}
    </PageLayout>
  );
};

export default AuditLogs;
