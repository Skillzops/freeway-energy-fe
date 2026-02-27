import ApiErrorMessage from "@/Components/ApiErrorMessage";
import IdTypeSelect from "@/Components/InputComponent/IdTypeSelect";
import { Input, SelectInput } from "@/Components/InputComponent/Input";
import StateLgaSelect from "@/Components/InputComponent/StateLgaSelect";
import { UploadPhotoInput } from "@/Components/InputComponent/UploadPhotoInput";
import { Modal } from "@/Components/ModalComponent/Modal";
import ProceedButton from "@/Components/ProceedButtonComponent/ProceedButtonComponent";
import { useApiCall } from "@/utils/useApiCall";
import React, { useState } from "react";
import { KeyedMutator } from "swr";
import axios from "axios";
// import StateLgaSelect from "../InputComponent/StateLgaSelect";
// import IdTypeSelect from "../InputComponent/IdTypeSelect";
// import { UploadPhotoInput } from "../InputComponent/UploadPhotoInput";
import { z } from "zod";


interface CreatNewCustomerProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allCustomerRefresh: KeyedMutator<any>;
}

const MAX_UPLOAD_MB = 1;

const validateFileSize = (file: File | undefined, ctx: z.RefinementCtx, field: string) => {
  if (!file) return;
  const maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${field} must be <= ${MAX_UPLOAD_MB}MB`,
      path: [field],
    });
  }
};

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
  longitude: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return;
      const num = Number(val);
      if (Number.isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Longitude must be a number",
          path: ["longitude"],
        });
      } else if (num < -180 || num > 180) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Longitude must be between -180 and 180",
          path: ["longitude"],
        });
      }
    }),
  latitude: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return;
      const num = Number(val);
      if (Number.isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Latitude must be a number",
          path: ["latitude"],
        });
      } else if (num < -90 || num > 90) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Latitude must be between -90 and 90",
          path: ["latitude"],
        });
      }
    }),
  idType: z.string().optional(),
  idNumber: z.string().optional(),
  type: z.string().optional(),
  passportPhoto: z.instanceof(File).optional().superRefine((file, ctx) => validateFileSize(file, ctx, "passportPhoto")),
  idImage: z.instanceof(File).optional().superRefine((file, ctx) => validateFileSize(file, ctx, "idImage")),
  contractFormImage: z.instanceof(File).optional().superRefine((file, ctx) => validateFileSize(file, ctx, "contractFormImage")),
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

const formatApiError = (error: unknown): string => {
  const networkMessage =
    "Customer creation failed*H: unable to reach the server. Please check your connection and try again.";

  if (axios.isAxiosError(error)) {
    const serverMessage =
      (error.response?.data as any)?.message ||
      (error.response?.data as any)?.error;
    if (serverMessage) {
      if (typeof serverMessage === "string") {
        try {
          const parsed = JSON.parse(serverMessage);
          if (parsed?.message === "Network Error") return networkMessage;
          if (typeof parsed?.message === "string" && parsed.message.trim()) {
            return parsed.message;
          }
        } catch {
          // keep plain-text message
        }

        if (
          serverMessage.includes("AxiosError") &&
          serverMessage.includes("Network Error")
        ) {
          return networkMessage;
        }

        return serverMessage;
      }

      if (
        typeof serverMessage === "object" &&
        serverMessage !== null &&
        "message" in serverMessage &&
        typeof (serverMessage as { message?: unknown }).message === "string"
      ) {
        const message = (serverMessage as { message: string }).message;
        if (message === "Network Error") return networkMessage;
        return message;
      }

      return "Customer creation failed*O: request was rejected by the server.";
    }

    if (!error.response) {
      const attemptedUrl =
        error.config?.baseURL && error.config?.url
          ? `${error.config.baseURL}${error.config.url}`
          : error.config?.url;

      if (attemptedUrl) {
        return `${networkMessage} (Request: ${attemptedUrl})`;
      }

      return networkMessage;
    }
  }

  return "Customer creation failed*I: an unexpected error occurred.";
};

const hasAnyUpload = (data: CustomerFormData): boolean =>
  Boolean(data.passportPhoto || data.idImage || data.contractFormImage);

const toJsonPayload = (data: CustomerFormData) => {
  const payload: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) return;
    if (value !== undefined && value !== "") {
      payload[key] = String(value);
    }
  });
  return payload;
};

const toFormDataPayload = (data: CustomerFormData) => {
  const payload = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      payload.append(key, value);
    }
  });
  return payload;
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
  const [uploadErrors, setUploadErrors] = useState<Record<string, string | undefined>>({});

  const setCustomFieldError = (name: string, message: string) => {
    setFormErrors((prev) => [
      ...prev.filter((error) => error.path[0] !== name),
      { code: z.ZodIssueCode.custom, message, path: [name] } as z.ZodIssue,
    ]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Restrict latitude/longitude to decimals only
    if (name === "latitude" || name === "longitude") {
      const cleaned = value.replace(/[^\d.\-]/g, "");
      const decimalPattern = /^-?\d*(\.\d*)?$/;

      if (!decimalPattern.test(cleaned)) {
        setCustomFieldError(name, "Only decimal numbers are allowed");
      } else {
        resetFormErrors(name);
      }

      setFormData((prev) => ({
        ...prev,
        [name]: cleaned,
      }));
      return;
    }

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

  const setUploadError = (field: "passportPhoto" | "idImage" | "contractFormImage", msg?: string) => {
    setUploadErrors((prev) => ({ ...prev, [field]: msg }));
    if (!msg) {
      resetFormErrors(field);
    }
  };

  const resetFormErrors = (name: string) => {
    // Clear the error for this field when the user starts typing
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // prevent submit when any upload validation error exists
    const activeUploadErrors = Object.values(uploadErrors).filter(Boolean);
    if (activeUploadErrors.length > 0) {
      setLoading(false);
      return;
    }

    try {
      const validatedData = customerSchema.parse(formData);
      const payload = hasAnyUpload(validatedData)
        ? toFormDataPayload(validatedData)
        : toJsonPayload(validatedData);

      await apiCall({
        endpoint: "/v1/customers/create",
        method: "post",
        data: payload,
        successMessage: "Customer created successfully!",
      });

      await allCustomerRefresh();
      setIsOpen(false);
      setFormData(defaultFormData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        setApiError(formatApiError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = customerSchema.safeParse(formData).success;
  const hasUploadErrors = Object.values(uploadErrors).some(Boolean);

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message || uploadErrors[fieldName];
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
            style={{ textShadow: "1px 1px grey" }}
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
            onValidationError={(msg) => setUploadError("passportPhoto", msg)}
            errorMessage={getFieldError("passportPhoto")}
            required={false}
            maxSizeInMB={1}
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
            onValidationError={(msg) => setUploadError("idImage", msg)}
            errorMessage={getFieldError("idImage")}
            required={false}
            maxSizeInMB={1}
          />
          <UploadPhotoInput
            label="Contract Form Image"
            value={formData.contractFormImage}
            onChange={handleContractFormImageChange}
            onValidationError={(msg) => setUploadError("contractFormImage", msg)}
            errorMessage={getFieldError("contractFormImage")}
            required={false}
            maxSizeInMB={1}
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
            variant={isFormFilled && !hasUploadErrors ? "gradient" : "gray"}
            disabled={!isFormFilled || hasUploadErrors}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateNewCustomer;
