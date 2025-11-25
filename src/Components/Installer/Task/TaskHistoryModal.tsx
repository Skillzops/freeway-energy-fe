import React, { useState } from "react";
// import { Modal } from "../ModalComponent/Modal";
// import { DropDown } from "../DropDownComponent/DropDown";
import { GoDotFill } from "react-icons/go";
// import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import personIcon from "@/assets/settings/user.svg";
import locationIcon from "@/assets/table/inventory.svg";
import productIcon from "@/assets/table/product.svg";
import lockIcon from "@/assets/settings/settings.svg";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { Modal } from "@/Components/ModalComponent/Modal";
import { DropDown } from "@/Components/DropDownComponent/DropDown";
import { DataStateWrapper } from "@/Components/Loaders/DataStateWrapper";
import LocationUpdateCard from "./LocationUpdateCard";
import AcceptTaskButton from "./AcceptTaskButton";
import { toast } from "react-toastify";



// Simple Tag component
const Tag = ({ name }: { name: string }) => (
  <p className="text-xs text-textLightGrey font-medium">{name}</p>
);

interface TaskHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
}

const TaskHistoryModal: React.FC<TaskHistoryModalProps> = ({
  isOpen,
  onClose,
  taskId,
}) => {
  const {
    data,
    isLoading,
    error,
    errorStates,
    mutate: refreshData,
  } = useGetRequest(
    taskId ? `/v1/agents/tasks/${taskId}` : null,
    isOpen,
    60000
  );

  const [isLocationUpdateOpen, setIsLocationUpdateOpen] = useState(false);

  const { apiCall } = useApiCall();

  // Use the data directly since we're fetching a specific task
  const taskData = data;

  const dropDownList = {
    items: ["Export Task Details", "Print Task Details"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          console.log("Export task details");
          break;
        case 1:
          console.log("Print task details");
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const [isUpdating, setiIsUpdating] = useState(false);
  const handleUpdateLocation = async (data: {
    location: string;
    longitude: string;
    latitude: string;
  }) => {
    try {
      setiIsUpdating(true);
      await apiCall({
        endpoint: `/v1/installer/tasks/${taskData?.id}/location`,
        method: "post",
        data: data,
        successMessage: "Location updated successfully!",
      });

      // Refresh the task list
      await refreshData();
      onClose();
      setIsLocationUpdateOpen(false);
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Error updating location:");
    } finally {
      setiIsUpdating(false);
    }
  };

  return (
    <Modal
      layout="right"
      size="large"
      bodyStyle="overflow-auto"
      isOpen={isOpen}
      onClose={onClose}
      leftHeaderComponents={
        <p
          className={`flex items-center justify-center gap-1 bg-[#F6F8FA] w-max px-2 py-1 text-xs ${
            taskData?.status === "COMPLETED"
              ? "text-green-600"
              : taskData?.status === "PENDING"
              ? "text-yellow-600"
              : taskData?.status === "ACCEPTED"
              ? "text-blue-600"
              : taskData?.status === "REJECTED" ||
                taskData?.status === "CANCELLED"
              ? "text-red-600"
              : "text-gray-600"
          } border-[0.4px] border-strokeGreyTwo rounded-full uppercase`}
        >
          <GoDotFill />
          {taskData?.status}
        </p>
      }
      leftHeaderContainerClass="pl-2"
    >
      <div className="bg-white h-full">
        <header className="flex items-center justify-between bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree">
          <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
            {taskData?.id}
          </p>
          <DropDown {...dropDownList} />
        </header>

        <div className="flex flex-col w-full gap-4 p-4">
          <DataStateWrapper
            isLoading={isLoading}
            error={error}
            errorStates={errorStates}
            refreshData={refreshData}
            errorMessage="Failed to fetch task details"
          >
            <div className="flex flex-col w-full gap-4">
              {/* Task ID & Status Section */}
              <div className="flex items-center justify-between h-[44px] p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-full">
                <Tag name="Task ID" />
                <p className="text-textDarkGrey text-xs font-bold">
                  {taskData?.id}
                </p>
              </div>

              <div className="flex items-center justify-between h-[44px] p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-full">
                <Tag name="Task Status" />
                <p className="text-textDarkGrey text-xs font-bold">
                  {taskData?.status}
                </p>
              </div>

              {/* Customer Details Section */}
              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                  <img
                    src={personIcon}
                    alt="Customer Icon"
                    className="w-4 h-4"
                  />{" "}
                  CUSTOMER DETAILS
                </p>
                <div className="flex items-center justify-between">
                  <Tag name="Name" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {taskData?.customer?.firstname}{" "}
                    {taskData?.customer?.lastname}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Email" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {taskData?.customer?.email}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Phone Number" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {taskData?.customer?.phone}
                  </p>
                </div>
              </div>

              {/* Installation Address Section */}
              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                  <img
                    src={locationIcon}
                    alt="Location Icon"
                    className="w-4 h-4"
                  />{" "}
                  INSTALLATION ADDRESS
                </p>
                <div className="flex items-center justify-between">
                  <Tag name="Installation Address" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {taskData?.installationAddress}
                  </p>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                  <img
                    src={productIcon}
                    alt="Product Icon"
                    className="w-4 h-4"
                  />{" "}
                  PRODUCT DETAILS
                </p>
                <div className="flex items-center justify-between">
                  <Tag name="Product Type" />
                  <div className="flex gap-1">
                    {taskData?.productType?.split(" ") ||
                      ["Product"].map((type: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full"
                        >
                          {type}
                        </div>
                      ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Warehouse" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {taskData?.warehouse}
                  </p>
                </div>
              </div>

              {/* General Details Section */}
              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                  <img src={lockIcon} alt="General Icon" className="w-4 h-4" />{" "}
                  GENERAL DETAILS
                </p>
                <div className="flex items-center justify-between">
                  <Tag name="Created At" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {new Date(taskData?.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Tag name="Last Updated" />
                  <p className="text-xs font-bold text-textDarkGrey">
                    {new Date(taskData?.updatedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>

              {taskData?.status?.toLowerCase() === "accepted" && (
                <div className="flex justify-center pt-2">
                  <AcceptTaskButton
                    text="Update location"
                    onClick={() => {
                      setIsLocationUpdateOpen(true);
                    }}
                  />
                </div>
              )}
            </div>
            {/* Location Update Card */}
            <LocationUpdateCard
              isOpen={isLocationUpdateOpen}
              onClose={() => setIsLocationUpdateOpen(false)}
              onUpdateLocation={handleUpdateLocation}
              loading={isUpdating}
            />
          </DataStateWrapper>
        </div>
      </div>
    </Modal>
  );
};

export default TaskHistoryModal;
