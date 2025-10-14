import React, { useState } from "react";
import { Input, SelectInput } from "../InputComponent/Input";
import StateLgaSelect from "../InputComponent/StateLgaSelect";
import IdTypeSelect from "../InputComponent/IdTypeSelect";
import { UploadPhotoInput } from "../InputComponent/UploadPhotoInput";
import { z } from "zod";
import { useApiCall } from "../../utils/useApiCall";
import { KeyedMutator } from "swr";
import { Modal } from "../ModalComponent/Modal";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import ApiErrorMessage from "../ApiErrorMessage";

interface CreatNewCustomerProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allCustomerRefresh: KeyedMutator<any>;
}

const customerSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .max(20, "Phone number cannot be more than 20 digits")
    .transform((val) => val.replace(/\s+/g, "")),
  alternatePhone: z
    .string()
    .trim()
    .min(1, "Alternate phone is required")
    .max(20, "Alternate phone cannot be more than 20 digits")
    .transform((val) => val.replace(/\s+/g, "")),
  gender: z.string().min(1, "Gender is required"),
  addressType: z
    .enum(["HOME", "WORK"], {
      errorMap: () => ({ message: "Please select an address type" }),
    })
    .default("HOME"),
  installationAddress: z.string().min(1, "Installation address is required"),
  lga: z.string().min(1, "LGA is required"),
  state: z.string().min(1, "State is required"),
  location: z.string().trim().min(1, "Location is required"),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  idType: z.string().optional(),
  idNumber: z.string().optional(),
  type: z.string().optional(),
  passportPhoto: z.instanceof(File).optional(),
  idImage: z.instanceof(File).optional(),
  contractFormImage: z.instanceof(File).optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const defaultFormData: CustomerFormData = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  alternatePhone: "",
  gender: "",
  addressType: "HOME",
  installationAddress: "",
  lga: "",
  state: "",
  location: "",
  longitude: "",
  latitude: "",
  idType: "",
  idNumber: "",
  type: "",
  passportPhoto: undefined,
  idImage: undefined,
  contractFormImage: undefined,
};

