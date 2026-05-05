import { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { KeyedMutator } from "swr";
import { Input, SelectInput } from "../InputComponent/Input";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { useApiCall } from "../../utils/useApiCall";
import { z } from "zod";
import ApiErrorMessage from "../ApiErrorMessage";
import { copyToClipboard } from "@/utils/helpers";
import { FiCopy } from "react-icons/fi";
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

type AgentCredentials = {
  agentId: string;
  name: string;
  category: string;
  email: string;
  password: string;
};

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
  const [createdCredentials, setCreatedCredentials] =
    useState<AgentCredentials | null>(null);

  const resetState = () => {
    setFormData(defaultAgentsFormData);
    setFormErrors([]);
    setApiError("");
    setCreatedCredentials(null);
  };

  const getFirstValue = (
    source: Record<string, any> | null | undefined,
    paths: string[]
  ) => {
    if (!source) return undefined;
    for (const path of paths) {
      const value = path
        .split(".")
        .reduce<any>((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), source);
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
    return undefined;
  };

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
      const response = await apiCall({
        endpoint: "/v1/agents/create",
        method: "post",
        data: validatedData,
        successMessage: "Agent created successfully!",
      });

      const responseData = response?.data ?? response ?? {};
      const payload =
        responseData?.data ||
        responseData?.agent ||
        responseData?.agentData ||
        responseData;

      const responsePassword = getFirstValue(payload, [
        "temporaryPassword",
        "tempPassword",
        "plainPassword",
        "generatedPassword",
        "password",
        "credentials.password",
        "user.temporaryPassword",
        "user.tempPassword",
      ]);

      const safePassword =
        responsePassword && !String(responsePassword).startsWith("$argon2")
          ? String(responsePassword)
          : "Not returned";

      const responseAgentId = getFirstValue(payload, [
        "agentId",
        "id",
        "agent.id",
        "data.agentId",
      ]);

      const responseEmail = getFirstValue(payload, [
        "email",
        "user.email",
        "credentials.email",
      ]);

      const responseCategory = getFirstValue(payload, [
        "category",
        "user.category",
        "agent.category",
      ]);

      const responseFirstname = getFirstValue(payload, [
        "firstname",
        "user.firstname",
      ]);
      const responseLastname = getFirstValue(payload, [
        "lastname",
        "user.lastname",
      ]);

      setCreatedCredentials({
        agentId: String(responseAgentId ?? "N/A"),
        name:
          `${String(responseFirstname ?? validatedData.firstname)} ${String(
            responseLastname ?? validatedData.lastname
          )}`.trim() || "N/A",
        category: String(responseCategory ?? validatedData.category ?? "SALES"),
        email: String(responseEmail ?? validatedData.email ?? "N/A"),
        password: safePassword,
      });

      await refreshTable();
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
      onClose={() => {
        setIsOpen(false);
        resetState();
      }}
      layout="right"
      bodyStyle="pb-44"
    >
      {!createdCredentials ? (
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
      ) : (
        <div className="bg-white min-h-full">
          <div className="flex items-center justify-center min-h-[84px] border-b border-[#DDE4EE] bg-[#FFF7E2]">
            <h2 className="text-[20px] font-semibold text-textBlack font-secondary">
              Agent Credentials
            </h2>
          </div>

          <div className="p-4">
            <p className="text-[18px] text-textDarkGrey">
              These login credentials will not be shown again. Please store them securely now.
            </p>

            <div className="relative mt-4 rounded-[14px] border border-[#D4DCE8] bg-[#F8FAFC] px-4 py-4">
              <button
                type="button"
                className="absolute right-3 top-3 text-[#A31D18]"
                onClick={() =>
                  copyToClipboard(
                    `Agent ID: ${createdCredentials.agentId}\nName: ${createdCredentials.name}\nCategory: ${createdCredentials.category}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
                  )
                }
                title="Copy all"
              >
                <FiCopy size={18} />
              </button>

              <div className="space-y-2">
                <p className="text-[18px] text-textDarkGrey">
                  <span className="font-semibold">Agent ID:</span> {createdCredentials.agentId}
                </p>
                <p className="text-[18px] text-textDarkGrey">
                  <span className="font-semibold">Name:</span> {createdCredentials.name}
                </p>
                <p className="text-[18px] text-textDarkGrey">
                  <span className="font-semibold">Category:</span> {createdCredentials.category}
                </p>
                <p className="text-[18px] text-textDarkGrey">
                  <span className="font-semibold">Email:</span> {createdCredentials.email}{" "}
                  <button
                    type="button"
                    className="text-[#B1462B] font-semibold ml-1"
                    onClick={() => copyToClipboard(createdCredentials.email)}
                  >
                    Copy
                  </button>
                </p>
                <p className="text-[18px] text-textDarkGrey">
                  <span className="font-semibold">Password:</span> {createdCredentials.password}{" "}
                  <button
                    type="button"
                    className="text-[#B1462B] font-semibold ml-1"
                    onClick={() => copyToClipboard(createdCredentials.password)}
                  >
                    Copy
                  </button>
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 h-[56px] w-full rounded-[12px] bg-primaryGradient text-white text-[16px] font-semibold"
              onClick={() => {
                setIsOpen(false);
                resetState();
              }}
            >
              I have stored these credentials
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreateNewAgents;
