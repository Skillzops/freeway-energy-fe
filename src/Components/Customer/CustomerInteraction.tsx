import React, { useMemo, useState } from "react";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { Modal } from "../ModalComponent/Modal";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";

type CustomerInteractionProps = {
  customerId: string;
};

type InteractionType =
  | "CALL"
  | "EMAIL"
  | "MEETING"
  | "VISIT"
  | "FOLLOW_UP"
  | "NOTE"
  | "OTHER";

type InteractionStatus = "OPEN" | "COMPLETED" | "CANCELLED";

type InteractionItem = {
  id: string;
  title: string;
  interactionType: InteractionType;
  status: InteractionStatus;
  date?: string;
  notes?: string;
  tags?: string[];
  assigneeId?: string | null;
  assigneeName?: string;
  followUpDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

const INTERACTION_TYPES: InteractionType[] = [
  "CALL",
  "EMAIL",
  "MEETING",
  "VISIT",
  "FOLLOW_UP",
  "NOTE",
  "OTHER",
];

const INTERACTION_STATUSES: Array<InteractionStatus | ""> = [
  "",
  "OPEN",
  "COMPLETED",
  "CANCELLED",
];

const toArray = (value: any): any[] => (Array.isArray(value) ? value : []);

const normalizeInteractions = (payload: any): InteractionItem[] => {
  const rows = [
    ...toArray(payload?.interactions),
    ...toArray(payload?.data),
    ...toArray(payload?.results),
    ...toArray(payload?.items),
  ];

  return rows.map((row: any, index: number) => ({
    id: String(row?.id || row?._id || `interaction-${index}`),
    title: String(row?.title || row?.subject || "Untitled Interaction"),
    interactionType: (row?.interactionType || row?.type || "OTHER") as InteractionType,
    status: (row?.status || "OPEN") as InteractionStatus,
    date: row?.date || row?.interactionDate || row?.createdAt,
    notes: row?.notes || row?.description || "",
    tags: Array.isArray(row?.tags) ? row.tags : [],
    assigneeId: row?.assigneeId || row?.assignedTo || row?.assignee?.id || null,
    assigneeName:
      row?.assigneeName ||
      row?.assignedToName ||
      `${row?.assignee?.firstname || ""} ${row?.assignee?.lastname || ""}`.trim() ||
      "",
    followUpDate: row?.followUpDate || row?.nextFollowUpDate || "",
    createdAt: row?.createdAt,
    updatedAt: row?.updatedAt,
  }));
};

const getTotalCount = (stats: any, fallbackData: any, listData: any): number => {
  const statsCandidates = [
    stats?.total,
    stats?.count,
    stats?.totalInteractions,
    stats?.stats?.total,
    stats?.data?.total,
  ];

  for (const candidate of statsCandidates) {
    if (typeof candidate === "number") return candidate;
    if (typeof candidate === "string" && candidate.trim() !== "") {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  const fallbackCandidates = [
    fallbackData?.total,
    fallbackData?.count,
    fallbackData?.pagination?.total,
    fallbackData?.meta?.total,
  ];

  for (const candidate of fallbackCandidates) {
    if (typeof candidate === "number") return candidate;
    if (typeof candidate === "string" && candidate.trim() !== "") {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return normalizeInteractions(listData).length;
};

const formatDateInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const prettyDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
};

const buildInteractionsEndpoint = ({
  customerId,
  page,
  limit,
  interactionType,
  status,
  search,
}: {
  customerId: string;
  page: number;
  limit: number;
  interactionType: string;
  status: string;
  search: string;
}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (interactionType) params.set("interactionType", interactionType);
  if (status) params.set("status", status);
  if (search.trim()) params.set("search", search.trim());
  return `/v1/customers/${customerId}/interactions?${params.toString()}`;
};

const CustomerInteraction = ({ customerId }: CustomerInteractionProps) => {
  const { apiCall } = useApiCall();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [interactionType, setInteractionType] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editing, setEditing] = useState<InteractionItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const interactionsEndpoint = useMemo(
    () =>
      buildInteractionsEndpoint({
        customerId,
        page,
        limit,
        interactionType,
        status,
        search,
      }),
    [customerId, interactionType, limit, page, search, status]
  );

  const fetchInteractions = useGetRequest(interactionsEndpoint, true);
  const fetchStats = useGetRequest(`/v1/customers/${customerId}/interactions/stats`, true);
  const fallbackCount = useGetRequest(
    `/v1/customers/${customerId}/interactions?page=1&limit=1`,
    true
  );
  const fetchUsers = useGetRequest(`/v1/users?page=1&limit=200`, false);
  const fetchSingleInteraction = useGetRequest(
    viewId ? `/v1/customers/${customerId}/interactions/${viewId}` : null,
    false
  );

  const interactions = useMemo(
    () => normalizeInteractions(fetchInteractions?.data),
    [fetchInteractions?.data]
  );

  const users = useMemo(() => {
    const rows = [
      ...toArray(fetchUsers?.data?.users),
      ...toArray(fetchUsers?.data?.data),
      ...toArray(fetchUsers?.data),
    ];
    return rows
      .map((u: any) => ({
        id: String(u?.id || u?._id || ""),
        name: `${u?.firstname || ""} ${u?.lastname || ""}`.trim() || u?.username || "Unknown",
      }))
      .filter((u) => u.id);
  }, [fetchUsers?.data]);

  const total = useMemo(
    () => getTotalCount(fetchStats?.data, fallbackCount?.data, fetchInteractions?.data),
    [fallbackCount?.data, fetchInteractions?.data, fetchStats?.data]
  );

  const listMeta = fetchInteractions?.data?.pagination || fetchInteractions?.data?.meta || {};
  const totalPages = Number(listMeta?.totalPages || Math.ceil((total || 1) / limit) || 1);

  const refreshAll = async () => {
    await Promise.all([
      fetchInteractions?.mutate?.(),
      fetchStats?.mutate?.(),
      fallbackCount?.mutate?.(),
    ]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this interaction?")) return;
    try {
      setDeletingId(id);
      await apiCall({
        endpoint: `/v1/customers/${customerId}/interactions/${id}`,
        method: "delete",
        successMessage: "Interaction deleted",
      });
      await refreshAll();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkDone = async (id: string) => {
    try {
      await apiCall({
        endpoint: `/v1/customers/${customerId}/interactions/${id}`,
        method: "patch",
        data: { status: "COMPLETED" },
        successMessage: "Interaction marked done",
      });
      await refreshAll();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col w-full gap-3">
      <div className="w-full rounded-[20px] border border-[#D7DEE9] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between border-b border-[#DDE4EE] pb-2">
          <p className="text-[18px] font-semibold text-textBlack">Customer Interaction</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-textLightGrey">{total} interactions</p>
            <button
              className="h-[32px] rounded-[12px] border border-[#D2C28D] bg-[#F8ECC4] px-3 text-xs font-semibold text-[#7A5A0E]"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add Interaction
            </button>
          </div>
        </div>

        <div className="mt-3 rounded-[16px] border border-[#DDE4EE] p-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-textLightGrey">Search</label>
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search title or description"
                className="h-[44px] rounded-[14px] border border-[#D4DCE8] px-3 text-sm text-textBlack outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-textLightGrey">Type</label>
              <select
                value={interactionType}
                onChange={(e) => {
                  setPage(1);
                  setInteractionType(e.target.value);
                }}
                className="h-[44px] rounded-[14px] border border-[#D4DCE8] px-3 text-sm text-textBlack outline-none bg-white"
              >
                <option value="">All</option>
                {INTERACTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-textLightGrey">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                className="h-[44px] rounded-[14px] border border-[#D4DCE8] px-3 text-sm text-textBlack outline-none bg-white"
              >
                <option value="">All</option>
                {INTERACTION_STATUSES.filter(Boolean).map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <DataStateWrapper
          isLoading={fetchInteractions?.isLoading}
          error={fetchInteractions?.error}
          errorStates={fetchInteractions?.errorStates}
          refreshData={fetchInteractions?.mutate}
          errorMessage="Failed to fetch customer interactions"
        >
          <div className="mt-3 min-h-[280px]">
            {interactions.length === 0 ? (
              <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#F0F2F5] text-[28px] text-textLightGrey">
                  <span>🗎</span>
                </div>
                <p className="text-[16px] leading-none font-semibold text-textBlack">No Interactions Yet</p>
                <p className="text-sm text-textLightGrey">Interactions will appear here once logged.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {interactions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[14px] border border-[#DDE4EE] p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-textBlack">{item.title}</p>
                        <p className="text-xs text-textLightGrey">
                          {item.interactionType} • {item.status} • {prettyDate(item.date || item.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="h-[30px] rounded-full border border-strokeGreyThree px-3 text-xs font-medium text-textDarkGrey"
                          onClick={() => setViewId(item.id)}
                        >
                          View
                        </button>
                        <button
                          className="h-[30px] rounded-full border border-strokeGreyThree px-3 text-xs font-medium text-textDarkGrey"
                          onClick={() => {
                            setEditing(item);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        {item.status !== "COMPLETED" && (
                          <button
                            className="h-[30px] rounded-full border border-[#BBD8C1] bg-[#EAF7ED] px-3 text-xs font-medium text-[#1A8E3A]"
                            onClick={() => handleMarkDone(item.id)}
                          >
                            Done
                          </button>
                        )}
                        <button
                          className="h-[30px] rounded-full border border-[#F1B9B9] bg-[#FFF1F1] px-3 text-xs font-medium text-[#D13A3A]"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              className="h-[32px] rounded-full border border-strokeGreyThree px-3 text-xs"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </button>
            <p className="text-xs text-textLightGrey">
              Page {page} of {Math.max(totalPages, 1)}
            </p>
            <button
              className="h-[32px] rounded-full border border-strokeGreyThree px-3 text-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </DataStateWrapper>
      </div>

      <InteractionFormModal
        isOpen={formOpen}
        editing={editing}
        users={users}
        isSaving={saving}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={async (payload) => {
          try {
            setSaving(true);
            if (editing?.id) {
              await apiCall({
                endpoint: `/v1/customers/${customerId}/interactions/${editing.id}`,
                method: "patch",
                data: payload,
                successMessage: "Interaction updated",
              });
            } else {
              await apiCall({
                endpoint: `/v1/customers/${customerId}/interactions`,
                method: "post",
                data: payload,
                successMessage: "Interaction created",
              });
            }
            setFormOpen(false);
            setEditing(null);
            await refreshAll();
          } catch (error) {
            console.error(error);
          } finally {
            setSaving(false);
          }
        }}
      />

      <Modal
        layout="center"
        size="medium"
        isOpen={Boolean(viewId)}
        onClose={() => setViewId(null)}
      >
        <div className="p-4">
          <p className="text-lg font-semibold text-textBlack mb-3">Interaction Details</p>
          <DataStateWrapper
            isLoading={fetchSingleInteraction?.isLoading}
            error={fetchSingleInteraction?.error}
            errorStates={fetchSingleInteraction?.errorStates}
            refreshData={fetchSingleInteraction?.mutate}
            errorMessage="Failed to fetch interaction details"
          >
            <InteractionViewContent interaction={fetchSingleInteraction?.data} />
          </DataStateWrapper>
        </div>
      </Modal>
    </div>
  );
};

const InteractionViewContent = ({ interaction }: { interaction: any }) => {
  const data = interaction?.interaction || interaction?.data || interaction || {};
  return (
    <div className="flex flex-col gap-2 text-sm">
      <p>
        <span className="font-semibold">Title:</span> {data?.title || "N/A"}
      </p>
      <p>
        <span className="font-semibold">Type:</span> {data?.interactionType || data?.type || "N/A"}
      </p>
      <p>
        <span className="font-semibold">Status:</span> {data?.status || "N/A"}
      </p>
      <p>
        <span className="font-semibold">Date:</span> {prettyDate(data?.date || data?.createdAt)}
      </p>
      <p>
        <span className="font-semibold">Notes:</span> {data?.notes || data?.description || "N/A"}
      </p>
    </div>
  );
};

const InteractionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editing,
  users,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, any>) => Promise<void>;
  editing: InteractionItem | null;
  users: Array<{ id: string; name: string }>;
  isSaving: boolean;
}) => {
  const [interactionType, setInteractionType] = useState<InteractionType>("CALL");
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [date, setDate] = useState(formatDateInput(new Date().toISOString()));
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  React.useEffect(() => {
    if (!isOpen) return;
    setInteractionType((editing?.interactionType || "CALL") as InteractionType);
    setTitle(editing?.title || "");
    setAssigneeId(editing?.assigneeId || "");
    setDate(formatDateInput(editing?.date || editing?.createdAt || new Date().toISOString()));
    setNotes(editing?.notes || "");
    setTags((editing?.tags || []).join(", "));
    setFollowUpDate(formatDateInput(editing?.followUpDate));
  }, [editing, isOpen]);

  const handleSubmit = async () => {
    const payload = {
      interactionType,
      title: title.trim(),
      assigneeId: assigneeId || undefined,
      date: date ? new Date(date).toISOString() : undefined,
      notes: notes.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      followUpDate: followUpDate ? new Date(followUpDate).toISOString() : undefined,
    };
    await onSubmit(payload);
  };

  return (
    <Modal layout="right" size="large" isOpen={isOpen} onClose={onClose} bodyStyle="pb-32 overflow-auto">
      <div className="bg-white">
        <div className="flex items-center justify-center min-h-[84px] border-b border-[#DDE4EE] bg-paleGrayGradientLeft">
          <p className="text-[20px] leading-none font-semibold text-textBlack">
            {editing ? "Edit Interaction" : "Add Interaction"}
          </p>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <FormGroup label="Interaction Type">
            <select
              value={interactionType}
              onChange={(e) => setInteractionType(e.target.value as InteractionType)}
              className="h-[48px] rounded-[14px] border border-[#D4DCE8] px-3 text-sm outline-none bg-white"
            >
              {INTERACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
              className="h-[48px] rounded-[14px] border border-[#D4DCE8] px-3 text-sm placeholder:text-[13px] outline-none"
            />
          </FormGroup>

          <FormGroup label="Assign To">
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="h-[48px] rounded-[14px] border border-[#D4DCE8] px-3 text-sm outline-none bg-white"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-[48px] rounded-[14px] border border-[#D4DCE8] px-3 text-sm outline-none"
            />
          </FormGroup>

          <FormGroup label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes or details"
              className="min-h-[140px] rounded-[14px] border border-[#D4DCE8] px-3 py-2 text-sm placeholder:text-[13px] outline-none"
            />
          </FormGroup>

          <FormGroup label="Tags">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Select tags"
              className="h-[48px] rounded-[14px] border border-[#D4DCE8] px-3 text-sm placeholder:text-[13px] outline-none"
            />
          </FormGroup>

          <FormGroup label="Follow-up Date (optional)">
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="h-[48px] rounded-[14px] border border-[#D4DCE8] px-3 text-sm outline-none"
            />
          </FormGroup>
        </div>

        <div className="sticky bottom-0 left-0 right-0 flex items-center gap-2 border-t border-[#DDE4EE] bg-white p-3">
          <button
            className="h-[50px] flex-1 rounded-[18px] border border-strokeGreyThree bg-[#F0F2F5] text-[14px] leading-none font-medium text-textDarkGrey"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="h-[50px] flex-1 rounded-[18px] text-[14px] leading-none font-semibold text-white"
            style={{ backgroundColor: "#901420" }}
            onClick={handleSubmit}
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? "Saving..." : editing ? "Save Changes" : "Create Interaction"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const FormGroup = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-textLightGrey">{label}</label>
      {children}
    </div>
  );
};

export default CustomerInteraction;
