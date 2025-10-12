import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { Modal } from "../ModalComponent/Modal";
import { useApiCall } from "@/utils/useApiCall";
import { z } from "zod";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { Input } from "../InputComponent/Input";

type ReverseTransactionsType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allTransactionsRefresh: KeyedMutator<any>;
};

const reversalSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
});

type ReversalFormData = z.infer<typeof reversalSchema>;

const defaultFormData = {
  transactionId: "",
};

const ReverseTransactions = ({
  isOpen,
  setIsOpen,
  allTransactionsRefresh,
}: ReverseTransactionsType) => {
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReversalFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

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
    // Clear the error for this field when the user starts typing
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = reversalSchema.parse(formData);
      await apiCall({
        endpoint: "/v1/transactions/reverse",
        method: "post",
        data: validatedData,
        successMessage: "Transaction reversed successfully!",
      });

      await allTransactionsRefresh();
      setIsOpen(false);
      setFormData(defaultFormData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message || "Internal Server Error";
        setApiError(`Transaction reversal failed: ${message}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = reversalSchema.safeParse(formData).success;

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
            Reverse Transaction
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          <Input
            type="text"
            name="transactionId"
            label="TRANSACTION ID"
            value={formData.transactionId}
            onChange={handleInputChange}
            placeholder="Transaction Id"
            required={true}
            errorMessage={getFieldError("transactionId")}
          />
          {apiError && (
            <div className="text-errorTwo text-sm mt-2 text-center font-medium w-full">
              {apiError}
            </div>
          )}
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

export default ReverseTransactions;
