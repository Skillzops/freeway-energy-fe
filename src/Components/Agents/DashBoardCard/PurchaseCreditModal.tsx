import React, { useState } from "react";
// import { Modal } from "../ModalComponent/Modal";
// import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
// import { Input } from "../InputComponent/Input";
import { z } from "zod";
// import ApiErrorMessage from "../ApiErrorMessage";
import { useApiCall } from "@/utils/useApiCall";
import { Modal } from "@/Components/ModalComponent/Modal";
import { Input } from "@/Components/InputComponent/Input";
import ApiErrorMessage from "@/Components/ApiErrorMessage";
import ProceedButton from "@/Components/ProceedButtonComponent/ProceedButtonComponent";

// ✅ Props Interface
interface PurchaseCreditProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allPurchaseCreditRefresh?: () => Promise<any>; // ✅ Type changed from KeyedMutator to simple async function
}

// ✅ Zod schema
const purchaseCreditSchema = z.object({
  selectCustomer: z.string().min(1, "Select Customer is required"),
  deviceNumber: z.string().min(1, "Device Number is required"),
  inputAmount: z.string().min(1, "Input Amount is required"),
});

type PurchaseCreditFormData = z.infer<typeof purchaseCreditSchema>;

const defaultFormData: PurchaseCreditFormData = {
  selectCustomer: "",
  deviceNumber: "",
  inputAmount: "",
};

const PurchaseCredit = ({
  isOpen,
  setIsOpen,
  allPurchaseCreditRefresh,
}: PurchaseCreditProps) => {
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] =
    useState<PurchaseCreditFormData>(defaultFormData);
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
    resetFormErrors(name);
  };

  const resetFormErrors = (name: string) => {
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = purchaseCreditSchema.parse(formData);

      await apiCall({
        endpoint: "/v1/customers/create",
        method: "post",
        data: validatedData,
        successMessage: "Customer created successfully!",
      });

      if (allPurchaseCreditRefresh) {
        await allPurchaseCreditRefresh(); // ✅ conditionally run
      }

      setIsOpen(false);
      setFormData(defaultFormData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          "Customer Creation Failed: Internal Server Error";
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = purchaseCreditSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) =>
    formErrors.find((error) => error.path[0] === fieldName)?.message;

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
            className="text-xl text-textBlack font-semibold font-secondary"
            style={{ textShadow: "1px 1px grey" }}
          >
            Purchase Token
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          <Input
            type="text"
            name="selectCustomer"
            label="SELECT CUSTOMER"
            value={formData.selectCustomer}
            onChange={handleInputChange}
            placeholder="Select Customer"
            required
            errorMessage={getFieldError("selectCustomer")}
          />
          <Input
            type="text"
            name="deviceNumber"
            label="DEVICE NUMBER"
            value={formData.deviceNumber}
            onChange={handleInputChange}
            placeholder="Device Number"
            required
            errorMessage={getFieldError("deviceNumber")}
          />
          <Input
            type="text"
            name="inputAmount"
            label="INPUT AMOUNT"
            value={formData.inputAmount}
            onChange={handleInputChange}
            placeholder="Input Amount"
            required
            errorMessage={getFieldError("inputAmount")}
          />

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

export default PurchaseCredit;
