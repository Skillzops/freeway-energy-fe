import { useState, useEffect } from "react";
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
  discount: z.number().min(0, "Discount must be at least 0%").max(100, "Discount cannot exceed 100%").optional(),
});

type FormData = z.infer<typeof formSchema>;

const defaultFormData: FormData = {
  paymentMode: "ONE_OFF",
  installmentDuration: 0,
  installmentStartingPrice: 6000, // Standard initial payment amount
  discount: 0,
};

const DEFAULT_INSTALLMENT_DURATION = 6;
const DEFAULT_INITIAL_PAYMENT = 6000;

// Calculate installment amount based on your specified logic
const calculateInstallmentAmount = (
  productPrice: number,
  discount: number,
  miscellaneousCosts: number,
  installmentDuration: number
): number => {
  // Step 1: Apply discount to product price
  const discountAmount = (discount / 100) * productPrice;
  const discountedPrice = productPrice - discountAmount;
  
  // Step 2: Add miscellaneous costs
  const totalAmount = discountedPrice + miscellaneousCosts;
  
  // Step 3: Calculate monthly installment
  const monthlyInstallment = totalAmount / installmentDuration;
  
  return Math.round(monthlyInstallment); // Round to nearest whole number
};

const INSTALLMENT_PLANS: Record<
  number,
  { installmentStartingPrice: number; monthlyPayment?: number }
