import React, { useState } from "react";
import { useApiCall } from "@/utils/useApiCall";
import { z } from "zod";
import { KeyedMutator } from "swr";
import { Input } from "../InputComponent/Input";
import ApiErrorMessage from "../ApiErrorMessage";
import SecondaryButton from "../SecondaryButton/SecondaryButton";

const formSchema = z.object({
  costOfItem: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "Cost Price must be a valid integer",
    })
    .transform((val) => (val ? Number(val).toString() : val)),
  price: z
    .string()
    .trim()
    .min(1, "Selling Price is required")
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "Selling Price must be a valid integer",
    })
    .transform((val) => Number(val).toString()),
  numberOfStock: z
    .string()
    .trim()
    .min(1, "Number of Stock is required")
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "Number of Stock must be a valid integer",
    })
    .transform((val) => Number(val)),
  inventoryId: z.string().min(1, "Inventory Id is required"),
});

type FormData = z.infer<typeof formSchema>;

const CreateInventoryBatchForm = ({
  inventoryId,
  refreshTable,
  refreshListView,
  setSecModal,
  onClose,
}: {
  inventoryId: string;
  refreshTable: KeyedMutator<any>;
  refreshListView: KeyedMutator<any>;
  setSecModal: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}) => {
  const defaultFormData: FormData = {
    costOfItem: "",
    price: "",
    numberOfStock: 0,
    inventoryId,
  };

  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
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
    const result = formSchema.safeParse(updatedFormData);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = formSchema.parse({ ...formData, inventoryId });
      const newValidatedData = Object.fromEntries(
        Object.entries(validatedData).filter(
          ([, value]) => value !== "" && value !== undefined
        )
      );
      await apiCall({
        endpoint: "/v1/inventory/batch/create",
        method: "post",
        data: newValidatedData,
        successMessage: "Inventory Batch created successfully!",
      });

      await refreshTable();
      await refreshListView();
      setSecModal(false);
      setFormData(defaultFormData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          "Inventory Batch Creation Failed: Internal Server Error";
        setApiError(message);
      }
    } finally {
      // setLoading(false);
    }
  };

  const isFormFilled = formSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  return (
    <form
      className="flex flex-col justify-between w-full h-full min-h-[360px]"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="flex flex-col gap-3">
        <Input
          type="number"
          name="costOfItem"
          label="COST OF ITEM"
          value={formData.costOfItem || ""}
          onChange={handleInputChange}
          placeholder="Cost of Item"
          required={false}
          errorMessage={getFieldError("costOfItem")}
        />

        <Input
          type="number"
          name="price"
          label="SELLING PRICE"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Selling Price"
          required={true}
          errorMessage={getFieldError("price")}
        />

        <Input
          type="number"
          name="numberOfStock"
          label="NUMBER OF STOCK"
          value={formData.numberOfStock}
          onChange={handleInputChange}
          placeholder="Number of Stock"
          required={true}
          errorMessage={getFieldError("numberOfStock")}
          description="Number of Stock"
        />
      </div>

      <div className="flex flex-col w-full gap-4">
        <ApiErrorMessage apiError={apiError} />
        <div className="flex items-center justify-between gap-1">
          <SecondaryButton
            variant="secondary"
            children="Cancel"
            onClick={onClose}
          />
          <SecondaryButton
            type="submit"
            disabled={!isFormFilled}
            loading={loading}
            loadingText="Creating"
            children="Create"
          />
        </div>
      </div>
    </form>
  );
};

export default CreateInventoryBatchForm;