const CreateNewCustomer = ({
  isOpen,
  setIsOpen,
  allCustomerRefresh,
}: CreatNewCustomerProps) => {
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    resetFormErrors(name);
  };

  const handlePhotoChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      passportPhoto: file || undefined,
    }));
    resetFormErrors("passportPhoto");
  };

  const handleIdImageChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      idImage: file || undefined,
    }));
    resetFormErrors("idImage");
  };

  const handleContractFormImageChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      contractFormImage: file || undefined,
    }));
    resetFormErrors("contractFormImage");
  };

  const handleSelectChange = (name: string, values: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
    resetFormErrors(name);
  };

  const resetFormErrors = (name: string) => {
    // Clear the error for this field when the user starts typing
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = customerSchema.parse(formData);
      
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      Object.entries(validatedData).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formDataToSend.append(key, value);
        }
      });

      await apiCall({
        endpoint: "/v1/customers/create",
        method: "post",
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        successMessage: "Customer created successfully!",
      });

      await allCustomerRefresh();
      setIsOpen(false);
      setFormData(defaultFormData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          "Customer Creation Failed: Internal Server Error";
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = customerSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      layout="right"
      bodyStyle="pb-[100px]"
    >
      <form
        className="flex flex-col items-center bg-white"
        onSubmit={handleSubmit}
        noValidate
      >
        <div
          className={`flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree ${
            isFormFilled
              ? "bg-paleCreamGradientLeft"
              : "bg-paleGrayGradientLeft"
          }`}
        >
          <h2
            style={{ textShadow: "1px 1px grey"}}
            className="text-xl text-textBlack font-semibold font-secondary"
          >
            New Customer
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          <UploadPhotoInput
            label="Photograph"
            value={formData.passportPhoto}
            onChange={handlePhotoChange}
            errorMessage={getFieldError("passportPhoto")}
            required={false}
            maxSizeInMB={2}
          />
          <Input
            type="text"
            name="firstname"
            label="* First Name"
            value={formData.firstname}
            onChange={handleInputChange}
            placeholder="First Name"
            required={true}
            errorMessage={getFieldError("firstname")}
          />
          <Input
            type="text"
            name="lastname"
            label="* Last Name"
            value={formData.lastname}
            onChange={handleInputChange}
            placeholder="Last Name"
            required={true}
            errorMessage={getFieldError("lastname")}
          />
          <Input
            type="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            required={false}
            errorMessage={getFieldError("email")}
          />
          <Input
            type="text"
            name="phone"
            label="* Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            required={true}
            errorMessage={getFieldError("phone")}
          />
          <Input
            type="text"
            name="alternatePhone"
            label="* Alternative Phone Number"
            value={formData.alternatePhone}
            onChange={handleInputChange}
            placeholder="Alternate Phone Number"
            required={true}
            errorMessage={getFieldError("alternatePhone")}
          />
          <SelectInput
            label="* Gender"
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]}
            value={formData.gender}
            onChange={(selectedValue) => handleSelectChange("gender", selectedValue)}
            required={true}
            placeholder="Gender"
            errorMessage={getFieldError("gender")}
          />
          <SelectInput
            label="* Address type (Home/Work)"
            options={[
              { label: "Home", value: "HOME" },
              { label: "Work", value: "WORK" },
            ]}
            value={formData.addressType}
            onChange={(selectedValue) => handleSelectChange("addressType", selectedValue)}
            required={true}
            placeholder="Address type"
            errorMessage={getFieldError("addressType")}
          />
          <StateLgaSelect
            state={formData.state}
            lga={formData.lga}
            onStateChange={(selectedState) => handleSelectChange("state", selectedState)}
            onLgaChange={(selectedLga) => handleSelectChange("lga", selectedLga)}
            required={true}
            stateError={getFieldError("state")}
            lgaError={getFieldError("lga")}
          />
          <IdTypeSelect
            value={formData.idType || ""}
            onChange={(selectedValue) => handleSelectChange("idType", selectedValue)}
            required={false}
            errorMessage={getFieldError("idType")}
          />
          <Input
            type="text"
            name="idNumber"
            label="ID Number"
            value={formData.idNumber || ""}
            onChange={handleInputChange}
            placeholder="ID number"
            required={false}
            errorMessage={getFieldError("idNumber")}
          />
          <UploadPhotoInput
            label="ID Image"
            value={formData.idImage}
            onChange={handleIdImageChange}
            errorMessage={getFieldError("idImage")}
            required={false}
            maxSizeInMB={2}
          />
          <UploadPhotoInput
            label="Contract Form Image"
            value={formData.contractFormImage}
            onChange={handleContractFormImageChange}
            errorMessage={getFieldError("contractFormImage")}
            required={false}
            maxSizeInMB={2}
          />
          <Input
            type="text"
            name="location"
            label="Location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Home Address"
            required={true}
            errorMessage={getFieldError("location")}
          />
          <Input
            type="text"
            name="installationAddress"
            label="* Address"
            value={formData.installationAddress}
            onChange={handleInputChange}
            placeholder="Installation address"
            required={false}
            errorMessage={getFieldError("installationAddress")}
          />
          <Input
            type="text"
            name="longitude"
            label="Longitude"
            value={formData.longitude || ""}
            onChange={handleInputChange}
            placeholder="Longitude"
            required={false}
            errorMessage={getFieldError("longitude")}
          />
          <Input
            type="text"
            name="latitude"
            label="Latitude"
            value={formData.latitude || ""}
            onChange={handleInputChange}
            placeholder="Latitude"
            required={false}
            errorMessage={getFieldError("latitude")}
          />
          <SelectInput
            label="Customer Type"
            options={[
              { label: "Lead", value: "lead" },
              { label: "Purchase", value: "purchase" },
            ]}
            value={formData.type || ""}
            onChange={(selectedValue) => handleSelectChange("type", selectedValue)}
            required={false}
            placeholder="Customer type"
            errorMessage={getFieldError("type")}
          />
          <ApiErrorMessage apiError={apiError} />
          <ProceedButton
            type="submit"
            loading={loading}
            variant={isFormFilled ? "gradient" : "gray"}
            disabled={!isFormFilled}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateNewCustomer;