> = {
  3: { installmentStartingPrice: 8000, monthlyPayment: 32300 },
  6: { installmentStartingPrice: 5000, monthlyPayment: 17500 },
  9: { installmentStartingPrice: 5000, monthlyPayment: 12500 },
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

  // Get product details for calculation
  const product = SaleStore.getProductById(currentProductId);
  
  // Parse product price properly - remove any currency symbols and commas
  const productPriceString = product?.productPrice || "0";
  const cleanPriceString = productPriceString.toString().replace(/[₦,]/g, '');
  const productPrice = parseFloat(cleanPriceString) || 0;
  
  const miscellaneousCosts = SaleStore.getMiscellaneousByProductId(currentProductId)?.costs || {};
  
  // Properly handle MobX State Tree Map (MSTMap2)
  const totalMiscellaneousCosts = (() => {
    if (miscellaneousCosts && typeof miscellaneousCosts === 'object' && 'data_' in miscellaneousCosts) {
      // Handle MSTMap2 - access the internal data_ Map and extract values from ObservableValue2
      const mstMap = miscellaneousCosts as any;
      return Array.from(mstMap.data_.values()).reduce((sum: number, cost: any) => {
        // Extract value from ObservableValue2 using .get() method
        let costValue = cost && typeof cost === 'object' && 'get' in cost ? cost.get() : cost;
        
        // If costValue is still a ScalarNode2, extract its value
        if (costValue && typeof costValue === 'object' && 'value' in costValue) {
          costValue = costValue.value;
        }
        
        return sum + (Number(costValue) || 0);
      }, 0);
    } else if (miscellaneousCosts instanceof Map) {
      // Handle standard Map
      return Array.from(miscellaneousCosts.values()).reduce((sum: number, cost: any) => sum + (Number(cost) || 0), 0);
    } else {
      // Handle plain object
      return Object.values(miscellaneousCosts || {}).reduce((sum: number, cost: any) => sum + (Number(cost) || 0), 0);
    }
  })();
  const effectiveMiscellaneousCosts =
    totalMiscellaneousCosts > 0 ? totalMiscellaneousCosts : 2000;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);

    if (!isNaN(numericValue)) {
      if (name === 'discount') {
        if (numericValue < 0 || numericValue > 100) {
          return;
        }
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
    if (name === "paymentMode") {
      const nextMode = values as "INSTALLMENT" | "ONE_OFF";
      if (nextMode === "ONE_OFF") {
        setFormData((prev) => ({
          ...prev,
          paymentMode: "ONE_OFF",
          installmentDuration: 0,
          installmentStartingPrice: 0,
          discount: 0,
        }));
      } else {
        const duration = resolveInstallmentDuration();
        const plan = INSTALLMENT_PLANS[duration];
        const initialPayment =
          plan?.installmentStartingPrice ?? resolveInitialPayment();
        setFormData((prev) => ({
          ...prev,
          paymentMode: "INSTALLMENT",
          installmentDuration: duration,
          installmentStartingPrice: initialPayment,
          discount: 0,
        }));
      }
      setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
      return;
    }
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

  const paymentOptions = [
    { label: "Single Deposit", value: "ONE_OFF" },
    { label: "Installment", value: "INSTALLMENT" },
  ];

  const resolveInstallmentDuration = () => {
    const fromProduct =
      typeof product?.installmentDuration === "number"
        ? product.installmentDuration
        : undefined;
    if (fromProduct && fromProduct > 0) return fromProduct;

    const label = `${product?.productName ?? ""} ${product?.productTag ?? ""}`;
    const match = label.match(/(\d+)\s*(month|months|mo)/i);
    if (match) return Number(match[1]);
    return DEFAULT_INSTALLMENT_DURATION;
  };

  const resolveInitialPayment = () => {
    const fromProduct =
      typeof product?.installmentStartingPrice === "number"
        ? product.installmentStartingPrice
        : undefined;
    if (fromProduct && fromProduct > 0) return fromProduct;
    return DEFAULT_INITIAL_PAYMENT;
  };

  useEffect(() => {
    const existingParams = SaleStore.getParametersByProductId(currentProductId);
    if (existingParams) {
      setFormData(existingParams);
    }
  }, [currentProductId]);

  const derivedMonthlyPayment =
    INSTALLMENT_PLANS[formData.installmentDuration || 0]?.monthlyPayment ??
    (formData.installmentDuration && formData.installmentDuration > 0
      ? Math.round(
          (productPrice - (formData.installmentStartingPrice || 0)) /
            formData.installmentDuration
        )
      : 0);

  // Show calculation breakdown for installment mode
  const showCalculationBreakdown = formData.paymentMode === "INSTALLMENT" && 
    formData.installmentDuration && formData.installmentDuration > 0;

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
          disabled={true}
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
            disabled={true}
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
            label="INITIAL PAYMENT AMOUNT"
            value={formData.installmentStartingPrice as number}
            onChange={handleInputChange}
            placeholder="Initial Payment Amount"
            required={true}
            disabled={true}
            errorMessage={getFieldError("installmentStartingPrice")}
            description="Standard initial payment amount."
          />
        ) : null}
        {formData.paymentMode === "INSTALLMENT" ? (
          <Input
            type="text"
            name="monthlyPayment"
            label="MONTHLY PAYMENT"
            value={Number(derivedMonthlyPayment || 0).toLocaleString()}
            onChange={handleInputChange}
            placeholder="Monthly Payment"
            required={true}
            disabled={true}
            errorMessage={getFieldError("monthlyPayment")}
            description="Monthly installment amount."
          />
        ) : null}
        
        {/* Calculation Breakdown */}
        {showCalculationBreakdown && (
          <div className="p-3 bg-gray-50 rounded-md text-xs">
            <p className="font-semibold mb-2">Calculation Breakdown:</p>
            <div className="space-y-1">
              <p>Product Price: ₦{productPrice.toLocaleString()}</p>
              {(formData.discount || 0) > 0 && (
                <p>Discount ({formData.discount}%): -₦{(((formData.discount || 0) / 100) * productPrice).toLocaleString()}</p>
              )}
              {(formData.discount || 0) > 0 && (
                <p>Discounted Price: ₦{(productPrice - (((formData.discount || 0) / 100) * productPrice)).toLocaleString()}</p>
              )}
              {/* <p>Miscellaneous Costs: +₦{effectiveMiscellaneousCosts.toLocaleString()}</p> */}
              <p className="font-semibold">Total Amount: ₦{(productPrice - (((formData.discount || 0) / 100) * productPrice)).toLocaleString()}</p>
              <p>Initial Payment: ₦{(formData.installmentStartingPrice || 0).toLocaleString()}</p>
              <p className="font-semibold text-blue-600">
                Total Initial Deposit: ₦{(formData.installmentStartingPrice || 0).toLocaleString()}
                <span className="block text-xs font-normal text-gray-500">(Initial Payment)</span>
              </p>
              <p className="font-semibold text-red-600">Remaining Balance: ₦{((productPrice - (((formData.discount || 0) / 100) * productPrice)) - (formData.installmentStartingPrice || 0)).toLocaleString()}</p>
              <p className="font-semibold">
                Monthly Installment: ₦{Number(derivedMonthlyPayment || 0).toLocaleString()} ×{" "}
                {formData.installmentDuration || 0} months
              </p>
            </div>
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
