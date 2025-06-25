import { useState } from "react";
import { Input, SelectInput } from "../InputComponent/Input";
import { z } from "zod";
import { SaleStore } from "@/stores/SaleStore";
import SecondaryButton from "../SecondaryButton/SecondaryButton";

const formSchema = z.object({
  paymentMode: z.enum(["INSTALLMENT", "ONE_OFF"], {
    required_error: "Payment mode is required",
  }),
  installmentDuration: z.number().optional(),
  installmentStartingPrice: z.number().optional(),
  discount: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

const defaultFormData: FormData = {
  paymentMode: "ONE_OFF",
  installmentDuration: 0,
  installmentStartingPrice: 0,
  discount: 0,
};

const ParametersForm = ({
  handleClose,
  currentProductId,
}: {
  handleClose: () => void;
  currentProductId: string;
}) => {
  const [formData, setFormData] = useState<FormData>(
    SaleStore.getParametersByProductId(currentProductId) || defaultFormData
  );
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for installmentStartingPrice
    if (name === "installmentStartingPrice") {
      const numericValue = parseFloat(value);

      // If the value is greater than 100, set it to zero
      if (numericValue > 100) {
        setFormData((prev) => ({
          ...prev,
          [name]: 0, // Transform back to zero
        }));
        setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
        return;
      }

      // Otherwise, update the value as usual
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
      return;
    }

    // Handle other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };

  const handleSelectChange = (name: string, values: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };

  const isFormFilled =
    formData.paymentMode === "ONE_OFF"
      ? Boolean(formData.paymentMode)
      : Boolean(
          formData.paymentMode &&
            formData.installmentDuration &&
            formData.installmentStartingPrice
        );
  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const validateItems = () => {
    const result = formSchema.safeParse({
      ...formData,
      installmentDuration:
        Number.parseFloat(formData.installmentDuration?.toString() || "") || 0,
      installmentStartingPrice:
        Number.parseFloat(
          formData.installmentStartingPrice?.toString() || ""
        ) || 0,
      discount: Number.parseFloat(formData.discount?.toString() || "") || 0,
    });
    if (!result.success) {
      setFormErrors(result.error.issues);
      return false;
    }
    setFormErrors([]);
    return true;
  };

  const saveForm = () => {
    if (!validateItems()) return;
    SaleStore.addParameters(currentProductId, {
      ...formData,
      installmentDuration: Number(formData.installmentDuration),
      installmentStartingPrice: Number(formData.installmentStartingPrice),
      discount: Number(formData.discount),
    });
    SaleStore.addSaleItem(currentProductId);
    handleClose();
  };

  const rawPaymentModes =
    SaleStore.getProductById(currentProductId)?.productPaymentModes;
  const paymentModesArray = rawPaymentModes
    ?.split(",")
    .map((mode) => mode.trim().toLowerCase());

  const hasInstallment = paymentModesArray?.includes("installment");
  const hasMultipleModes = paymentModesArray && paymentModesArray.length > 1;

  const paymentOptions =
    hasInstallment && hasMultipleModes
      ? [
          { label: "Single Deposit", value: "ONE_OFF" },
          { label: "Installment", value: "INSTALLMENT" },
        ]
      : [{ label: "Single Deposit", value: "ONE_OFF" }];

  return (
    <div className="flex flex-col justify-between w-full h-full min-h-[360px]">
      <div className="flex flex-col gap-3">
        <SelectInput
          label="Payment Mode"
          options={paymentOptions}
          value={formData.paymentMode}
          onChange={(selectedValue) =>
            handleSelectChange("paymentMode", selectedValue)
          }
          placeholder="Select Payment Mode"
          required={true}
          errorMessage={getFieldError("paymentMode")}
        />
        {formData.paymentMode === "INSTALLMENT" ? (
          <Input
            type="number"
            name="installmentDuration"
            label="NUMBER OF INSTALLMENTS"
            value={formData.installmentDuration as number}
            onChange={handleInputChange}
            placeholder="Number of Installments"
            required={true}
            errorMessage={getFieldError("installmentDuration")}
            description={
              formData.installmentDuration === 0
                ? "Enter Number of Installments"
                : ""
            }
          />
        ) : null}
        {formData.paymentMode === "INSTALLMENT" ? (
          <Input
            type="number"
            name="installmentStartingPrice"
            label="INITIAL PAYMENT AMOUNT (PERCENTAGE)"
            value={formData.installmentStartingPrice as number}
            onChange={handleInputChange}
            placeholder="Initial Payment Amount"
            required={true}
            errorMessage={getFieldError("installmentStartingPrice")}
            description={
              formData.installmentStartingPrice === 0
                ? "Enter Initial Payment Amount (Percentage)"
                : ""
            }
            max={100}
          />
        ) : null}
        <Input
          type="number"
          name="discount"
          label="DISCOUNT"
          value={formData.discount as number}
          onChange={handleInputChange}
          placeholder="Discount"
          required={false}
          errorMessage={getFieldError("discount")}
          description={formData.discount === 0 ? "Enter Discount Value" : ""}
        />
      </div>
      <div className="flex items-center justify-between gap-1">
        <SecondaryButton
          variant="secondary"
          children="Cancel"
          onClick={handleClose}
        />
        <SecondaryButton
          disabled={!isFormFilled}
          children="Save"
          onClick={saveForm}
        />
      </div>
    </div>
  );
};

export default ParametersForm;
