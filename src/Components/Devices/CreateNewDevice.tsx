import { useApiCall } from "@/utils/useApiCall";
import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { z } from "zod";
import { Modal } from "../ModalComponent/Modal";
import { FileInput, Input, ToggleInput } from "../InputComponent/Input";
import ApiErrorMessage from "../ApiErrorMessage";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { RxFilePlus } from "react-icons/rx";

interface CreatNewDeviceProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allDevicesRefresh: KeyedMutator<any>;
  formType: "singleUpload" | "batchUpload";
}

const DeviceFormSchema = z.object({
  serialNumber: z.string().trim().min(1, "Serial number is required"),
  key: z.string().trim().min(1, "Key is required"),
  startingCode: z.string(),
  count: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "Device Count must be a valid integer",
    })
    // .refine((val) => !val || val.length >= 2, {
    //   message: "Device Count must be at least 2 characters long",
    // })
    .transform((val) => (val ? Number(val).toString() : val)),
  timeDivider: z.string(),
  restrictedDigitMode: z.boolean(),
  hardwareModel: z.string(),
  firmwareVersion: z.string(),
  isTokenable: z.boolean(),
});

type DeviceFormData = z.infer<typeof DeviceFormSchema>;

const FileFormSchema = z.object({
  devicesFile: z
    .instanceof(File, { message: "Devices file is required" })
    .refine(
      (file) =>
        file === null ||
        ["csv", "xlsx"].includes(
          file.name.split(".").pop()?.toLowerCase() || ""
        ),
      {
        message: "Only document files (.csv, .xlsx) are allowed.",
      }
    )
    .nullable()
    .default(null),
});

// Create a combined type that includes all fields from both forms
interface CombinedFormData extends DeviceFormData {
  devicesFile: File | null;
}

const defaultFormData = {
  serialNumber: "",
  key: "",
  startingCode: "",
  count: "",
  timeDivider: "",
  restrictedDigitMode: false,
  hardwareModel: "",
  firmwareVersion: "",
  isTokenable: true,
  devicesFile: null,
};

