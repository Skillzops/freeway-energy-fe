import { useEffect, useMemo, useState } from "react";
import { DeviceEntries } from "./DevicesTable";
import { KeyedMutator } from "swr";
import { z } from "zod";
import { useApiCall } from "@/utils/useApiCall";
import { DetailComponent } from "../Settings/ViewRolePermissions";
import { SmallInput } from "../InputComponent/Input";
import ApiErrorMessage from "../ApiErrorMessage";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import inventoryIcon from "../../assets/inventory/inventoryIcon.svg";

const DeviceFormSchema = z.object({
  serialNumber: z.string().trim(),
  key: z.string().trim(),
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
  timeDivider: z.string().trim(),
  restrictedDigitMode: z.boolean(),
  hardwareModel: z.string().trim(),
  firmwareVersion: z.string().trim(),
});

type DeviceFormData = z.infer<typeof DeviceFormSchema>;

const DeviceDetails = ({
  deviceData,
  displayInput,
  setDisplayInput,
  refreshTable,
  refreshListView,
}: {
  deviceData: DeviceEntries;
  displayInput: boolean;
  setDisplayInput: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTable: KeyedMutator<any>;
  refreshListView: KeyedMutator<any>;
}) => {
  const { apiCall } = useApiCall();

  const defaultFormData = useMemo(() => {
    return {
      serialNumber: deviceData?.serialNumber,
      key: deviceData?.key,
      startingCode: deviceData?.startingCode,
      count: String(deviceData?.count),
      timeDivider: deviceData?.timeDivider,
      restrictedDigitMode: deviceData?.restrictedDigitMode,
      hardwareModel: deviceData?.hardwareModel,
      firmwareVersion: deviceData?.firmwareVersion,
    };
  }, [deviceData]);

  useEffect(() => {
    if (!displayInput) setFormData(defaultFormData);
  }, [defaultFormData, displayInput]);

  const [formData, setFormData] = useState<DeviceFormData>(defaultFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Update state immediately
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate the field immediately
    const parsed = DeviceFormSchema.safeParse({
      ...formData,
      [name]: value,
    });

    if (!parsed.success) {
      // Extract errors for the specific field
      const newErrors = parsed.error.issues.filter(
        (issue) => issue.path[0] === name
      );
      setFormErrors((prev) => [
        ...prev.filter((err) => err.path[0] !== name),
        ...newErrors,
      ]);
    } else {
      // Remove errors for the field if valid
      setFormErrors((prev) => prev.filter((err) => err.path[0] !== name));
    }

    setApiError(""); // Clear API errors on change
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    try {
      // Validate the form data before proceeding
      const validatedData = DeviceFormSchema.parse(formData);
      if (Object.keys(validatedData).length === 0) {
        setLoading(false);
        return;
      }
      const newValidatedData = Object.fromEntries(
        Object.entries(validatedData).filter(
          ([, value]) => value !== "" && value !== undefined
        )
      );

      await apiCall({
        endpoint: `/v1/device/${deviceData?.id}`,
        method: "patch",
        data: newValidatedData,
        successMessage: "Device updated successfully!",
      });
      await refreshListView();
      await refreshTable();
      setDisplayInput(false);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          "Device Update Failed: Internal Server Error";
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled =
    Object.keys(defaultFormData).some(
      (key) =>
        formData[key as keyof DeviceFormData] !==
        defaultFormData[key as keyof DeviceFormData]
    ) && DeviceFormSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center w-full gap-4"
    >
      <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={inventoryIcon} alt="Device Icon" /> DEVICE DETAILS
        </p>

        <DetailComponent
          label="Serial Number"
          value={defaultFormData.serialNumber}
          parentClass="border-none p-0"
          inputComponent={
            !displayInput ? null : (
              <SmallInput
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="Serial Number"
                required={false}
                errorMessage={getFieldError("serialNumber")}
              />
            )
          }
        />

        <DetailComponent
          label="Key"
          value={defaultFormData.key}
          parentClass="border-none p-0"
          inputComponent={
            !displayInput ? null : (
              <SmallInput
                type="text"
                name="key"
                value={formData.key}
                onChange={handleInputChange}
                placeholder="Key"
                required={false}
                errorMessage={getFieldError("key")}
              />
            )
          }
        />

        <DetailComponent
          label="Starting Code"
          value={defaultFormData.startingCode}
          parentClass="border-none p-0"
          inputComponent={
            !displayInput ? null : (
              <SmallInput
                type="text"
                name="startingCode"
                value={formData.startingCode}
                onChange={handleInputChange}
                placeholder="Starting Code"
                required={false}
                errorMessage={getFieldError("startingCode")}
              />
            )
          }
        />

        <DetailComponent
          label="Count"
          value={defaultFormData.count}
          parentClass="border-none p-0"
          inputComponent={
            !displayInput ? null : (
              <SmallInput
                type="text"
                name="count"
                value={formData.count || ""}
                onChange={handleInputChange}
                placeholder="Count"
                required={false}
                errorMessage={getFieldError("count")}
              />
            )
          }
        />

        <DetailComponent
          label="Time Divider"
          value={defaultFormData.timeDivider}
          parentClass="border-none p-0"
          inputComponent={
            !displayInput ? null : (
              <SmallInput
                type="text"
                name="timeDivider"
                value={formData.timeDivider}
                onChange={handleInputChange}
                placeholder="Time Divider"
                required={false}
                errorMessage={getFieldError("timeDivider")}
              />
            )
          }
        />

        <DetailComponent
          label="Restricted Digit Mode"
          value={defaultFormData.restrictedDigitMode ? "Yes" : "No"}
          parentClass="border-none p-0"
          inputComponent={
            !displayInput ? null : (
              <SmallInput
                type="checkbox"
                name="restrictedDigitMode"
                checked={formData.restrictedDigitMode}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    restrictedDigitMode: e.target.checked,
                  }));
                }}
                placeholder="Restricted Digit Mode"
                required={false}
                errorMessage={getFieldError("restrictedDigitMode")}
              />
            )
          }
        />

        <DetailComponent
          label="Hardware Model"
          value={defaultFormData.hardwareModel}
          parentClass="border-none p-0"
          inputComponent={
            !displayInput ? null : (
              <SmallInput
                type="text"
                name="hardwareModel"
                value={formData.hardwareModel}
                onChange={handleInputChange}
                placeholder="Hardware Model"
                required={false}
                errorMessage={getFieldError("hardwareModel")}
              />
            )
          }
        />

        <DetailComponent
          label="Firmware Version"
          value={defaultFormData.firmwareVersion}
          parentClass="border-none p-0"
          inputComponent={
            !displayInput ? null : (
              <SmallInput
                type="text"
                name="firmwareVersion"
                value={formData.firmwareVersion}
                onChange={handleInputChange}
                placeholder="Firmware Version"
                required={false}
                errorMessage={getFieldError("firmwareVersion")}
              />
            )
          }
        />
      </div>
      <ApiErrorMessage apiError={apiError} />

      {displayInput && (
        <ProceedButton
          type="submit"
          variant={isFormFilled ? "gradient" : "gray"}
          loading={loading}
          disabled={!isFormFilled}
        />
      )}
    </form>
  );
};

export default DeviceDetails;
