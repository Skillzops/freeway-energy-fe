import React, { useMemo } from "react";
// import taskIcon from "@/assets/agents/taskIcon.png";
import { FiClipboard, FiCpu } from "react-icons/fi";


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
  acceptedAt?: string | null;
  completedDate?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  description?: string | null;
  customer?: {
    id: string;
    firstname: string;
    lastname: string;
    phone: string;
    alternatePhone?: string | null;
  };
  requestingAgent?: {
    id: string;
    agentId: number;
    category: string;
    userId: string;
  };
  sale?: {
    id: string;
    category: string;
    status: string;
  };
};

type UITask = {
  id: string;
  customerName: string;
  phone: string;
  altPhone: string | null;
  address: string;
  scheduled: string;
  created: string;
  requester: string;
  saleCat: string;
  saleStatus: string;
  saleIdShort: string;
  status: RawTask["status"];
  description: string;
  installerAssigned: boolean;
  acceptedAt?: string | null;
  completedDate?: string | null;
  rejectedAt?: string | null;
};

type Props = {
  tasks: RawTask[] | null;
  onAssign: (taskId: string) => void;
  selectedTaskId: string | null;
  onToggleSelect: (taskId: string) => void;
};

function fmtDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleString();
}

const NewTasks: React.FC<Props> = ({
  tasks,
  onAssign,
  selectedTaskId,
  onToggleSelect,
}) => {
  const uiTasks = useMemo<UITask[] | null>(() => {
    if (!tasks || tasks.length === 0) return null;
    return tasks.map((t) => {
      const customerName = t.customer
        ? `${t.customer.firstname ?? ""} ${t.customer.lastname ?? ""}`.trim() ||
        "—"
        : "—";
      const phone = t.customer?.phone ?? "—";
      const altPhone = t.customer?.alternatePhone ?? null;
      const address = t.pickupLocation ?? t.installationAddress ?? "—";
      const saleIdShort = t.sale?.id
        ? `${t.sale.id.slice(0, 6)}…${t.sale.id.slice(-4)}`
        : t.saleId
          ? `${t.saleId.slice(0, 6)}…${t.saleId.slice(-4)}`
          : "—";
      const requester = t.requestingAgent
        ? `#${t.requestingAgent.agentId} • ${t.requestingAgent.category}`
        : `Agent ${t.requestingAgentId.slice(0, 6)}…`;

      return {
        id: t.id,
        customerName,
        phone,
        altPhone,
        address,
        scheduled: fmtDate(t.scheduledDate),
        created: fmtDate(t.createdAt),
        requester,
        saleCat: t.sale?.category ?? "—",
        saleStatus: t.sale?.status ?? "—",
        saleIdShort,
        status: t.status,
        description: t.description ?? "",
        installerAssigned: !!t.installerAgentId,
        acceptedAt: t.acceptedAt ?? null,
        completedDate: t.completedDate ?? null,
        rejectedAt: t.rejectedAt ?? null,
      };
    });
  }, [tasks]);

  const count = uiTasks?.length ?? 0;

  return (
    <div className="bg-[#FFFFFF] rounded-2xl shadow-sm p-6 border border-[#E3F0FF] w-[359px] h-[640px] flex flex-col items-center gap-4">
      <div className="bg-skyblue relative flex items-center justify-between w-[327px] h-[48px] rounded-full px-4">
        <div className="relative flex items-center gap-2">
          {/* <img src={taskIcon} alt="Tasks" /> */}

          <div 
            className="relative w-10 h-10 grid place-items-center rounded-xl shadow-lg ring-1 ring-white/20 bg-gradient-to-br from-primary-hex via-primary-shade-1 to-primary-shade-2"
          >
            <FiClipboard className="w-5 h-5 text-white drop-shadow-sm" />
            <span
              className="pointer-events-none absolute inset-0 blur-md opacity-50 -z-10"
              style={{ backgroundImage: 'linear-gradient(135deg,var(--brand-primary-hex) 0%,var(--brand-primary-shade-1) 55%,#FFFFFF 100%)' }}
            />
          </div>

          <span className="text-[16px] leading-[100%] text-[#050505] font-primary font-medium">
            New Tasks
          </span>
        </div>
        <span className="text-xs text-gray-600">{count} total</span>
      </div>

      <div className="overflow-hidden w-[327px] h-[550px] bg-[#FFFFFF] rounded-lg overflow-y-auto flex flex-col gap-3">
        {uiTasks && uiTasks.length > 0 ? (
          uiTasks.map((ui) => {
            const isSelected = selectedTaskId === ui.id;
            return (
              <div
                key={ui.id}
                className={`relative w-full bg-white border rounded-lg px-4 py-4 text-sm text-gray-700 cursor-pointer
                  ${isSelected
                    ? "border-[#93C5FD] ring-2 ring-[#BFDBFE]"
                    : "border-gray-200"
                  }`}
                onClick={() => onToggleSelect(ui.id)}
                title="Click to select/unselect this task"
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold text-[#0F5132] bg-[#D1E7DD] px-2 py-0.5 rounded-full border border-[#BADBCC]">
                    Selected
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p className="text-[11px] text-gray-500">Customer</p>
                    <p className="font-semibold text-sm text-[#3734A9] max-w-[55%] text-right truncate">
                      {ui.customerName}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-[11px] text-gray-500">Phone</p>
                    <div className="text-sm font-medium text-[#2D72D2] max-w-[55%] text-right">
                      {ui.phone !== "—" ? (
                        <a href={`tel:${ui.phone}`} className="underline">
                          {ui.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                      {/* {ui.altPhone ? (
                        <>
                          <span className="text-gray-400 mx-1">•</span>
                          <a href={`tel:${ui.altPhone}`} className="underline">{ui.altPhone}</a>
                        </>
                      ) : null} */}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-[11px] text-gray-500">
                      Address / Pickup
                    </p>
                    <p className="font-medium text-sm text-gray-800 max-w-[55%] text-right truncate">
                      {ui.address}
                    </p>
                  </div>

                  {/* <div className="flex justify-between">
                    <p className="text-[11px] text-gray-500">Scheduled</p>
                    <p className="font-medium text-sm text-gray-800">{ui.scheduled}</p>
                  </div> */}

                  <div className="flex justify-between">
                    <p className="text-[11px] text-gray-500">Sale</p>
                    <p className="font-medium text-sm text-gray-800 max-w-[55%] text-right truncate">
                      {ui.saleCat} • {ui.saleStatus} • {ui.saleIdShort}
                    </p>
                  </div>

                  {/* <div className="flex justify-between">
                    <p className="text-[11px] text-gray-500">Requested By</p>
                    <p className="font-medium text-sm text-gray-800">{ui.requester}</p>
                  </div> */}

                  <div className="flex justify-between">
                    <p className="text-[11px] text-gray-500">Status</p>
                    <span
                      className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${ui.status === "PENDING"
                          ? "bg-[#FFF4E5] text-[#B54708] border-[#FEDF89]"
                          : ui.status === "ASSIGNED"
                            ? "bg-[#E8F5FF] text-[#1E66F5] border-[#B3DAFE]"
                            : ui.status === "COMPLETED"
                              ? "bg-[#D1E7DD] text-[#0F5132] border-[#BADBCC]"
                              : ui.status === "REJECTED"
                                ? "bg-[#F8D7DA] text-[#842029] border-[#F5C2C7]"
                                : "bg-[#F0F1F3] text-[#3F3F46] border-[#E4E4E7]"
                        }`}
                    >
                      {ui.status}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-[11px] text-gray-500">Created</p>
                    <p className="font-medium text-sm text-gray-800">
                      {ui.created}
                    </p>
                  </div>

                  {ui.description ? (
                    <div className="pt-1">
                      <p className="text-[11px] text-gray-500 mb-1">Note</p>
                      <p className="text-sm text-gray-800">{ui.description}</p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-1 pt-1">
                    {ui.installerAssigned && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F0FE] border border-[#B3DAFE]">
                        Installer assigned
                      </span>
                    )}
                    {ui.acceptedAt && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5FF] border border-[#B3DAFE]">
                        Accepted {fmtDate(ui.acceptedAt)}
                      </span>
                    )}
                    {ui.completedDate && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D1E7DD] border border-[#BADBCC]">
                        Completed {fmtDate(ui.completedDate)}
                      </span>
                    )}
                    {ui.rejectedAt && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F8D7DA] border border-[#F5C2C7]">
                        Rejected {fmtDate(ui.rejectedAt)}
                      </span>
                    )}
                  </div>

                  {/* Assign button per card */}
                  <div className="pt-2">
                    <button
                      className="w-full py-2 rounded-full bg-gradient-to-r from-primary-hex to-primary-shade-1 text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                      onClick={(e) => {
                        e.stopPropagation(); // don't toggle selection when clicking button
                        onAssign(ui.id);
                      }}
                      type="button"
                      disabled={ui.status === "COMPLETED"}
                      title={
                        ui.status === "COMPLETED"
                          ? "Completed task cannot be reassigned"
                          : "Assign this task to an installer"
                      }
                    >
                      {ui.installerAssigned
                        ? "Re-Assign"
                        : "Assign to Installer"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-[120px]">
            <p className="text-[12px] text-gray-500">
              No task available right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewTasks;
