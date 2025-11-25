import { useState } from "react";
import { KeyedMutator } from "swr";
import { ApiErrorStatesType, useApiCall } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";
import TaskHeader from './TaskHeader';
import TaskCard from './TaskCard';
// import { Modal } from "../ModalComponent/Modal";
import AcceptTaskButton from './AcceptTaskButton';
import RejectTaskButton from './RejectTaskButton';
import LocationUpdateCard from './LocationUpdateCard';
import customerIcon from '@/assets/table/customer.svg';
import productIcon from '@/assets/product-grey.svg';
import inventoryIcon from '@/assets/creditcardgrey.svg';
import settingsIcon from '@/assets/settings.svg';
import wrongIcon from '@/assets/table/wrong.png';
import { Modal } from "@/Components/ModalComponent/Modal";
import { toast } from "react-toastify";



interface TaskEntries {
  id: string;
  dateAssigned: string;
  taskValidity: string;
  requestingAgent: string;
  pickupLocation: string;
  productType: string[];
  deviceId: string;
  tokenStatus: string;
  status: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  productName?: string;
  productId?: string;
}

interface TaskDetailsModalProps {
  tasksData?: any;
  isLoading?: boolean;
  refreshTable?: KeyedMutator<any>;
  error?: any;
  errorData?: ApiErrorStatesType;
  useMockData?: boolean;
  paginationInfo?: () => {
    total: number;
    currentPage: number;
    entriesPerPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setEntriesPerPage: React.Dispatch<React.SetStateAction<number>>;
  };
  setTableQueryParams?: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}

