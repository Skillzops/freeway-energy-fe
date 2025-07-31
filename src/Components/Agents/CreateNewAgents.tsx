import { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { KeyedMutator } from "swr";
import { Input, SelectInput } from "../InputComponent/Input";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { useApiCall } from "../../utils/useApiCall";
import { z } from "zod";
import ApiErrorMessage from "../ApiErrorMessage";
// import { GooglePlacesInput } from "../InputComponent/GooglePlacesInput";

interface CreateNewAgentsProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTable: KeyedMutator<any>;
}

const agentSchema = z.object({
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
  emailVerified: z.boolean(),
});

type AgentFormData = z.infer<typeof agentSchema>;

const defaultAgentsFormData = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  addressType: "HOME" as "HOME" | "WORK",
  location: "",
  longitude: "",
  latitude: "",
  category: "SALES" as "SALES" | "INSTALLER" | "BUSINESS",
  emailVerified: true,
};

const CreateNewAgents = ({
  isOpen,
  setIsOpen,
  refreshTable,
}: CreateNewAgentsProps) => {
  const { apiCall } = useApiCall();
  const [formData, setFormData] = useState<AgentFormData>(
    defaultAgentsFormData
  );
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );

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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      const validatedData = agentSchema.parse(formData);
      await apiCall({
        endpoint: "/v1/agents/create",
        method: "post",
        data: validatedData,
        successMessage: "Agent created successfully!",
      });

      await refreshTable();
      setIsOpen(false);
      setFormData(defaultAgentsFormData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          "Agent Creation Failed: Internal Server Error";
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };
  const isFormFilled = agentSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const renderForm = () => {
    const formFields = (
      <>
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
        {/* <GooglePlacesInput
          type="text"
          name="location"
          label="Location"
          value={formData.location}
          placeholder="Search for a location"
          required={true}
          errorMessage={getFieldError("location")}
          onChange={(value, _place, coordinates) => {
            setFormData((prev) => ({
              ...prev,
              location: value,
              longitude: coordinates?.lng || "",
              latitude: coordinates?.lat || "",
            }));
          }}
        /> */}
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
      </>
    );

    return formFields;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      layout="right"
      bodyStyle="pb-44"
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
            New Agents
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          {renderForm()}

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

export default CreateNewAgents;
