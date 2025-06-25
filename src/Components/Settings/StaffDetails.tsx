import React, { useEffect, useMemo, useState } from "react";
import { GoDotFill } from "react-icons/go";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import user from "../../assets/settings/user.svg";
import { useApiCall } from "@/utils/useApiCall";
import { KeyedMutator } from "swr";
import { Tag } from "../Products/ProductDetails";
import { z } from "zod";
import { SmallInput, SmallSelectInput } from "../InputComponent/Input";
import ApiErrorMessage from "../ApiErrorMessage";

// Define the validation schema using Zod
const userSchema = z
  .object({
    firstname: z.string().trim(),
    lastname: z.string().trim(),
    email: z.string().trim().email("Invalid email format"),
    phone: z
      .string()
      .trim()
      .transform((val) => val.replace(/\s+/g, "")),
    location: z.string().trim(),
  })
  .partial();

type FormData = z.infer<typeof userSchema>;

const StaffDetails = ({
  data,
  rolesList,
  refreshUserData,
  refreshUserTable,
  displayInput,
  setDisplayInput,
}: {
  data: any;
  rolesList: { label: string; value: string }[];
  refreshUserData: KeyedMutator<any>;
  refreshUserTable: KeyedMutator<any>;
  displayInput: boolean;
  setDisplayInput: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { apiCall } = useApiCall();
  const defaultData = useMemo(() => {
    return {
      firstname: data.firstname || "",
      lastname: data.lastname || "",
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
    };
  }, [data]);
  const [formData, setFormData] = useState<FormData>(defaultData);
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [designation, setDesignation] = useState<string>(data.role.id);

  useEffect(() => {
    if (!loading) setFormData(defaultData);
  }, [loading, defaultData]);

  const fieldLabels: { [key: string]: string } = {
    firstname: "First Name",
    lastname: "Last Name",
    email: "Email",
    phone: "Phone Number",
    location: "Location",
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check for unsaved changes by comparing the form data with the initial userData
    if (data[name] !== value) {
      setUnsavedChanges(true);
    } else {
      setUnsavedChanges(false);
    }
    // Clear the error for this field when the user starts typing
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const resetForm = () => {
    setLoading(false);
    setFormErrors([]);
    setApiError("");
    setUnsavedChanges(false);
    setDisplayInput(false);
    setFormData(defaultData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    if (designationChanged) {
      setLoading(true);
      apiCall({
        endpoint: `/v1/roles/${data.id}/assign`,
        method: "post",
        data: {
          roleId: designation,
        },
        successMessage: "Designation updated successfully!",
      })
        .then(async () => {
          setDesignation(data.role.id);
          if (!unsavedChanges) {
            await refreshUserData();
            resetForm();
            await refreshUserTable();
          }
        })
        .catch((error: any) => {
          setLoading(false);
          if (error instanceof z.ZodError) {
            setFormErrors(error.issues);
          } else {
            const message =
              error?.response?.data?.message ||
              "Failed to update user designation: Internal Server Error";
            setApiError(message);
          }
        });
    }

    if (unsavedChanges) {
      try {
        const validatedData = userSchema.parse(formData);
        await apiCall({
          endpoint: `/v1/users/${data.id}`,
          method: "patch",
          data: validatedData,
          successMessage: "User updated successfully!",
        });
        await refreshUserData();
        resetForm();
        await refreshUserTable();
      } catch (error: any) {
        setLoading(false);
        if (error instanceof z.ZodError) {
          setFormErrors(error.issues);
        } else {
          const message =
            error?.response?.data?.message ||
            "Failed to update user: Internal Server Error";
          setApiError(message);
        }
      }
    }
  };

  const designationChanged = designation !== data.role.id;
  const isFormFilled =
    (unsavedChanges || designationChanged) &&
    userSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div className="p-2.5 border-[0.6px] border-[#8396E7] rounded-[20px]">
        <p className="flex items-center gap-1 pb-2 w-max text-xs text-textLightGrey font-medium">
          <img src={user} alt="User" width="16px" />
          STAFF ID
        </p>
        <DetailComponent label="User ID" value={data.id} parentClass="mb-2" />
        <div className="flex items-start justify-between bg-white w-full text-textDarkGrey text-xs rounded-full z-10 p-2.5 h-[44px] border-[0.6px] border-strokeGreyThree">
          <span className="flex items-center justify-center bg-[#F6F8FA] text-textBlack text-xs p-2 h-[24px] rounded-full">
            Designation
          </span>
          {!displayInput ? (
            <span className="flex items-center justify-center bg-paleLightBlue text-textBlack font-semibold p-2 h-[24px] rounded-full capitalize text-xs">
              {data.role.role}
            </span>
          ) : (
            <SmallSelectInput
              name="role"
              value={designation}
              options={rolesList || []}
              onChange={(e) => {
                setDesignation(e.target.value);
              }}
              required={false}
              placeholder="Select a role"
            />
          )}
        </div>
        {!rolesList && displayInput && (
          <p className="mt-2 pr-1.5 text-xs text-right text-errorTwo font-semibold w-full">
            Failed to fetch user roles.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 p-2.5 border-[0.6px] border-[#8396E7] rounded-[20px]">
        <p className="flex items-center gap-1 pb-2 w-max text-xs text-textLightGrey font-medium">
          <img src={user} alt="User" width="16px" />
          STAFF ID
        </p>
        {Object.entries(formData).map(([fieldName, fieldValue]) => (
          <div
            key={fieldName}
            className="flex items-start justify-between bg-white w-full text-textDarkGrey text-xs rounded-full"
          >
            <Tag name={fieldLabels[fieldName]} />
            {!displayInput ? (
              <span className="text-xs font-bold text-textDarkGrey">
                {fieldValue || "N/A"}
              </span>
            ) : (
              <SmallInput
                type="text"
                name={fieldName}
                value={fieldValue}
                onChange={handleInputChange}
                required={true}
                placeholder={`Enter your ${fieldLabels[fieldName]}`}
                errorMessage={getFieldError(fieldName)}
              />
            )}
          </div>
        ))}
      </div>

      <ApiErrorMessage apiError={apiError} />

      {displayInput ? (
        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            variant={isFormFilled ? "gradient" : "gray"}
            loading={loading}
            disabled={!isFormFilled}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between p-2 border-[0.6px] border-strokeGreyThree rounded-full">
            <p className="bg-[#EFF2FF] px-2 py-1 text-xs text-[#3951B6] rounded-full">
              Status
            </p>
            <p
              className={`flex items-center justify-center gap-1 bg-[#F6F8FA] w-max px-2 py-1 text-xs border-[0.4px] border-strokeGreyTwo rounded-full uppercase ${
                data.status.toLowerCase() === "active"
                  ? "text-success"
                  : "text-errorTwo"
              }`}
            >
              <GoDotFill />
              {data.status}
            </p>
          </div>
          <div className="flex items-center justify-between p-2 border-[0.6px] border-strokeGreyThree rounded-full">
            <p className="bg-[#F6F8FA] px-2 py-1 text-xs text-textBlack rounded-full">
              Last Login
            </p>
            <p className="text-textDarkGrey text-xs font-bold">
              {data.lastLogin || "N/A"}
            </p>
          </div>
        </>
      )}
    </form>
  );
};

export default StaffDetails;

const DetailComponent = ({
  label,
  value,
  parentClass,
  valueClass,
}: {
  label: string;
  value: string | number;
  parentClass?: string;
  valueClass?: string;
}) => {
  return (
    <div
      className={`${parentClass} flex items-center justify-between bg-white w-full text-textDarkGrey text-xs rounded-full`}
    >
      <span className="flex items-center justify-center bg-[#F6F8FA] text-textBlack text-xs p-2 h-[24px] rounded-full">
        {label}
      </span>

      <span className={`${valueClass} text-xs font-bold text-textDarkGrey`}>
        {value}
      </span>
    </div>
  );
};
