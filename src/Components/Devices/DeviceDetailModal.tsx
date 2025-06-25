import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import React, { useMemo, useState } from "react";
import { KeyedMutator } from "swr";
import { TabNamesType } from "../Inventory/InventoryDetailModal";
import { Modal } from "../ModalComponent/Modal";
import { DeviceEntries } from "./DevicesTable";
import editInput from "../../assets/settings/editInput.svg";
import TabComponent from "../TabComponent/TabComponent";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import DeviceDetails from "./DeviceDetails";
import { DropDown } from "../DropDownComponent/DropDown";
import { toast } from "react-toastify";

const DeviceDetailModal = ({
  isOpen,
  setIsOpen,
  deviceID,
  refreshTable,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deviceID: string;
  refreshTable: KeyedMutator<any>;
}) => {
  const { apiCall } = useApiCall();
  const fetchSingleDevice = useGetRequest(`/v1/device/${deviceID}`, false);

  const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [tabContent, setTabContent] = useState<string>("details");

  const tabNames: TabNamesType[] = [
    { name: "Details", key: "details", count: null },
  ];

  const getDeviceDetailsData = (data: DeviceEntries) => {
    return { ...data };
  };

  const deviceData = useMemo(() => {
    return getDeviceDetailsData(fetchSingleDevice?.data);
  }, [fetchSingleDevice]);

  const handleCancelClick = () => setDisplayInput(false);

  const deleteDeviceById = async () => {
    const confirmation = prompt(
      `Are you sure you want to delete the device with serial number "${deviceData?.serialNumber}" This action is irreversible! Enter "Yes" or "No".`,
      "No"
    );

    if (confirmation?.trim()?.toLowerCase() === "yes") {
      toast.info(`Deleting "${deviceData?.serialNumber}" device`);
      apiCall({
        endpoint: `/v1/device/${deviceID}`,
        method: "delete",
        successMessage: "Device deleted successfully!",
      })
        .then(async () => {
          await refreshTable();
          setIsOpen(false);
        })
        .catch(() =>
          toast.error(`Failed to delete "${deviceData?.serialNumber}" device`)
        );
    }
  };

  const dropDownList = {
    items: ["Delete Device"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          deleteDeviceById();
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  return (
    <Modal
      layout="right"
      bodyStyle="pb-44"
      isOpen={isOpen}
      onClose={() => {
        setTabContent("details");
        setIsOpen(false);
        handleCancelClick();
      }}
      rightHeaderComponents={
        displayInput ? (
          <p
            className="text-xs text-textDarkGrey font-semibold cursor-pointer over"
            onClick={handleCancelClick}
            title="Cancel editing inventory details"
          >
            Cancel Edit
          </p>
        ) : (
          <button
            className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full hover:bg-slate-100"
            onClick={() => setDisplayInput(true)}
          >
            <img src={editInput} alt="Edit Button" width="15px" />
          </button>
        )
      }
    >
      <div className="bg-white">
        <header
          className={`flex items-center ${
            deviceData?.serialNumber ? "justify-between" : "justify-end"
          } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
        >
          {deviceData?.serialNumber && (
            <p className="flex items-center justify-center bg-[#F6F8FA] w-max px-2 py-1 h-[24px] text-textBlack text-xs border-[0.4px] border-strokeGreyTwo rounded-full">
              {deviceData?.serialNumber}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            <DropDown {...dropDownList} />
          </div>
        </header>
        <div className="flex flex-col w-full gap-4 px-4 py-2">
          <TabComponent
            tabs={tabNames.map(({ name, key, count }) => ({
              name,
              key,
              count,
            }))}
            onTabSelect={(key) => setTabContent(key)}
          />
          {tabContent === "details" ? (
            <DataStateWrapper
              isLoading={fetchSingleDevice?.isLoading}
              error={fetchSingleDevice?.error}
              errorStates={fetchSingleDevice?.errorStates}
              refreshData={fetchSingleDevice?.mutate}
              errorMessage="Failed to fetch device details"
            >
              <DeviceDetails
                deviceData={deviceData}
                displayInput={displayInput}
                refreshTable={refreshTable}
                refreshListView={fetchSingleDevice.mutate}
                setDisplayInput={setDisplayInput}
              />
            </DataStateWrapper>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default DeviceDetailModal;
