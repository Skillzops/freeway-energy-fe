import React, { useState, useRef as _useRef, useEffect } from "react";
import { KeyedMutator } from "swr";
import { Tag } from "../Products/ProductDetails";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import customericon from "../../assets/customers/customericon.svg";
import { useApiCall } from "@/utils/useApiCall";
import ApiErrorMessage from "../ApiErrorMessage";
import { UploadPhotoInput } from "../InputComponent/UploadPhotoInput";
import _StateLgaSelect from "../InputComponent/StateLgaSelect";
import _IdTypeSelect from "../InputComponent/IdTypeSelect";
import { SelectInput as _SelectInput } from "../InputComponent/Input";

export type DetailsType = {
  customerId?: string;
  id?: string;
  firstname: string;
  lastname: string;
  email?: string | null;
  phoneNumber?: string;
  phone?: string;
  alternatePhone?: string;
  gender?: string;
  addressType?: string;
  installationAddress?: string;
  lga?: string;
  state?: string;
  location?: string;
  longitude?: string;
  latitude?: string;
  idType?: string;
  idNumber?: string;
  type?: string;
  passportPhotoUrl?: string;
  idImageUrl?: string;
  contractFormImageUrl?: string;
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
    customerId: data.customerId || data.id,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email || "",
    phoneNumber: data.phoneNumber || data.phone || "",
    alternatePhone: data.alternatePhone || "",
    gender: data.gender || "",
    addressType: data.addressType || "",
    installationAddress: data.installationAddress || "",
    lga: data.lga || "",
    state: data.state || "",
    location: data.location || "",
    longitude: data.longitude || "",
    latitude: data.latitude || "",
    idType: data.idType || "",
    idNumber: data.idNumber || "",
    type: data.type || "",
    passportPhotoUrl: data.passportPhotoUrl || "",
    idImageUrl: data.idImageUrl || "",
    contractFormImageUrl: data.contractFormImageUrl || ""
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idImageFile, setIdImageFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<{url: string;title: string;} | null>(null);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

  // Reset image state when customer changes
  useEffect(() => {
    setPhotoFile(null);
    setIdImageFile(null);
    setContractFile(null);
    setSelectedImage(null);
    setShowImageModal(false);
    setApiError(""); // Clear any previous errors

    // Update formData with new customer data
    setFormData({
      customerId: data.customerId || data.id,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email || "",
      phoneNumber: data.phoneNumber || data.phone || "",
      alternatePhone: data.alternatePhone || "",
      gender: data.gender || "",
      addressType: data.addressType || "",
      installationAddress: data.installationAddress || "",
      lga: data.lga || "",
      state: data.state || "",
      location: data.location || "",
      longitude: data.longitude || "",
      latitude: data.latitude || "",
      idType: data.idType || "",
      idNumber: data.idNumber || "",
      type: data.type || "",
      passportPhotoUrl: data.passportPhotoUrl || "",
      idImageUrl: data.idImageUrl || "",
      contractFormImageUrl: data.contractFormImageUrl || ""
    });
  }, [data]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (photoFile) {
        URL.revokeObjectURL(URL.createObjectURL(photoFile));
      }
      if (idImageFile) {
        URL.revokeObjectURL(URL.createObjectURL(idImageFile));
      }
      if (contractFile) {
        URL.revokeObjectURL(URL.createObjectURL(contractFile));
      }
    };
  }, [photoFile, idImageFile, contractFile]);

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    setApiError(""); // Clear any previous errors when user makes changes
  };

  const _handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
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

  const handleContractFileChange = (file: File | null) => {
    setContractFile(file);
    setApiError("");
  };

  const handleViewImage = (url: string, title: string) => {
    setSelectedImage({ url, title });
    setShowImageModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && key !== "passportPhotoUrl" && key !== "idImageUrl" && key !== "contractFormImageUrl") {
          formDataToSend.append(key, value);
        }
      });

      if (photoFile) {
        formDataToSend.append("passportPhoto", photoFile);
      }

      if (idImageFile) {
        formDataToSend.append("idImage", idImageFile);
      }

      if (contractFile) {
        formDataToSend.append("contractFormImage", contractFile);
      }

      await apiCall({
        endpoint: `/v1/customers/${formData.customerId}`,
        method: "patch",
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data"
        },
        successMessage: "Customer updated successfully!"
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
        <p className="text-textDarkGrey text-xs font-bold">{data.customerId || data.id}</p>
      </div>

      {/* Photograph Row */}
      <div className="flex items-center justify-between h-[64px] px-4 bg-white border-[0.6px] border-strokeGreyThree rounded-full">
        <Tag name="Photograph" />
        {displayInput ?
        <div className="flex items-center gap-2">
            <div className="flex items-center justify-center max-w-[40px] h-[40px] border-[0.6px] border-strokeCream rounded-full overflow-clip">
              {photoFile ?
            <img
              src={URL.createObjectURL(photoFile)}
              alt="New Profile"
              className="w-full h-full object-cover rounded-full" /> :

            data.passportPhotoUrl ?
            <img
              src={data.passportPhotoUrl}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                console.error('Error loading passport photo:', data.passportPhotoUrl);
                e.currentTarget.style.display = 'none';
              }} /> :


            <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full">
                  <span className="text-[10px] text-textLightGrey">No Passport</span>
                </div>
            }
            </div>
            <UploadPhotoInput value={photoFile} onChange={handlePhotoChange} maxSizeInMB={2} />
          </div> :

        <div className="flex items-center gap-2">
            <div className="flex items-center justify-center max-w-[40px] h-[40px] border-[0.6px] border-strokeCream rounded-full overflow-clip">
              {data.passportPhotoUrl ?
            <>
                  <img
                src={data.passportPhotoUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} />

                  <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full hidden" id="passport-fallback">
                    <span className="text-[10px] text-textLightGrey">Error</span>
                  </div>
                </> :

            <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full">
                  <span className="text-[10px] text-textLightGrey">No Passport</span>
                </div>
            }
            </div>
            {data.passportPhotoUrl &&
          <button
            onClick={() => handleViewImage(data.passportPhotoUrl!, "Passport Photo")}
            className="px-2 py-1 text-xs bg-primaryGradient text-white rounded-full hover:bg-primaryGradient/80 transition-colors"
            title="View Passport Photo">

                View
              </button>
          }
          </div>
        }
      </div>

      {/* Personal Details Section */}
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Customer Icon" /> PERSONAL DETAILS
        </p>
        {([
        { label: "First Name", name: "firstname", value: data.firstname },
        { label: "Last Name", name: "lastname", value: data.lastname },
        { label: "Email", name: "email", value: data.email },
        { label: "Phone Number", name: "phoneNumber", value: data.phoneNumber || data.phone },
        { label: "Alternative Phone Number", name: "alternatePhone", value: data.alternatePhone },
        { label: "Gender", name: "gender", value: data.gender },
        { label: "Address Type", name: "addressType", value: data.addressType },
        { label: "State", name: "state", value: data.state },
        { label: "LGA", name: "lga", value: data.lga },
        { label: "Address", name: "location", value: data.location },
        { label: "Latitude", name: "latitude", value: data.latitude },
        { label: "Longitude", name: "longitude", value: data.longitude }] as
        {label: string;name: keyof typeof formData;value: any;}[]).map((item) =>
        <div key={item.label} className="flex items-center justify-between">
            <Tag name={item.label} />
            {displayInput ?
          <input
            type="text"
            name={item.name}
            value={formData[item.name]}
            onChange={handleChange}
            className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full" /> :


          <p className="text-xs font-bold text-textDarkGrey">{item.value || "N/A"}</p>
          }
          </div>
        )}
      </div>

      {/* Installation Details Section */}
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Installation Icon" /> INSTALLATION DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Installation Address" />
          {displayInput ?
          <input
            type="text"
            name="installationAddress"
            value={formData.installationAddress}
            onChange={handleChange}
            className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full" /> :


          <p className="text-xs font-bold text-textDarkGrey">{data.installationAddress || "N/A"}</p>
          }
        </div>
      </div>

      

      {/* Other Details Section */}
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Other Details Icon" /> OTHER DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="ID Type" />
          {displayInput ?
          <input
            type="text"
            name="idType"
            value={formData.idType}
            onChange={handleChange}
            className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full" /> :


          <p className="text-xs font-bold text-textDarkGrey">{data.idType || "N/A"}</p>
          }
        </div>
        <div className="flex items-center justify-between">
          <Tag name="ID Number" />
          {displayInput ?
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full" /> :


          <p className="text-xs font-bold text-textDarkGrey">{data.idNumber || "N/A"}</p>
          }
        </div>
        <div className="flex items-center justify-between">
          <Tag name="ID Image" />
          {displayInput ?
          <div className="flex items-center gap-2">
              <div className="flex items-center justify-center max-w-[40px] h-[40px] border-[0.6px] border-strokeCream rounded-full overflow-clip">
                {idImageFile ?
              <img
                src={URL.createObjectURL(idImageFile)}
                alt="New ID Image"
                className="w-full h-full object-cover rounded-full" /> :

              data.idImageUrl ?
              <img
                src={data.idImageUrl}
                alt="ID Image"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} /> :


              <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full">
                    <span className="text-[10px] text-textLightGrey">No ID Image</span>
                  </div>
              }
              </div>
              <UploadPhotoInput value={idImageFile} onChange={handleIdImageChange} maxSizeInMB={2} />
            </div> :

          <div className="flex items-center gap-2">
              <div className="flex items-center justify-center max-w-[40px] h-[40px] border-[0.6px] border-strokeCream rounded-full overflow-clip">
                {data.idImageUrl ?
              <>
                                      <img
                  src={data.idImageUrl}
                  alt="ID Image"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }} />

                    <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full hidden" id="id-fallback">
                      <span className="text-[10px] text-textLightGrey">Error</span>
                    </div>
                  </> :

              <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full">
                    <span className="text-[10px] text-textLightGrey">No ID Image</span>
                  </div>
              }
              </div>
              {data.idImageUrl &&
            <button
              onClick={() => handleViewImage(data.idImageUrl!, "ID Image")}
              className="px-2 py-1 text-xs bg-primaryGradient text-white rounded-full hover:bg-primaryGradient/80 transition-colors"
              title="View ID Image">

                  View
                </button>
            }
            </div>
          }
        </div>
      </div>

      {/* Contract Details Section */}
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Contract Details Icon" /> CONTRACT DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Contract Document" />
          {displayInput ?
          <div className="flex items-center gap-2">
              <div className="flex items-center justify-center max-w-[40px] h-[40px] border-[0.6px] border-strokeCream rounded-full overflow-clip">
                {contractFile ?
              <img
                src={URL.createObjectURL(contractFile)}
                alt="New Contract File"
                className="w-full h-full object-cover rounded-full" /> :

              data.contractFormImageUrl ?
              <img
                src={data.contractFormImageUrl}
                alt="Contract File"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} /> :


              <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full">
                    <span className="text-[10px] text-textLightGrey">No Contract Document</span>
                  </div>
              }
              </div>
              <UploadPhotoInput value={contractFile} onChange={handleContractFileChange} maxSizeInMB={2} />
            </div> :

          <div className="flex items-center gap-2">
              <div className="flex items-center justify-center max-w-[40px] h-[40px] border-[0.6px] border-strokeCream rounded-full overflow-clip">
                {data.contractFormImageUrl ?
              <>
                    <img
                  src={data.contractFormImageUrl}
                  alt="Contract File"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.getElementById('contract-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }} />

                    <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full hidden" id="contract-fallback">
                      <span className="text-[10px] text-textLightGrey">Error</span>
                    </div>
                  </> :

              <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full">
                    <span className="text-[10px] text-textLightGrey">No Contract Document</span>
                  </div>
              }
              </div>
              {data.contractFormImageUrl &&
            <button
              onClick={() => handleViewImage(data.contractFormImageUrl!, "Contract Document")}
              className="px-2 py-1 text-xs bg-primaryGradient text-white rounded-full hover:bg-primaryGradient/80 transition-colors"
              title="View Contract Document">

                  View
                </button>
            }
            </div>
          }
        </div>
      </div>
      {apiError && <ApiErrorMessage apiError={apiError} />}
      {displayInput &&
      <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
          type="submit"
          loading={loading}
          variant={loading ? "gray" : "gradient"}
          disabled={loading}
          onClick={handleSubmit} />

        </div>
      }

      {/* Image Modal */}
      {showImageModal && selectedImage &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{selectedImage.title}</h3>
              <button
              onClick={() => setShowImageModal(false)}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold">

                ×
              </button>
            </div>
            <div className="flex justify-center">
              <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-[70vh] object-contain rounded"
              onError={(e) => {
                console.error('Error loading image in modal:', selectedImage.url);
                e.currentTarget.style.display = 'none';
              }} />

            </div>
            <div className="flex justify-center mt-4">
              <button
              onClick={() => window.open(selectedImage.url, '_blank')}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors">

                Expand Image
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default CustomerDetails;
