import React, { useState } from "react";
import { z } from "zod";
import { useApiCall } from "@/utils/useApiCall";
import { Input, SelectInput } from "../InputComponent/Input";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { Modal } from "../ModalComponent/Modal";
import ApiErrorMessage from "../ApiErrorMessage";

const formSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .trim()
    .min(10, "Phone number must be at least 10 digits"),
  addressType: z
    .enum(["HOME", "WORK"], {
      errorMap: () => ({ message: "Please select an address type" }),
    })
    .default("HOME"),
  location: z.string().min(1, "Location is required"),
  longitude: z.string()
    .optional()
    .default(""),
  latitude: z.string()
    .optional()
    .default(""),
  category: z.enum(["SALES", "INSTALLER", "BUSINESS"]),
  bvn: z.string()
    .trim()
    .length(11, "BVN must be exactly 11 digits")
    .optional()
    .default(""),
  emailVerified: z.boolean(),
});

const defaultFormData = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  addressType: "HOME" as "HOME" | "WORK",
  location: "",
  longitude: "",
  latitude: "",
  category: "SALES" as "SALES" | "INSTALLER" | "BUSINESS",
  bvn: "",
  emailVerified: true,
};

type FormData = z.infer<typeof formSchema>;

interface AddNewAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddNewAgentModal: React.FC<AddNewAgentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { apiCall } = useApiCall();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError(null);
  };

  const resetForm = () => {
    setLoading(false);
    setFormData(defaultFormData);
    setFormErrors([]);
    setApiError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);

    try {
      const validatedData = formSchema.parse(formData);
      
      console.log('Data being sent to API:', validatedData);

      const response = await apiCall({
        endpoint: '/v1/agents/create',
        method: 'post',
        data: validatedData,
        successMessage: 'Agent created successfully'
      });

      if (response?.data) {
        onSuccess?.();
        resetForm();
      }
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        setApiError(error instanceof Error ? error.message : 'Failed to create agent');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = formSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetForm}
      layout="right"
      bodyStyle="pb-44"
    >
      <form className="flex flex-col items-center bg-white">
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
            New Agent
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          <Input
            type="text"
            name="firstname"
            label="First Name"
            value={formData.firstname}
            onChange={handleInputChange}
            placeholder="First Name"
            required={true}
            errorMessage={getFieldError("firstname")}
          />
          <Input
            type="text"
            name="lastname"
            label="Last Name"
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
            required={true}
            errorMessage={getFieldError("email")}
          />
          <Input
            type="tel"
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            required={true}
            errorMessage={getFieldError("phone")}
          />
          <Input
            type="text"
            name="location"
            label="Location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Enter location"
            required={true}
            errorMessage={getFieldError("location")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <Input
              type="text"
              name="longitude"
              label="Longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="Longitude"
              required={false}
              errorMessage={getFieldError("longitude")}
            />
            <Input
              type="text"
              name="latitude"
              label="Latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="Latitude"
              required={false}
              errorMessage={getFieldError("latitude")}
            />
          </div>
          <Input
            type="text"
            name="bvn"
            label="BVN"
            value={formData.bvn}
            onChange={handleInputChange}
            placeholder="Enter BVN number"
            required={false}
            maxLength={11}
            errorMessage={getFieldError("bvn")}
          />
          <SelectInput
            label="Agent Category"
            options={[
              { label: "Sales", value: "SALES" },
              { label: "Installer", value: "INSTALLER" },
              { label: "Business", value: "BUSINESS" },
            ]}
            value={formData.category}
            onChange={(selectedValue) =>
              handleSelectChange("category", selectedValue)
            }
            required={true}
            placeholder="Agent category"
            errorMessage={getFieldError("category")}
          />
          <SelectInput
            label="Address Type (Home/Work)"
            options={[
              { label: "Home", value: "HOME" },
              { label: "Work", value: "WORK" },
            ]}
            value={formData.addressType}
            onChange={(selectedValue) =>
              handleSelectChange("addressType", selectedValue)
            }
            required={true}
            placeholder="Address type (Home/Work)"
            errorMessage={getFieldError("addressType")}
          />
          <ApiErrorMessage apiError={apiError} />
          <ProceedButton
            type="submit"
            variant={isFormFilled ? "gradient" : "gray"}
            loading={loading}
            disabled={!isFormFilled}
            onClick={handleSubmit}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddNewAgentModal; 