import React, { useState, useRef } from "react";
import { KeyedMutator } from "swr";
import { Tag } from "../Products/ProductDetails";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import customericon from "../../assets/customers/customericon.svg";
import { useApiCall } from "@/utils/useApiCall";
import ApiErrorMessage from "../ApiErrorMessage";
import { UploadPhotoInput } from "../InputComponent/UploadPhotoInput";
import StateLgaSelect from "../InputComponent/StateLgaSelect";
import IdTypeSelect from "../InputComponent/IdTypeSelect";
import { SelectInput } from "../InputComponent/Input";

export type DetailsType = {
  customerId: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  alternatePhone: string;
  gender: string;
  addressType: string;
  installationAddress: string;
  lga: string;
  state: string;
  location: string;
  longitude: string;
  latitude: string;
  idType: string;
  idNumber: string;
  type: string;
  passportPhoto: string;
  idImage: string;
};

interface CustomerDetailsProps extends DetailsType {
  refreshTable: KeyedMutator<any>;
  displayInput?: boolean;
  onEditSuccess?: () => void;
}

const CustomerDetails = ({
  refreshTable,
  displayInput,
  onEditSuccess,
  ...data
}: CustomerDetailsProps) => {
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>("");
  const [formData, setFormData] = useState({
    customerId: data.customerId,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    phoneNumber: data.phoneNumber,
    alternatePhone: data.alternatePhone || "",
    gender: data.gender || "",
    addressType: data.addressType,
    installationAddress: data.installationAddress || "",
    lga: data.lga || "",
    state: data.state || "",
    location: data.location,
    longitude: data.longitude,
    latitude: data.latitude,
    idType: data.idType || "",
    idNumber: data.idNumber || "",
    type: data.type || "",
    passportPhoto: data.passportPhoto,
    idImage: data.idImage || "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idImageFile, setIdImageFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setApiError(""); // Clear any previous errors when user makes changes
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setApiError("");
  };

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    setApiError("");
  };

  const handleIdImageChange = (file: File | null) => {
    setIdImageFile(file);
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && key !== "passportPhoto" && key !== "idImage") {
          formDataToSend.append(key, value);
        }
      });

      if (photoFile) {
        formDataToSend.append("passportPhoto", photoFile);
      }

      if (idImageFile) {
        formDataToSend.append("idImage", idImageFile);
      }

      await apiCall({
        endpoint: `/v1/customers/${formData.customerId}`,
        method: "patch",
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        successMessage: "Customer updated successfully!",
      });

      if (refreshTable) {
        await refreshTable();
      }

      if (onEditSuccess) {
        onEditSuccess();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to update customer";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* User ID Row */}
      <div className="flex items-center justify-between h-[44px] p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-full">
        <Tag name="User ID" />
        <p className="text-textDarkGrey text-xs font-bold">{data.customerId}</p>
      </div>

      {/* Photograph Row */}
      <div className="flex items-center justify-between h-[64px] px-4 bg-white border-[0.6px] border-strokeGreyThree rounded-full">
        <Tag name="Photograph" />
        {displayInput ? (
          <UploadPhotoInput value={photoFile} onChange={handlePhotoChange} maxSizeInMB={2} />
        ) : (
          <div className="flex items-center justify-center max-w-[40px] h-[40px] border-[0.6px] border-strokeCream rounded-full overflow-clip">
            {data.passportPhoto ? (
              <img src={data.passportPhoto} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full">
                <span className="text-[10px] text-textLightGrey">No Passport</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Personal Details Section */}
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Customer Icon" /> PERSONAL DETAILS
        </p>
        {([
          { label: "First Name", name: "firstname" },
          { label: "Last Name", name: "lastname" },
          { label: "Email", name: "email" },
          { label: "Phone Number", name: "phoneNumber" },
          { label: "Alternative Phone Number", name: "alternatePhone" },
          { label: "Gender", name: "gender" },
          { label: "Address Type", name: "addressType" },
          { label: "State", name: "state" },
          { label: "LGA", name: "lga" },
          { label: "Address", name: "location" },
          { label: "Latitude", name: "latitude" },
          { label: "Longitude", name: "longitude" },
        ] as { label: string; name: keyof typeof formData }[]).map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <Tag name={item.label} />
            {displayInput ? (
              <input
                type="text"
                name={item.name}
                value={formData[item.name]}
                onChange={handleChange}
                className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
              />
            ) : (
              <p className="text-xs font-bold text-textDarkGrey">{formData[item.name] || "N/A"}</p>
            )}
          </div>
        ))}
      </div>

      {/* Installation Details Section */}
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Installation Icon" /> INSTALLATION DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Installation Address" />
          {displayInput ? (
            <input
              type="text"
              name="installationAddress"
              value={formData.installationAddress}
              onChange={handleChange}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">{data.installationAddress || "N/A"}</p>
          )}
        </div>
      </div>

      {/* Other Details Section */}
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Other Details Icon" /> OTHER DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="ID Type" />
          {displayInput ? (
            <input
              type="text"
              name="idType"
              value={formData.idType}
              onChange={handleChange}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">{data.idType || "N/A"}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="ID Number" />
          {displayInput ? (
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">{data.idNumber || "N/A"}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="ID Image" />
          {displayInput ? (
            <UploadPhotoInput value={idImageFile} onChange={handleIdImageChange} maxSizeInMB={2} />
          ) : (
            <div className="flex items-center justify-center max-w-[40px] h-[40px] border-[0.6px] border-strokeCream rounded-full overflow-clip">
              {data.idImage ? (
                <img src={data.idImage} alt="ID Image" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full">
                  <span className="text-[10px] text-textLightGrey">No ID Image</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {apiError && <ApiErrorMessage apiError={apiError} />}
      {displayInput && (
        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            loading={loading}
            variant={loading ? "gray" : "gradient"}
            disabled={loading}
            onClick={handleSubmit}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
