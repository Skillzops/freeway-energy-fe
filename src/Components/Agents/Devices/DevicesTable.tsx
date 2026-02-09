import { ApiErrorStatesType } from "@/utils/useApiCall";
import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { ErrorComponent } from "@/Pages/ErrorPage";
import Table, { PaginationType } from "@/Components/TableComponent/Table";
import { Modal } from "@/Components/ModalComponent/Modal";
import useTokens from "@/hooks/useTokens";
import {
  DeviceHistoryModal,
  ReassignDevicesModal,
  UnassignDevicesModal,
} from "../AgentsModal";

export type DeviceEntries = {
  id: string;
  no?: number;
  serialNumber: string;
  key: string;
  startingCode: string;
  count: number | string;
  timeDivider: string;
  restrictedDigitMode: boolean;
  hardwareModel: string;
  firmwareVersion: string;
  isTokenable: boolean;
  installationStatus?: "installed" | "not_installed" | string;
  saleItemIDs?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Helper function to map the API data to the desired format
const generateDeviceEntries = (data: any): DeviceEntries[] => {
  const entries: DeviceEntries[] = data?.devices?.map(
    (item: DeviceEntries, index: number) => {
      return {
        ...item,
        no: index + 1,
      };
    }
  );
  return entries;
};

const DevicesTable = ({
  devicesData,
  isLoading,
  refreshTable,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  devicesData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isReassignOpen, setIsReassignOpen] = useState<boolean>(false);
  const [isUnassignOpen, setIsUnassignOpen] = useState<boolean>(false);
  const [unassignAction, setUnassignAction] = useState<"RETURN" | "UNASSIGN">(
    "UNASSIGN"
  );
  const [actionDevice, setActionDevice] = useState<DeviceEntries | null>(null);
  const { role, agentDetails, id } = useTokens();
  const roleName = role?.role?.toLowerCase() || "";
  const canModifyAssignments = roleName.includes("admin");
  const canViewHistory = true;
  const currentAgentId = agentDetails?.id || id || "";

  const filterList = [
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          search: query,
        }));
      },
      isSearch: true,
    },
    {
      onDateClick: (date: string) => {
        setQueryValue(date);
        setIsSearchQuery(false);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          createdAt: date.split("T")[0],
        }));
      },
      isDate: true,
    },
  ];

  const columnList = [
    { title: "S/N", key: "no" },
    { title: "SERIAL NUMBER", key: "serialNumber" },
    { title: "INSTALLATION STATUS", key: "installationStatus" },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (_value: any, rowData: DeviceEntries) => (
        <button
          type="button"
          className="px-3 py-1 rounded-full border border-[#E5D9B8] bg-[#FFF7E2] text-[11px] font-semibold text-[#7A5B10] hover:bg-[#FCECC6] transition-colors"
          onClick={() => {
            setActionDevice(rowData);
            setIsOpen(true);
          }}
        >
          Actions
        </button>
      ),
    },
  ];

  const getTableData = () => {
    return generateDeviceEntries(devicesData);
  };

  return (
    <>
      {!errorData?.errorStates[0]?.errorExists ? (
        <div className="w-full">
          <Table
            tableTitle="DEVICES"
            filterList={filterList}
            columnList={columnList}
            loading={isLoading}
            tableData={getTableData()}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
          <Modal
            isOpen={isOpen}
            onClose={() => {
              setIsOpen(false);
              setActionDevice(null);
            }}
            layout="center"
            size="small"
          >
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden" >
              <div className="flex items-start justify-between px-4 py-3 border-b border-strokeGreyThree bg-white rounded-t-2xl">
                <h3 className="text-sm font-semibold text-textBlack">
                  Device Actions
                </h3>
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-xs font-semibold text-textDarkGrey">
                    {actionDevice?.serialNumber || "N/A"}
                  </span>
                  <span className="text-[10px] text-textGrey">Serial Number</span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 gap-3">
                {canViewHistory ? (
                  <button
                    type="button"
                    className="w-full px-4 py-2 rounded-xl border border-[#E5D9B8] bg-[#FFF7E2] text-[#7A5B10] text-sm font-semibold hover:bg-[#FCECC6] transition-colors"
                    onClick={() => {
                      if (actionDevice?.serialNumber) {
                        setIsHistoryOpen(true);
                      }
                      setIsOpen(false);
                    }}
                  >
                    View History
                  </button>
                ) : null}
                {canModifyAssignments ? (
                  <>
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-xl border border-[#CFE2FF] bg-[#F1F6FF] text-[#2457B2] text-sm font-semibold hover:bg-[#E3EEFF] transition-colors"
                      onClick={() => {
                        setIsReassignOpen(true);
                        setIsOpen(false);
                      }}
                    >
                      Reassign
                    </button>
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-xl border border-[#F4C7C7] bg-[#FCECEC] text-[#A32A2A] text-sm font-semibold hover:bg-[#F9DCDC] transition-colors"
                      onClick={() => {
                        setUnassignAction("UNASSIGN");
                        setIsUnassignOpen(true);
                        setIsOpen(false);
                      }}
                    >
                      Unassign
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </Modal>
          <DeviceHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            deviceId={actionDevice?.id || null}
          />
          <ReassignDevicesModal
            isOpen={isReassignOpen}
            onClose={() => setIsReassignOpen(false)}
            currentAgentId={currentAgentId}
            selectedDevices={
              actionDevice?.serialNumber
                ? [{ serialNumber: actionDevice.serialNumber }]
                : []
            }
            onSuccess={async () => {
              setIsReassignOpen(false);
              await refreshTable();
            }}
          />
          <UnassignDevicesModal
            isOpen={isUnassignOpen}
            onClose={() => setIsUnassignOpen(false)}
            actionType={unassignAction}
            selectedDevices={
              actionDevice?.serialNumber
                ? [
                    {
                      serialNumber: actionDevice.serialNumber,
                      deviceId: actionDevice.id,
                    },
                  ]
                : []
            }
            onSuccess={async () => {
              setIsUnassignOpen(false);
              await refreshTable();
            }}
          />
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch inventory list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default DevicesTable;
