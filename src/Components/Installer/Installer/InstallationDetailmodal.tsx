import React, { useState } from "react";
// import { Modal } from "../ModalComponent/Modal";
// import { DropDown } from "../DropDownComponent/DropDown";
import { GoDotFill } from "react-icons/go";
import personIcon from "@/assets/settings/user.svg";
import locationIcon from "@/assets/table/inventory.svg";
import productIcon from "@/assets/table/product.svg";
import deviceIcon from "@/assets/table/status.svg";
import calendarIcon from "@/assets/table/date.svg";
import { Modal } from "@/Components/ModalComponent/Modal";
import { DropDown } from "@/Components/DropDownComponent/DropDown";
import LocationUpdateCard from "../Task/LocationUpdateCard";
import AcceptTaskButton from "../Task/AcceptTaskButton";
import { toast } from "react-toastify";
import { useApiCall } from "@/utils/useApiCall";


interface InstallationDetailModalProps {
  refreshTable: any;
  isOpen: boolean;
  onClose: () => void;
  installationData?: {
    id: string;
    status: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    installation: {
      address: string;
      longitude: string;
      latitude: string;
    };
    product: {
      category: string;
      type: string[];
      name: string[];
      id: string;
    };
    device: {
      id: string;
      tokenStatus: string;
      deviceStatus: string;
    };
    general: {
      date: string;
      time: string;
    };
  };
}

const InstallationDetailModal: React.FC<InstallationDetailModalProps> = ({
  isOpen,
  onClose,
  installationData,
  refreshTable
}) => {
  const [isLocationUpdateOpen, setIsLocationUpdateOpen] = useState(false);

  const { apiCall } = useApiCall();

  const [isUpdating, setiIsUpdating] = useState(false)


  const handleUpdateLocation = async (data: {
    location: string;
    longitude: string;
    latitude: string;
  }) => {
    try {
      setiIsUpdating(true);

      await apiCall({
        endpoint: `/v1/installer/tasks/${installationData?.id}/location`,
        method: "post",
        data,
        successMessage: "Location updated successfully!",
      });

      // Refresh the task list
      if (refreshTable) {
        await refreshTable();
      }
      setIsLocationUpdateOpen(false);
      onClose()
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Error updating location:");
    } finally{
      setiIsUpdating(false)
    }
  };
  // If no installation data is provided, show empty state or return early
  if (!installationData) {
    return (
      <Modal
        layout="right"
        bodyStyle="pb-44 overflow-auto"
        isOpen={isOpen}
        onClose={onClose}
      >
        <div className="bg-white">
          <header className="flex items-center justify-between bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree">
            <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
              Installation Details
            </p>
          </header>
          <div className="flex flex-col items-center justify-center px-4 py-16 w-full">
            <p className="text-textBlack font-medium">
              No installation data available
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  const data = installationData;

  console.log(data, "data__data");

  const dropDownList = {
    items: ["Export Details", "Print Details"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          console.log("Export installation details");
          break;
        case 1:
          console.log("Print installation details");
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
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

  return (
    <Modal
      layout="right"
      bodyStyle="pb-44 overflow-auto"
      isOpen={isOpen}
      onClose={onClose}
      leftHeaderComponents={
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            data.status.toLowerCase() === "installed"
              ? "bg-green-100 text-green-800"
              : data.status.toLowerCase() === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <GoDotFill className="w-2 h-2" />
          {data.status}
        </div>
      }
    >
      <div className="bg-white">
        <header className="flex items-center justify-between bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree">
          <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
            Installation #{data.id}
          </p>
          <DropDown {...dropDownList} />
        </header>

        <div className="flex flex-col w-full gap-1 px-4 py-2 max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2">
            <Field label="Installation ID" value={data.id} />
          </div>

          <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2">
            <Field
              label="Installation Status"
              value={data.status.charAt(0) + data.status.slice(1).toLowerCase()}
            />
          </div>

          <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2 space-y-1">
            <div className="flex items-center gap-2">
              <img
                src={personIcon}
                alt="Customer"
                className="w-4 h-4 filter grayscale opacity-60"
              />
              <h3 className="text-textLightGrey text-xs font-medium uppercase">
                Customer Details
              </h3>
            </div>
            <Field label="Name" value={data.customer.name} />
            <Field label="Email" value={data.customer.email} />
            <Field label="Phone Number" value={data.customer.phone} />
          </div>

          <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2 space-y-1">
            <div className="flex items-center gap-2">
              <img
                src={locationIcon}
                alt="Location"
                className="w-4 h-4 filter grayscale opacity-60"
              />
              <h3 className="text-textLightGrey text-xs font-medium uppercase">
                Installation Details
              </h3>
            </div>
            <Field label="Google Address" value={data.installation.address} />
            <Field label="Longitude" value={data.installation.longitude} />
            <Field label="Latitude" value={data.installation.latitude} />
          </div>

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
                  Product Category
                </span>
              </div>
              <div className="flex gap-1">
                <span className="bg-purpleBlue px-1.5 py-0.5 rounded-full text-xs font-medium text-textBlack">
                  {data.product.category}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="bg-[#F8F9FB] px-2.5 py-1 rounded-full">
                <span className="text-textDarkBrown text-xs font-medium">
                  Product Type
                </span>
              </div>
              <div className="flex gap-1">
                {data.product.type.map((type, index) => (
                  <span
                    key={index}
                    className="bg-purpleBlue px-1.5 py-0.5 rounded-full text-xs font-medium text-textBlack"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="bg-[#F8F9FB] px-2.5 py-1 rounded-full">
                <span className="text-textDarkBrown text-xs font-medium">
                  Product Name
                </span>
              </div>
              <div className="flex gap-1">
                {data.product.name.map((name, index) => (
                  <span
                    key={index}
                    className="bg-purpleBlue px-1.5 py-0.5 rounded-full text-xs font-medium text-textBlack"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <Field label="Product ID" value={data.product.id} />
          </div>

          <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2 space-y-1">
            <div className="flex items-center gap-2">
              <img
                src={deviceIcon}
                alt="Device"
                className="w-4 h-4 filter grayscale opacity-60"
              />
              <h3 className="text-textLightGrey text-xs font-medium uppercase">
                Device Details
              </h3>
            </div>
            <Field label="Device ID" value={data.device.id} />
            <Field label="Token Status" value={data.device.tokenStatus} />
            <Field label="Device Status" value={data.device.deviceStatus} />
          </div>

          <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-2 space-y-1">
            <div className="flex items-center gap-2">
              <img
                src={calendarIcon}
                alt="Calendar"
                className="w-4 h-4 filter grayscale opacity-60"
              />
              <h3 className="text-textLightGrey text-xs font-medium uppercase">
                General Details
              </h3>
            </div>
            <Field label="Date" value={data.general.date} />
            <Field label="Time" value={data.general.time} />
          </div>
          {data?.status?.toLowerCase() === "accepted" && (
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
      </div>
      <LocationUpdateCard
        isOpen={isLocationUpdateOpen}
        onClose={() => setIsLocationUpdateOpen(false)}
        onUpdateLocation={handleUpdateLocation}
        loading={isUpdating}
      />
    </Modal>
  );
};

export default InstallationDetailModal;