const CreateNewDevice: React.FC<CreatNewDeviceProps> = ({
  isOpen,
  setIsOpen,
  allDevicesRefresh,
  formType,
}) => {
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CombinedFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    // Try validating the new data
    const result = DeviceFormSchema.safeParse(updatedFormData);

    if (!result.success) {
      // Capture only the errors for this specific field
      const fieldErrors = result.error.issues.filter(
        (issue) => issue.path[0] === name
      );
      setFormErrors((prev) => [
        ...prev.filter((error) => error.path[0] !== name),
        ...fieldErrors,
      ]);
    } else {
      // Remove the error for this field if it's valid now
      setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    }

    setFormData(updatedFormData);
    setApiError(""); // Clear API errors on change
  };

  const handleFileChange = (e: {
    target: { name: any; value: any; files: any };
  }) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const fileData = { [name]: files[0] };

      // Validate just the file field
      const result = FileFormSchema.safeParse(fileData);

      if (!result.success) {
        const fieldErrors = result.error.issues.filter(
          (issue) => issue.path[0] === name
        );
        setFormErrors((prev) => [
          ...prev.filter((error) => error.path[0] !== name),
          ...fieldErrors,
        ]);
      } else {
        setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
        setFormData((prev) => ({
          ...prev,
          [name]: files[0],
        }));
      }
    }

    setApiError(""); // Clear API errors on change
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formType === "singleUpload") {
        const validatedData = DeviceFormSchema.parse(formData);
        const newValidatedData = Object.fromEntries(
          Object.entries(validatedData).filter(
            ([, value]) => value !== "" && value !== undefined
          )
        );
        await apiCall({
          endpoint: "/v1/device",
          method: "post",
          data: newValidatedData,
          successMessage: "Device created successfully!",
        });
      } else {
        // For batch upload, we only need to validate the file field
        if (!formData.devicesFile) {
          throw new Error("Device file is required");
        }

        const formDataToSend = new FormData();
        formDataToSend.append("file", formData.devicesFile);

        await apiCall({
          endpoint: "/v1/device/batch-upload",
          method: "post",
          data: formDataToSend,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          successMessage: "Devices uploaded successfully!",
        });
      }

      await allDevicesRefresh();
      setIsOpen(false);
      setFormData(defaultFormData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          `Device${
            formType === "batchUpload" && "s"
          } Creation Failed: Internal Server Error`;
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled =
    formType === "singleUpload"
      ? DeviceFormSchema.safeParse(
          // Omit the devicesFile field for device schema validation
          Object.fromEntries(
            Object.entries(formData).filter(([key]) => key !== "devicesFile")
          )
        ).success
      : !!formData.devicesFile;

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
            style={{ textShadow: "1px 1px grey" }}
            className="text-xl text-textBlack font-semibold font-secondary"
          >
            {formType === "singleUpload"
              ? "New Device"
              : "New Devices (Batch Upload)"}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          {formType === "singleUpload" ? (
            <>
              <Input
                type="text"
                name="serialNumber"
                label="Serial Number"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="Enter Serial Number"
                required={true}
                errorMessage={getFieldError("serialNumber")}
              />

              <Input
                type="text"
                name="key"
                label="Key"
                value={formData.key}
                onChange={handleInputChange}
                placeholder="Enter Key"
                required={true}
                errorMessage={getFieldError("key")}
              />

              <Input
                type="text"
                name="startingCode"
                label="Starting Code"
                value={formData.startingCode}
                onChange={handleInputChange}
                placeholder="Enter Starting Code"
                required={false}
                errorMessage={getFieldError("startingCode")}
              />

              <Input
                type="number"
                name="count"
                label="Count"
                value={formData.count || ""}
                onChange={handleInputChange}
                placeholder="Enter Count"
                required={false}
                errorMessage={getFieldError("count")}
              />

              <Input
                type="text"
                name="timeDivider"
                label="Time Divider"
                value={formData.timeDivider}
                onChange={handleInputChange}
                placeholder="Enter Time Divider"
                required={false}
                errorMessage={getFieldError("timeDivider")}
              />

              <Input
                type="text"
                name="hardwareModel"
                label="Hardware Model"
                value={formData.hardwareModel}
                onChange={handleInputChange}
                placeholder="Enter Hardware Model"
                required={false}
                errorMessage={getFieldError("hardwareModel")}
              />

              <Input
                type="text"
                name="firmwareVersion"
                label="Firmware Version"
                value={formData.firmwareVersion}
                onChange={handleInputChange}
                placeholder="Enter Firmware Version"
                required={false}
                errorMessage={getFieldError("firmwareVersion")}
              />

              <div className="flex items-center justify-between gap-2 w-full">
                <label className="text-sm text-textBlack font-semibold">
                  Restricted Digit Mode
                </label>
                <ToggleInput
                  defaultChecked={formData.restrictedDigitMode}
                  onChange={(checked: boolean) => {
                    setFormData((prev) => ({
                      ...prev,
                      restrictedDigitMode: checked,
                    }));
                  }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 w-full">
                <label className="text-sm text-textBlack font-semibold">
                  Is Device Tokenable
                </label>
                <ToggleInput
                  defaultChecked={formData.isTokenable}
                  onChange={(checked: boolean) => {
                    setFormData((prev) => ({
                      ...prev,
                      isTokenable: checked,
                    }));
                  }}
                />
              </div>
            </>
          ) : (
            <FileInput
              name="devicesFile"
              label="Devices File"
              onChange={handleFileChange}
              required={true}
              accept=".csv,.xlsx"
              placeholder="Upload Device File"
              errorMessage={getFieldError("devicesFile")}
              iconRight={<RxFilePlus color="black" title="Upload File" />}
              description="Only .csv and .xlsx files are allowed"
            />
          )}

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

export default CreateNewDevice;
