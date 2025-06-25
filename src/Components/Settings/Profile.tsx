import { useState } from "react";
import lightCheckeredBg from "../../assets/lightCheckeredBg.png";
import role from "../../assets/table/role.svg";
import { BiSolidPlusCircle } from "react-icons/bi";
import editInput from "../../assets/settings/editInput.svg";
import { MdCancel } from "react-icons/md";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { useApiCall } from "../../utils/useApiCall";
import useTokens from "../../hooks/useTokens";
import Cookies from "js-cookie";
import { SmallInput } from "../InputComponent/Input";
import { z } from "zod";
import ApiErrorMessage from "../ApiErrorMessage";

// Define the validation schema using Zod
const profileSchema = z
  .object({
    firstname: z.string().trim(),
    lastname: z.string().trim(),
    email: z.string().trim().email("Invalid email format"),
    phone: z
      .string()
      .trim()
      .transform((val) => val.replace(/\s+/g, ""))
      .optional(),
    location: z.string().trim().optional(),
  })
  .partial();

type FormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const userData = useTokens();
  const { apiCall } = useApiCall();
  const defaultData = {
    firstname: userData.firstname || "",
    lastname: userData.lastname || "",
    email: userData.email || "",
    phone: userData.phone || "",
    location: userData.location || "",
  };
  const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(defaultData);
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const fieldLabels: { [key: string]: string } = {
    firstname: "First Name",
    lastname: "Last Name",
    email: "Email",
    phone: "Phone Number",
    location: "Location",
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check for unsaved changes by comparing the new value with the original value in `userData`
    if (userData[name as keyof FormData] !== value) {
      setUnsavedChanges(true);
    } else {
      setUnsavedChanges(false);
    }
    // Clear the error for this field when the user starts typing
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    if (unsavedChanges) {
      try {
        const validatedData = profileSchema.parse(formData);
        const newValidatedData = Object.fromEntries(
          Object.entries(validatedData).filter(
            ([, value]) => value !== "" && value !== undefined
          )
        );

        await apiCall({
          endpoint: "/v1/users",
          method: "patch",
          data: newValidatedData,
          successMessage: "User updated successfully!",
        });

        // Update the cookies with the new user data
        const updatedUserData = {
          ...userData,
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
        };

        Cookies.set("userData", JSON.stringify(updatedUserData));
        setUnsavedChanges(false);
        setDisplayInput(false);
      } catch (error: any) {
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
    setLoading(false);
  };

  const handleCancelClick = () => {
    setDisplayInput(false);
    setUnsavedChanges(false);
    setFormData(defaultData);
  };

  const isFormFilled =
    unsavedChanges && profileSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

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

  return (
    <form
      className="relative flex flex-col justify-end bg-white p-2 md:p-4 w-full max-w-[700px] min-h-[414px] rounded-[20px]"
      onSubmit={handleSubmit}
      noValidate
    >
      <img
        src={lightCheckeredBg}
        alt="Light Checkered Background"
        className="absolute top-0 left-0 w-full"
      />
      <div className="z-10 flex justify-end">
        {!displayInput ? (
          <div className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full cursor-pointer hover:bg-slate-100">
            <img
              src={editInput}
              alt="Edit Button"
              width="15px"
              onClick={() => setDisplayInput(true)}
            />
          </div>
        ) : (
          <div
            onClick={handleCancelClick}
            className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-errorTwo rounded-full cursor-pointer hover:opacity-80"
          >
            <MdCancel className="text-errorTwo" />
          </div>
        )}
      </div>
      <div className="z-10 flex flex-col gap-4 mt-[60px] md:mt-[80px]">
        <DetailComponent
          label="User ID"
          value={userData.id}
          parentClass="h-[44px] p-2.5 border-[0.6px] border-strokeGreyThree"
        />
        <div className="flex flex-col gap-2 p-2.5 w-full border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <p className="flex gap-1 w-max text-xs text-textLightGrey font-medium pb-2">
            <img src={role} alt="Role Icon" width="16px" />
            YOUR DETAILS
          </p>

          {Object.entries(formData).map(([fieldName, fieldValue]) => (
            <div
              key={fieldName}
              className="flex items-start justify-between bg-white w-full text-textDarkGrey text-xs rounded-full"
            >
              <span className="flex items-center justify-center bg-[#F6F8FA] text-textBlack text-xs p-2 h-[24px] rounded-full">
                {fieldLabels[fieldName]}
              </span>
              {!displayInput ? (
                fieldValue || (
                  <BiSolidPlusCircle
                    className="cursor-pointer w-5 h-5 text-textLightGrey"
                    onClick={() => setDisplayInput(true)}
                  />
                )
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
        <DetailComponent
          label="Designation"
          value={userData.role.role}
          parentClass="z-10 p-2.5 h-[44px] border-[0.6px] border-strokeGreyThree"
          valueClass="flex items-center justify-center bg-paleLightBlue text-textBlack font-semibold p-2 h-[24px] rounded-full capitalize"
        />

        <ApiErrorMessage apiError={apiError} />

        {displayInput ? (
          <div className="flex items-center justify-center w-full pt-2 pb-5">
            <ProceedButton
              type="submit"
              variant={isFormFilled ? "gradient" : "gray"}
              loading={loading}
              disabled={!isFormFilled}
            />
          </div>
        ) : null}
      </div>
    </form>
  );
};

export default Profile;
