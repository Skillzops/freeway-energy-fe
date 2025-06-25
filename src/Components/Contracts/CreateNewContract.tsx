import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { Modal } from "../ModalComponent/Modal";
import {
  FileInput,
  ModalInput,
  SelectInput,
  SelectMultipleInput,
} from "../InputComponent/Input";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { z } from "zod";
import rootStore from "../../stores/rootStore";
import { CardComponent } from "../CardComponents/CardComponent";
import SelectInventoryModal from "../Products/SelectInventoryModal";
import { Category } from "../Products/CreateNewProduct";

type ContractsType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allContractsRefresh: KeyedMutator<any>;
};

const allowedExtensions = ["pdf", "docx", "doc", "txt"];

const contractSchema = z.object({
  categoryId: z
    .string()
    .trim()
    .min(1, "Product Category is required")
    .default(""),
  product: z.string().trim().min(1, "Product is required").default(""),
  customer: z.string().trim().min(1, "Customer is required").default(""),
  contractDoc: z
    .instanceof(File)
    .refine(
      (file) =>
        file === null ||
        allowedExtensions.includes(
          file.name.split(".").pop()?.toLowerCase() || ""
        ),
      {
        message: "Only document files (.pdf, .docx, .doc, .txt) are allowed.",
      }
    )
    .nullable()
    .default(null),
});

const paymentModesSchema = z
  .array(z.string())
  .min(1, "Please select at least 1 payment mode")
  .transform((arr) => arr.join(", "));

const mainSchema = contractSchema.extend({
  paymentModes: paymentModesSchema,
  inventoryBatchId: z
    .array(z.string())
    .nonempty("Select at least 1 inventory item"),
});

const defaultFormData = {
  categoryId: "",
  product: "",
  paymentModes: [],
  customer: "",
  inventoryBatchId: [],
  contractDoc: null,
};

type formData = z.infer<typeof contractSchema>;

const CreateNewContract = ({
  isOpen,
  setIsOpen,
  allContractsRefresh,
}: ContractsType) => {
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<formData>(defaultFormData);
  const [paymentModes, setPaymentModes] = useState<any>([]);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchAllProductCategories = useGetRequest(
    "/v1/products/categories/all",
    true,
    60000
  );

  const handleInputChange = (e: {
    target: { name: any; value: any; files: any };
  }) => {
    const { name, value, files } = e.target;
    if (name === "contractDoc" && files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    resetFormErrors(name);
  };

  const handleSelectChange = (name: string, values: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
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
      const formSubmissionData = new FormData(e.currentTarget);

      // Convert form data to an object
      const formFields = Object.fromEntries(formSubmissionData.entries());
      const inventoryBatchIds = rootStore.contractStore.products.map(
        (product) => product.productId
      );

      // Parse the data using the main schema
      const validatedData = mainSchema.parse({
        ...formFields,
        categoryId: formData.categoryId,
        product: formData.product,
        paymentModes: paymentModes,
        customer: formData.customer,
        inventoryBatchId: inventoryBatchIds,
      });

      const submissionData = new FormData();

      // Iterate and append validated data to FormData
      Object.entries(validatedData).forEach(([key, value]) => {
        if (value instanceof File) {
          submissionData.append(key, value);
        } else if (value !== null && value !== undefined) {
          submissionData.append(key, String(value));
        }
      });

      // Make the API call
      await apiCall({
        endpoint: "/v1/contracts",
        method: "post",
        data: submissionData,
        headers: { "Content-Type": "multipart/form-data" },
        successMessage: "Contract created successfully!",
      });
      await allContractsRefresh!();
      setIsOpen(false);
      setFormData(defaultFormData);
      setPaymentModes([]);
      rootStore.contractStore.emptyProducts();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message || "Internal Server Error";
        setApiError(`Contract creation failed: ${message}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedProducts = rootStore.contractStore.products;
  const { categoryId, product, customer, contractDoc } = formData;

  const isFormFilled =
    contractDoc &&
    selectedProducts.length > 0 &&
    paymentModesSchema.safeParse(paymentModes) &&
    contractSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  return (
    <>
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
              New Contract
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
            <SelectInput
              label="Product Category"
              options={fetchAllProductCategories?.data?.map(
                (category: Category) => ({
                  label: category.name,
                  value: category.id,
                })
              )}
              value={categoryId}
              onChange={(selectedValue) =>
                handleSelectChange("categoryId", selectedValue)
              }
              required={true}
              placeholder="Select Product Category"
              errorMessage={getFieldError("categoryId")}
            />
            <SelectInput
              label="Product"
              options={[
                { label: "Product One", value: "productOne" },
                { label: "Product Two", value: "productTwo" },
              ]}
              value={product}
              onChange={(selectedValue) =>
                handleSelectChange("product", selectedValue)
              }
              required={true}
              placeholder="Select Product"
              errorMessage={getFieldError("product")}
            />
            <SelectMultipleInput
              label="Payment Modes"
              options={[
                { label: "Single Deposit", value: "ONE_OFF" },
                { label: "Installment", value: "INSTALLMENT" },
              ]}
              value={paymentModes}
              onChange={(values) => setPaymentModes(values)}
              placeholder="Select Payment Modes"
              required={true}
              errorMessage={getFieldError("paymentModes")}
            />
            <SelectInput
              label="Customer"
              options={[
                { label: "John Bull", value: "134wf224342" },
                { label: "Jane Doe", value: "124dw232232" },
              ]}
              value={customer}
              onChange={(selectedValue) =>
                handleSelectChange("customer", selectedValue)
              }
              required={true}
              placeholder="Select Customer"
              errorMessage={getFieldError("customer")}
            />
            <ModalInput
              type="button"
              name="inventoryBatchId"
              label="INVENTORY"
              onClick={() => setIsInventoryOpen(true)}
              placeholder="Select Inventory"
              required={true}
              isItemsSelected={selectedProducts.length > 0}
              itemsSelected={
                <div className="flex flex-wrap items-center w-full gap-4">
                  {selectedProducts?.map((data, index) => {
                    return (
                      <CardComponent
                        key={`${data.productId}-${index}`}
                        variant={"inventoryTwo"}
                        productId={data.productId}
                        productImage={data.productImage}
                        productTag={data.productTag}
                        productName={data.productName}
                        productPrice={data.productPrice}
                        productUnits={data.productUnits}
                        readOnly={true}
                        onRemoveProduct={(productId) =>
                          rootStore.contractStore.removeProduct(productId)
                        }
                      />
                    );
                  })}
                </div>
              }
              errorMessage={
                !rootStore.contractStore.doesProductCategoriesExist
                  ? "Failed to fetch inventory categories"
                  : getFieldError("inventoryBatchId")
              }
            />
            <div className="flex flex-col gap-1 w-full">
              <FileInput
                name="contractDoc"
                label="CONTRACT DOCUMENT"
                onChange={handleInputChange}
                required={true}
                accept=".pdf,.docx,.doc,.txt"
                placeholder="Upload Contract"
                errorMessage={getFieldError("contractDoc")}
              />
              <p className="w-max text-[10px] text-textDarkBrown font-medium px-2 py-0.5 bg-[#FEF5DA] border border-[#A58730] rounded-full">
                Please note that you can only upload an already signed contract
              </p>
            </div>
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
      <SelectInventoryModal
        isInventoryOpen={isInventoryOpen}
        setIsInventoryOpen={setIsInventoryOpen}
      />
    </>
  );
};

export default CreateNewContract;
