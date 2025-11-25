import { useState, useEffect } from "react";
import { z } from "zod";
import { SaleStore } from "@/stores/SaleStore";
import { SelectInput, Input } from "@/Components/InputComponent/Input";
import SecondaryButton from "@/Components/SecondaryButton/SecondaryButton";

const formSchema = z.object({
  paymentMode: z.enum(["INSTALLMENT", "ONE_OFF"], {
    required_error: "Payment mode is required",
  }),
  installmentDuration: z.number().optional(),
  installmentStartingPrice: z.number().optional(),
  discount: z
    .number()
    .min(0, "Discount must be at least 0%")
    .max(100, "Discount cannot exceed 100%")
    .optional(),
  monthlyPayment: z.number({
    required_error: "Monthly payment is required",
  }),
});

type FormData = z.infer<typeof formSchema>;

const defaultFormData: FormData = {
  paymentMode: "ONE_OFF",
  installmentDuration: 0,
  installmentStartingPrice: 6000,
  discount: 0,
  monthlyPayment: 0,
};

const calculateInstallmentAmount = (
  productPrice: number,
  discount: number,
  miscellaneousCosts: number,
  installmentDuration: number
): number => {
  const discountAmount = (discount / 100) * productPrice;
  const discountedPrice = productPrice - discountAmount;
  const totalAmount = discountedPrice + miscellaneousCosts;
  const monthlyInstallment = totalAmount / installmentDuration;
  return Math.round(monthlyInstallment);
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

  const product = SaleStore.getProductById(currentProductId);
  const productPriceString = product?.productPrice || "0";
  const cleanPriceString = productPriceString.toString().replace(/[₦,]/g, "");
  const productPrice = parseFloat(cleanPriceString) || 0;

  const miscellaneousCosts =
    SaleStore.getMiscellaneousByProductId(currentProductId)?.costs || {};

  const totalMiscellaneousCosts = (() => {
    if (
      miscellaneousCosts &&
      typeof miscellaneousCosts === "object" &&
      "data_" in miscellaneousCosts
    ) {
      const mstMap = miscellaneousCosts as any;
      return Array.from(mstMap.data_.values()).reduce(
        (sum: number, cost: any) => {
          let costValue =
            cost && typeof cost === "object" && "get" in cost
              ? cost.get()
              : cost;
          if (
            costValue &&
            typeof costValue === "object" &&
            "value" in costValue
          ) {
            costValue = costValue.value;
          }
          return sum + (Number(costValue) || 0);
        },
        0
      );
    } else if (miscellaneousCosts instanceof Map) {
      return Array.from(miscellaneousCosts.values()).reduce(
        (sum: number, cost: any) => sum + (Number(cost) || 0),
        0
      );
    } else {
      return Object.values(miscellaneousCosts || {}).reduce(
        (sum: number, cost: any) => sum + (Number(cost) || 0),
        0
      );
    }
  })();

  useEffect(() => {
    if (formData.paymentMode === "INSTALLMENT") {
      const currentInitialPayment =
        SaleStore.getParametersByProductId(
          currentProductId
        )?.installmentStartingPrice;
      if (!currentInitialPayment || currentInitialPayment === 0) {
        setFormData((prev) => ({
          ...prev,
          installmentStartingPrice: 6000,
        }));
      }
    }
  }, [formData.paymentMode, currentProductId]);

  useEffect(() => {
    if (
      formData.paymentMode === "INSTALLMENT" &&
      formData.installmentDuration &&
      formData.installmentDuration > 0
    ) {
      const monthly = calculateInstallmentAmount(
        productPrice,
        formData.discount || 0,
        totalMiscellaneousCosts,
        formData.installmentDuration
      );
      setFormData((prev) => ({ ...prev, monthlyPayment: monthly }));
    }
  }, [
    formData.installmentDuration,
    formData.discount,
    productPrice,
    totalMiscellaneousCosts,
    formData.paymentMode,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);

    if (!isNaN(numericValue)) {
      if (name === "discount" && (numericValue < 0 || numericValue > 100)) {
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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
            formData.installmentStartingPrice &&
            formData.monthlyPayment
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
      monthlyPayment:
        Number.parseFloat(formData.monthlyPayment?.toString() || "") || 0,
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
    console.log(formData, "formData__");
    SaleStore.addParameters(currentProductId, {
      ...formData,
      installmentDuration: Number(formData.installmentDuration),
      installmentStartingPrice: Number(formData.installmentStartingPrice),
      discount: Number(formData.discount),
      monthlyPayment: Number(formData.monthlyPayment ?? 0),
    });
    SaleStore.addSaleItem(currentProductId);
    handleClose();
  };

  const rawPaymentModes =
    SaleStore.getProductById(currentProductId)?.productPaymentModes;

  const paymentModesArray = rawPaymentModes
    ?.split(",")
    .map((mode) => mode.trim().toLowerCase());

  console.log(paymentModesArray, "dhhdh__d", rawPaymentModes);

  const hasInstallment = paymentModesArray?.includes("installment");
  // const hasMultipleModes = paymentModesArray && paymentModesArray.length > 1;

  const paymentOptions = hasInstallment
    ? [
        { label: "Single Deposit", value: "ONE_OFF" },
        { label: "Installment", value: "INSTALLMENT" },
      ]
    : [{ label: "Single Deposit", value: "ONE_OFF" }];

  const showCalculationBreakdown =
    formData.paymentMode === "INSTALLMENT" &&
    formData.installmentDuration &&
    formData.installmentDuration > 0;

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
        <Input
          type="number"
          name="discount"
          label="DISCOUNT (%)"
          value={formData.discount as number}
          onChange={handleInputChange}
          placeholder="Enter Discount Percentage"
          required={false}
          max={100}
          errorMessage={getFieldError("discount")}
        />

        {formData.paymentMode === "INSTALLMENT" && (
          <>
            <Input
              type="number"
              name="installmentDuration"
              label="NUMBER OF INSTALLMENTS"
              value={formData.installmentDuration as number}
              onChange={handleInputChange}
              placeholder="Number of Installments"
              required={true}
              errorMessage={getFieldError("installmentDuration")}
            />
            <Input
              type="number"
              name="installmentStartingPrice"
              label="INITIAL PAYMENT AMOUNT"
              value={formData.installmentStartingPrice as number}
              onChange={handleInputChange}
              placeholder="Initial Payment Amount"
              required={true}
              errorMessage={getFieldError("installmentStartingPrice")}
              description="Standard initial payment is ₦6,000. You can modify this amount."
            />
            <Input
              type="number"
              name="monthlyPayment"
              label="MONTHLY PAYMENT"
              value={formData.monthlyPayment as number}
              onChange={handleInputChange}
              placeholder="Enter Monthly Payment"
              required={true}
              errorMessage={getFieldError("monthlyPayment")}
              description="Enter the monthly installment amount."
            />
          </>
        )}

        {showCalculationBreakdown && (
          <div className="p-3 bg-gray-50 rounded-md text-xs">
            <p className="font-semibold mb-2">Calculation Breakdown:</p>
            <p>Product Price: ₦{productPrice.toLocaleString()}</p>
            <p>
              Monthly Installment: ₦{formData.monthlyPayment.toLocaleString()} ×{" "}
              {formData.installmentDuration || 0} months
            </p>
          </div>
        )}
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