const TaskDetailsModal = ({
  tasksData,
  isLoading = false,
  refreshTable = async () => {},
  error = null,
  errorData = {
    errorStates: [],
    isNetworkError: false,
    isPermissionError: false,
  },
  useMockData = false,
  paginationInfo = () => ({
    total: 0,
    currentPage: 1,
    entriesPerPage: 20,
    setCurrentPage: () => {},
    setEntriesPerPage: () => {},
  }),
  setTableQueryParams = () => {},
}: TaskDetailsModalProps) => {
  const [selectedTask, setSelectedTask] = useState<TaskEntries | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isLocationUpdateOpen, setIsLocationUpdateOpen] = useState(false);
  const { apiCall } = useApiCall();

  const data = tasksData?.data || [];

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentTaskIndex < data.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      await apiCall({
        endpoint: `/v1/installer/tasks/${taskId}/accept`,
        method: "post",
        successMessage: "Task accepted successfully!",
      });

      // Update the task status to 'accepted' so the Update location button appears
      if (selectedTask) {
        setSelectedTask({
          ...selectedTask,
          status: "accepted",
        });
      }

      // Refresh the task list
      await refreshTable();
    } catch (error) {
      console.error("Error accepting task:", error);
    }
  };

  const handleRejectTask = async (taskId: string) => {
    try {
      await apiCall({
        endpoint: `/v1/installer/tasks/${taskId}/reject`,
        method: "post",
        successMessage: "Task rejected successfully!",
      });

      // Refresh the task list
      await refreshTable();
      setIsViewModalOpen(false);
    } catch (error) {
      console.error("Error rejecting task:", error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await apiCall({
        endpoint: `/v1/agents/tasks/${taskId}/complete`,
        method: "post",
        successMessage: "Task completed successfully!",
      });

      // Refresh the task list
      await refreshTable();
    } catch (error) {
      console.error("Error completing task:", error);
    }
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
        endpoint: `/v1/installer/tasks/${selectedTask?.id}/location`,
        method: "post",
        data,
        successMessage: "Location updated successfully!",
      });

      // Refresh the task list
      await refreshTable();
      setIsViewModalOpen(false)
      setIsLocationUpdateOpen(false);
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Error updating location:");

    } finally {
      setiIsUpdating(false);
    }
  };

  const Field = ({
    label,
    value,
  }: {
    label: string;
    value: string | React.ReactNode;
  }) => (
    <div className="flex justify-between items-center w-full">
      <div className="bg-[#F8F9FB] px-2.5 py-1 rounded-full">
        <span className="text-textDarkBrown text-xs font-medium">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-textBlack text-xs font-medium">{value}</span>
      </div>
    </div>
  );

  const Section = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-textDarkBrown text-xs font-medium uppercase">
          {title}
        </h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );

  return (
    <>
      {/* Task Header Card - Always visible */}
      <div className="mb-4">
        <div className="bg-white rounded-full border border-strokeGreyTwo overflow-hidden">
          <TaskHeader
            count={data.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      </div>

      {!error ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="bg-gray-100 h-[400px] rounded-3xl"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 w-full border-[0.6px] border-strokeGreyThree rounded-[20px]">
              <img
                src={wrongIcon}
                alt="No tasks available"
                className="w-[100px]"
              />
              <p className="text-textBlack font-medium">
                {" "}
                Chill up! No tasks assigned yet
              </p>
              <button
                className="bg-[#F6F8FA] px-4 py-1 text-textDarkGrey font-medium border border-strokeGreyTwo mt-4 rounded-full hover:text-textBlack transition-all"
                onClick={async () => {
                  try {
                    if (refreshTable && typeof refreshTable === "function") {
                      await refreshTable();
                    } else {
                      // If no refreshTable function is provided, just reload the page
                      window.location.reload();
                    }
                  } catch (error) {
                    console.error("Error refreshing tasks:", error);
                    // Fallback to page reload
                    window.location.reload();
                  }
                }}
              >
                Refresh Tasks
              </button>
            </div>
          ) : (
            <TaskCard
              dateAssigned={new Date(
                data[currentTaskIndex].dateAssigned
              ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              taskValidity={data[currentTaskIndex].taskValidity}
              requestingAgent={data[currentTaskIndex].requestingAgent}
              pickupLocation={data[currentTaskIndex].pickupLocation}
              productType={data[currentTaskIndex].productType}
              deviceId={data[currentTaskIndex].deviceId}
              tokenStatus={data[currentTaskIndex].tokenStatus}
              onViewTask={() => {
                setSelectedTask(data[currentTaskIndex]);
                setIsViewModalOpen(true);
              }}
            />
          )}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch task list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}

      {/* View Task Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTask(null);
        }}
        layout="right"
      >
        <div className="bg-white">
          {/* Header */}
          <header className="flex items-center justify-between bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree">
            <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
              Task #{selectedTask?.id || "N/A"}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">×</span>
              </button>
              <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">⋯</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex flex-col w-full gap-1 px-4 py-2 max-h-[calc(100vh-80px)] overflow-y-auto">
            {selectedTask && (
              <>
                {/* Task ID Card */}
                <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2">
                  <Field label="Task ID" value={selectedTask?.id || "N/A"} />
                </div>

                {/* Requesting Agent Card */}
                <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2">
                  <Field
                    label="Requesting Agent"
                    value={
                      <div className="flex items-center gap-2">
                        <img
                          src={customerIcon}
                          alt="User"
                          className="w-4 h-4 filter grayscale opacity-60"
                        />
                        <span>{selectedTask?.requestingAgent || "N/A"}</span>
                      </div>
                    }
                  />
                </div>

                {/* Pickup Address Card */}
                <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2">
                  <Field
                    label="Pickup Address"
                    value={selectedTask?.pickupLocation || "N/A"}
                  />
                </div>

                {/* Customer Details Card */}
                <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={customerIcon}
                      alt="Customer"
                      className="w-4 h-4 filter grayscale opacity-60"
                    />
                    <h3 className="text-textLightGrey text-xs font-medium uppercase">
                      Customer Details
                    </h3>
                  </div>
                  <Field
                    label="Name"
                    value={selectedTask?.customerName || "N/A"}
                  />
                  <Field
                    label="Email"
                    value={selectedTask?.customerEmail || "N/A"}
                  />
                  <Field
                    label="Phone Number"
                    value={selectedTask?.customerPhone || "N/A"}
                  />
                </div>

                {/* Product Details Card */}
                <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={productIcon}
                      alt="Product"
                      className="w-4 h-4 filter grayscale opacity-60"
                    />
                    <h3 className="text-textLightGrey text-xs font-medium uppercase">
                      Product Details
                    </h3>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="bg-[#F8F9FB] px-2.5 py-1 rounded-full">
                      <span className="text-textDarkBrown text-xs font-medium">
                        Product Type
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {selectedTask?.productType?.map(
                        (type: string, index: number) => (
                          <span
                            key={index}
                            className="bg-purpleBlue px-1.5 py-0.5 rounded-full text-xs font-medium text-textBlack"
                          >
                            {type}
                          </span>
                        )
                      ) || (
                        <span className="text-textBlack text-xs font-medium">
                          N/A
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="bg-[#F8F9FB] px-2.5 py-1 rounded-full">
                      <span className="text-textDarkBrown text-xs font-medium">
                        Product Name
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="bg-purpleBlue px-1.5 py-0.5 rounded-full text-xs font-medium text-textBlack">
                        {selectedTask?.productName || "N/A"}
                      </span>
                    </div>
                  </div>
                  <Field
                    label="Product ID"
                    value={selectedTask?.productId || "N/A"}
                  />
                </div>

                {/* Device Details Card */}
                <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={inventoryIcon}
                      alt="Device"
                      className="w-4 h-4 filter grayscale opacity-60"
                    />
                    <h3 className="text-textLightGrey text-xs font-medium uppercase">
                      Device Details
                    </h3>
                  </div>
                  <Field
                    label="Device ID"
                    value={selectedTask?.deviceId || "N/A"}
                  />
                  <Field
                    label="Token Status"
                    value={selectedTask?.tokenStatus || "N/A"}
                  />
                </div>

                {/* General Details Card */}
                <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={settingsIcon}
                      alt="General"
                      className="w-4 h-4 filter grayscale opacity-60"
                    />
                    <h3 className="text-textLightGrey text-xs font-medium uppercase">
                      Generaldd Details
                    </h3>
                  </div>
                  <Field
                    label="Date Assigned"
                    value={
                      selectedTask?.dateAssigned
                        ? new Date(
                            selectedTask.dateAssigned
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"
                    }
                  />
                  <Field
                    label="Task Validity"
                    value={
                      selectedTask?.taskValidity
                        ? new Date(
                            selectedTask.taskValidity
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"
                    }
                  />

                  {/* Action Buttons */}
                  {selectedTask.status === "pending" && (
                    <div className="flex justify-center gap-3 pt-2">
                      <RejectTaskButton
                        onClick={() => {
                          handleRejectTask(selectedTask.id);
                          setIsViewModalOpen(false);
                        }}
                      />
                      <AcceptTaskButton
                        onClick={() => {
                          handleAcceptTask(selectedTask.id);
                        }}
                      />
                    </div>
                  )}

                  {selectedTask.status === "accepted" && (
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
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Location Update Card */}
      <LocationUpdateCard
        isOpen={isLocationUpdateOpen}
        onClose={() => setIsLocationUpdateOpen(false)}
        onUpdateLocation={handleUpdateLocation}
        loading={isUpdating}
      />
    </>
  );
};

export default TaskDetailsModal;
