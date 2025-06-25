import React, { useState } from "react";
import { z } from "zod";
import lightCheckeredBg from "../../assets/lightCheckeredBg.png";
import eyeclosed from "../../assets/eyeclosed.svg";
import eyeopen from "../../assets/eyeopen.svg";
import { Input } from "../InputComponent/Input";
import { useApiCall } from "../../utils/useApiCall";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import ApiErrorMessage from "../ApiErrorMessage";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().trim().min(1, "Old password is required"),
    newPassword: z
      .string()
      .trim()
      .min(8, { message: "New password must be at least 8 characters long" })
      .regex(/[a-z]/, {
        message: "New password must contain at least one lowercase letter",
      })
      .regex(/[A-Z]/, {
        message: "New password must contain at least one uppercase letter",
      })
      .regex(/[0-9]/, {
        message: "New password must contain at least one number",
      }),
    confirmPassword: z
      .string()
      .trim()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation password must match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const defaultFormData: ChangePasswordFormData = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ChangePassword: React.FC = () => {
  const { apiCall } = useApiCall();
  const [formData, setFormData] =
    useState<ChangePasswordFormData>(defaultFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );
  const [passwordVisibility, setPasswordVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    resetFormErrors(name);
  };

  const resetFormErrors = (name: string) => {
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const togglePasswordVisibility = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = changePasswordSchema.parse(formData);
      await apiCall({
        endpoint: `/v1/auth/change-password`,
        method: "post",
        data: {
          oldPassword: validatedData.oldPassword,
          password: validatedData.newPassword,
          confirmPassword: validatedData.confirmPassword,
        },
        successMessage: "Password changed successfully!",
      });
      setFormData(defaultFormData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message || "Failed to change password";
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = changePasswordSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  return (
    <form
      className="relative flex flex-col justify-end bg-white p-4 w-full lg:max-w-[700px] min-h-[414px] border-[0.6px] border-strokeGreyThree rounded-[20px]"
      onSubmit={handleSubmit}
      noValidate
    >
      <img
        src={lightCheckeredBg}
        alt="Light Checkered Background"
        className="absolute top-0 left-0 w-full"
      />
      <div className="z-10 flex flex-col gap-4 mt-[80px]">
        <p className="flex items-center justify-center bg-paleLightBlue w-max h-[24px] text-textDarkGrey text-xs px-2 py-1 rounded-full">
          Click any field below to make changes
        </p>
        <Input
          type={passwordVisibility.oldPassword ? "text" : "password"}
          name="oldPassword"
          label="Old Password"
          value={formData.oldPassword}
          onChange={handleInputChange}
          required={true}
          placeholder="OLD PASSWORD"
          errorMessage={getFieldError("oldPassword")}
          iconRight={
            <img
              src={passwordVisibility.oldPassword ? eyeopen : eyeclosed}
              className="w-[16px] cursor-pointer"
              onClick={() => togglePasswordVisibility("oldPassword")}
              alt="Toggle password visibility"
            />
          }
        />
        <Input
          type={passwordVisibility.newPassword ? "text" : "password"}
          name="newPassword"
          label="New Password"
          value={formData.newPassword}
          onChange={handleInputChange}
          required={true}
          placeholder="ENTER NEW PASSWORD"
          errorMessage={getFieldError("newPassword")}
          iconRight={
            <img
              src={passwordVisibility.newPassword ? eyeopen : eyeclosed}
              className="w-[16px] cursor-pointer"
              onClick={() => togglePasswordVisibility("newPassword")}
              alt="Toggle password visibility"
            />
          }
        />
        <Input
          type={passwordVisibility.confirmPassword ? "text" : "password"}
          name="confirmPassword"
          label="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required={true}
          placeholder="CONFIRM NEW PASSWORD"
          errorMessage={getFieldError("confirmPassword")}
          iconRight={
            <img
              src={passwordVisibility.confirmPassword ? eyeopen : eyeclosed}
              className="w-[16px] cursor-pointer"
              onClick={() => togglePasswordVisibility("confirmPassword")}
              alt="Toggle password visibility"
            />
          }
        />

        <ApiErrorMessage apiError={apiError} />

        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            variant={isFormFilled ? "gradient" : "gray"}
            loading={loading}
            // disabled={!isFormFilled}
            disabled={false}
          />
        </div>
      </div>
    </form>
  );
};

export default ChangePassword;
