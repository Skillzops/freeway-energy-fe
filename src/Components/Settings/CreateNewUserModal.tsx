import React, { useState } from "react";
import { z } from "zod";
import { ApiErrorStatesType, useApiCall } from "@/utils/useApiCall";
import { Input, SelectInput } from "../InputComponent/Input";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { Modal } from "../ModalComponent/Modal";
import { KeyedMutator } from "swr";
import ApiErrorMessage from "../ApiErrorMessage";
import { GooglePlacesInput } from "../InputComponent/GooglePlacesInput";

const formSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  firstname: z.string().trim().min(1, "First name is required"),
  lastname: z.string().trim().min(1, "Last name is required"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .transform((val) => val.replace(/\s+/g, "")),
  role: z.string().trim().min(1, "Role is required"),
  location: z.string().trim().min(1, "Location is required"),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
});

const defaultFormData = {
  email: "",
  password: "",
  firstname: "",
  lastname: "",
  phone: "",
  role: "",
  location: "",
};

type FormData = z.infer<typeof formSchema>;

const CreateNewUserModal = ({
  isOpen,
  setIsOpen,
  rolesList,
  allUsersRefresh,
  allRolesError,
  allRolesErrorStates,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rolesList: { label: string; value: string }[];
  allUsersRefresh: KeyedMutator<any>;
  allRolesError: any;
  allRolesErrorStates: ApiErrorStatesType;
}) => {
  const { apiCall } = useApiCall();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState<boolean>(false);
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
    // Clear the error for this field when the user starts typing
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const handleSelectChange = (name: string, values: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
    // Clear the error for this field when the user selects a value
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const resetForm = () => {
    setLoading(false);
    setFormData(defaultFormData);
    setFormErrors([]);
    setApiError("");
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    try {
      const validatedData = formSchema.parse(formData);
      await apiCall({
        endpoint: "/v1/auth/add-user",
        method: "post",
        data: validatedData,
        successMessage: "User created successfully!",
      });
      await allUsersRefresh();
      resetForm();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          "User creation failed: Internal Server Error";
        setApiError(message);
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
      onClose={() => resetForm()}
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
            New User
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          <Input
            type="text"
            name="firstname"
            label="FIRST NAME"
            value={formData.firstname}
            onChange={handleInputChange}
            placeholder="First Name"
            required={true}
            errorMessage={getFieldError("firstname")}
          />
          <Input
            type="text"
            name="lastname"
            label="LAST NAME"
            value={formData.lastname}
            onChange={handleInputChange}
            placeholder="Last Name"
            required={true}
            errorMessage={getFieldError("lastname")}
          />
          <Input
            type="email"
            name="email"
            label="EMAIL"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            required={true}
            errorMessage={getFieldError("email")}
          />
          <GooglePlacesInput
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
          />
          <Input
            type="text"
            name="phone"
            label="PHONE NUMBER"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            required={true}
            errorMessage={getFieldError("phone")}
          />
          <SelectInput
            label="Role"
            options={rolesList || []}
            value={formData.role}
            onChange={(selectedValue) =>
              handleSelectChange("role", selectedValue)
            }
            required={true}
            placeholder="Select a role"
            errorMessage={
              allRolesErrorStates.isPermissionError
                ? "You don't have permission to create a new user"
                : allRolesError
                ? "Failed to fetch user roles."
                : getFieldError("role")
            }
          />
          <ApiErrorMessage apiError={apiError} />
          <ProceedButton
            type="submit"
            variant={isFormFilled ? "gradient" : "gray"}
            loading={loading}
            disabled={allRolesErrorStates.isPermissionError || !isFormFilled}
            onClick={handleSubmit}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateNewUserModal;
