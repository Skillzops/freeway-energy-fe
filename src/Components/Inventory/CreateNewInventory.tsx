import React, { useState, useEffect, useCallback } from "react";
import { KeyedMutator } from "swr";
import {
  FileInput,
  Input,
  SelectInput,
  SelectOption,
} from "../InputComponent/Input";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { Modal } from "../ModalComponent/Modal";
import { useApiCall } from "@/utils/useApiCall";
import { Category } from "../Products/CreateNewProduct";
import { z } from "zod";
import ApiErrorMessage from "../ApiErrorMessage";

export type InventoryFormType =
  | "newInventory"
  | "newCategory"
  | "newSubCategory";

interface CreatNewInventoryProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allInventoryRefresh: KeyedMutator<any>;
  formType: InventoryFormType;
}

const formSchema = z.object({
  class: z
    .string()
    .trim()
    .min(1, "Inventory Class is required")
    .regex(/^(REGULAR|RETURNED|REFURBISHED)$/, "Invalid Inventory Class")
    .default(""),
  inventoryCategoryId: z
    .string()
    .trim()
    .min(1, "Inventory Category is required")
    .default(""),
  inventorySubCategoryId: z
    .string()
    .trim()
    .min(1, "Inventory Sub Category is required")
    .default(""),
  name: z
    .string()
    .trim()
    .min(1, "Inventory Name is required")
    .max(50, "Inventory Name cannot exceed 50 characters"),
  manufacturerName: z
    .string()
    .trim()
    .min(1, "Manufacturer Name is required")
    .max(50, "Manufacturer Name cannot exceed 50 characters"),
  dateOfManufacture: z
    .string()
    .trim()
    .optional()
    .refine(
      (date) => !date || !isNaN(Date.parse(date)),
      "Invalid Date of Manufacture"
    )
    .default(""),
  sku: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9-]*$/,
      "SKU can only contain letters, numbers, and dashes"
    )
    .max(50, "SKU cannot exceed 50 characters")
    .optional()
    .default(""),
  numberOfStock: z
    .string()
    .trim()
    .regex(/^\d+$/, "Number of stock must be a valid integer")
    .transform(Number)
    .refine((num) => num > 0, "Number of stock must be greater than 0")
    .transform((value) => value.toString()),
  costOfItem: z
    .string()
    .trim()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Cost Price must be a valid number with up to 2 decimal places"
    )
    .transform(Number)
    .refine((num) => num > 0, "Cost Price must be greater than 0")
    .transform((value) => value.toString()),
  price: z
    .string()
    .trim()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Sale Price must be a valid number with up to 2 decimal places"
    )
    .transform(Number)
    .refine((num) => num > 0, "Sale Price must be greater than 0")
    .transform((value) => value.toString()),
  inventoryImage: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(
          file.type
        ),
      {
        message: "Only PNG, JPEG, JPG, or SVG files are allowed.",
      }
    )
    .nullable()
    .default(null),
});

const defaultInventoryFormData = {
  class: "",
  inventoryCategoryId: "",
  inventorySubCategoryId: "",
  name: "",
  manufacturerName: "",
  dateOfManufacture: "",
  sku: "",
  numberOfStock: "",
  costOfItem: "",
  price: "",
  inventoryImage: null,
};

const createCategoryDataSchema = z.object({
  newCategory: z
    .string()
    .trim()
    .min(1, "Inventory Class is required")
    .max(50, "Sub Category Name cannot exceed 50 characters"),
  newSubCategory: z
    .string()
    .trim()
    .max(50, "Sub Category Name cannot exceed 50 characters")
    .optional()
    .default(""),
});

const createSubCategoryDataSchema = z.object({
  parentId: z.string().trim().min(1, "Inventory Category is required"),
  newSubCategory: z
    .string()
    .trim()
    .min(1, "Inventory Sub Category Name is required")
    .max(50, "Sub Category Name cannot exceed 50 characters"),
});

const defaultCategoryData = {
  newCategory: "",
  newSubCategory: "",
};

const defaultSubCategoryData = {
  newSubCategory: "",
  parentId: "",
};

type FormData = z.infer<typeof formSchema>;
type CategoryFormData = z.infer<typeof createCategoryDataSchema>;
type SubCategoryFormData = z.infer<typeof createSubCategoryDataSchema>;

const CreateNewInventory: React.FC<CreatNewInventoryProps> = ({
  isOpen,
  setIsOpen,
  allInventoryRefresh,
  formType,
}) => {
  const { apiCall } = useApiCall();
  const [formData, setFormData] = useState<FormData>(defaultInventoryFormData);
  const [categoryFormData, setCatgoryFormData] =
    useState<CategoryFormData>(defaultCategoryData);
  const [subCategoryFormData, setSubCatgoryFormData] =
    useState<SubCategoryFormData>(defaultSubCategoryData);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );
  const [inventoryCategories, setInventoryCategories] = useState<Category[]>(
    []
  );

  // Fetch inventory categories using apiCall
  const fetchInventoryCategories = useCallback(async () => {
    try {
      const response = await apiCall({
        endpoint: "/v1/inventory/categories/all",
        method: "get",
        showToast: false,
      });
      setInventoryCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch inventory categories:", error);
      setInventoryCategories([]);
    }
  }, []);

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInventoryCategories();
    }
  }, [isOpen, fetchInventoryCategories]);

  const isFormFilled =
    formType === "newInventory"
      ? Object.values(formData).some((value) => Boolean(value)) &&
        formSchema.safeParse(formData).success
      : formType === "newCategory"
      ? createCategoryDataSchema.safeParse(categoryFormData).success
      : createSubCategoryDataSchema.safeParse(subCategoryFormData).success;

  const resetFormErrors = (name: string) => {
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const handleInputChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === "inventoryImage" && files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        inventoryImage: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    resetFormErrors(name);
  };

  const handleSelectChange = (name: string, values: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
      ...(name === "inventoryCategoryId" && { inventorySubCategoryId: "" }),
    }));
    resetFormErrors(name);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formType === "newInventory") {
        const formSubmissionData = new FormData(e.currentTarget);
        const formFields = Object.fromEntries(formSubmissionData.entries());
        const validatedData = formSchema.parse({
          class: formData.class,
          inventoryCategoryId: formData.inventoryCategoryId,
          inventorySubCategoryId: formData.inventorySubCategoryId,
          ...formFields,
        });
        const submissionData = new FormData();

        Object.entries(validatedData).forEach(([key, value]) => {
          if (value instanceof File) {
            submissionData.append(key, value);
          } else if (value !== null && value !== undefined) {
            submissionData.append(key, String(value));
          }
        });

        await apiCall({
          endpoint: "/v1/inventory/create",
          method: "post",
          data: submissionData,
          headers: { "Content-Type": "multipart/form-data" },
          successMessage: "Inventory created successfully!",
        });

        await allInventoryRefresh();
        setFormData(defaultInventoryFormData);
        setIsOpen(false);
      } else {
        let validatedData;
        if (formType === "newCategory") {
          validatedData = createCategoryDataSchema.parse(categoryFormData);
        } else {
          validatedData =
            createSubCategoryDataSchema.parse(subCategoryFormData);
        }

        const createCategoryData = (data: CategoryFormData) => ({
          categories: [
            {
              name: data.newCategory,
              ...(data.newSubCategory && {
                subCategories: [
                  {
                    name: data.newSubCategory,
                  },
                ],
              }),
            },
          ],
        });

        const createSubCategoryData = (data: SubCategoryFormData) => ({
          categories: [
            {
              name: data.newSubCategory,
              parentId: data.parentId,
            },
          ],
        });

        await apiCall({
          endpoint: "/v1/inventory/category/create",
          method: "post",
          data:
            formType === "newCategory"
              ? createCategoryData(validatedData as CategoryFormData)
              : createSubCategoryData(validatedData as SubCategoryFormData),
          headers: { "Content-Type": "application/json" },
          successMessage: `Inventory ${
            formType === "newSubCategory" ? "Sub-" : ""
          } Category created successfully!`,
        });

        // Refresh both inventory and categories
        await Promise.all([allInventoryRefresh(), fetchInventoryCategories()]);

        setCatgoryFormData(defaultCategoryData);
        setSubCatgoryFormData(defaultSubCategoryData);
        setIsOpen(false);
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          `Inventory ${
            formType !== "newInventory" ? "Category" : ""
          } Creation Failed: Internal Server Error`;
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

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
            New{" "}
            {formType === "newInventory"
              ? "Inventory"
              : formType === "newCategory"
              ? "Category"
              : "Sub-Category"}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center w-full px-[2.5em] gap-4 py-8">
          {formType === "newInventory" ? (
            <>
              <SelectInput
                label="Class"
                options={[
                  { label: "Regular", value: "REGULAR" },
                  { label: "Returned", value: "RETURNED" },
                  { label: "Refurbished", value: "REFURBISHED" },
                ]}
                value={formData.class}
                onChange={(selectedValue) =>
                  handleSelectChange("class", selectedValue)
                }
                required={true}
                placeholder="Choose Inventory Class"
                errorMessage={getFieldError("class")}
              />

              <SelectInput
                label="Category"
                options={
                  inventoryCategories.length > 0
                    ? inventoryCategories.map((category: Category) => ({
                        label: category?.name,
                        value: category?.id,
                      }))
                    : [
                        {
                          label: "No Category Available",
                          value: "",
                        },
                      ]
                }
                value={formData.inventoryCategoryId}
                onChange={(selectedValue) =>
                  handleSelectChange("inventoryCategoryId", selectedValue)
                }
                required={true}
                placeholder="Choose Item Category"
                errorMessage={getFieldError("inventoryCategoryId")}
              />

              <div
                style={{
                  width: "100%",
                  display: formData.inventoryCategoryId ? "block" : "none",
                  transition: "0.3s ease-in-out",
                  visibility: formData.inventoryCategoryId
                    ? "visible"
                    : "hidden",
                  opacity: formData.inventoryCategoryId ? 1 : 0,
                  transitionProperty: "visibility, opacity",
                }}
              >
                <SelectInput
                  label="Sub-Category"
                  options={
                    ((
                      inventoryCategories
                        .find(
                          (category: Category) =>
                            category?.id === formData?.inventoryCategoryId
                        )
                        ?.children?.map((child: { name: any; id: any }) => ({
                          label: child?.name,
                          value: child?.id,
                        })) || []
                    )?.length > 0
                      ? inventoryCategories
                          .find(
                            (category: Category) =>
                              category?.id === formData?.inventoryCategoryId
                          )
                          ?.children?.map((child: { name: any; id: any }) => ({
                            label: child?.name,
                            value: child?.id,
                          }))
                      : [
                          {
                            label: "No Sub-Category Available",
                            value: "",
                          },
                        ]) as SelectOption[]
                  }
                  value={formData.inventorySubCategoryId}
                  onChange={(selectedValue) =>
                    handleSelectChange("inventorySubCategoryId", selectedValue)
                  }
                  required={!!formData.inventoryCategoryId}
                  placeholder="Choose Item Sub-Category"
                  errorMessage={getFieldError("inventorySubCategoryId")}
                />
              </div>

              <Input
                type="text"
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Item Name"
                required={true}
                errorMessage={getFieldError("name")}
              />

              <Input
                type="text"
                name="manufacturerName"
                label="Manufacturer"
                value={formData.manufacturerName}
                onChange={handleInputChange}
                placeholder="Manufacturer Name"
                required={true}
                errorMessage={getFieldError("manufacturerName")}
              />

              <Input
                type="date"
                name="dateOfManufacture"
                label="Purchase Date"
                value={formData.dateOfManufacture}
                onChange={handleInputChange}
                placeholder="Date of Purchase"
                required={false}
                errorMessage={getFieldError("dateOfManufacture")}
                description="Date Of Manufacture"
              />

              <Input
                type="text"
                name="sku"
                label="SKU"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="SKU"
                required={false}
                errorMessage={getFieldError("sku")}
              />

              <Input
                type="number"
                name="numberOfStock"
                label="Number of Stock"
                value={formData.numberOfStock}
                onChange={handleInputChange}
                placeholder="Number of Stock"
                required={true}
                errorMessage={getFieldError("numberOfStock")}
              />

              <Input
                type="number"
                name="costOfItem"
                label="Cost Price"
                value={formData.costOfItem}
                onChange={handleInputChange}
                placeholder="Cost of Item"
                required={true}
                errorMessage={getFieldError("costOfItem")}
              />

              <Input
                type="number"
                name="price"
                label="Sale Price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Price of Item"
                required={true}
                errorMessage={getFieldError("price")}
              />

              <FileInput
                name="inventoryImage"
                label="Item Picture"
                onChange={handleInputChange}
                required={true}
                accept=".jpg,.jpeg,.png,.svg"
                placeholder="Item Picture"
                errorMessage={getFieldError("inventoryImage")}
              />
            </>
          ) : (
            <>
              {formType === "newCategory" ? (
                <Input
                  type="text"
                  name="newCategory"
                  label="Category"
                  value={categoryFormData.newCategory}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCatgoryFormData((prev) => ({
                      ...prev,
                      [name]: value,
                    }));
                    resetFormErrors(name);
                  }}
                  placeholder="Enter a New Category"
                  required={true}
                  errorMessage={getFieldError("newCategory")}
                />
              ) : (
                <>
                  <SelectInput
                    label="Category"
                    options={
                      inventoryCategories.map((category: Category) => ({
                        label: category.name,
                        value: category.id,
                      })) || [{ label: "", value: "" }]
                    }
                    value={subCategoryFormData.parentId}
                    onChange={(selectedValue) => {
                      setSubCatgoryFormData((prev) => ({
                        ...prev,
                        parentId: selectedValue,
                      }));
                      resetFormErrors("parentId");
                    }}
                    required={true}
                    placeholder="Choose Item Category"
                    errorMessage={getFieldError("parentId")}
                  />
                </>
              )}

              <Input
                type="text"
                name="newSubCategory"
                label="Sub-Category"
                value={
                  formType === "newCategory"
                    ? categoryFormData.newSubCategory
                    : subCategoryFormData.newSubCategory
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (formType === "newCategory") {
                    setCatgoryFormData((prev) => ({
                      ...prev,
                      newSubCategory: value,
                    }));
                  } else {
                    setSubCatgoryFormData((prev) => ({
                      ...prev,
                      newSubCategory: value,
                    }));
                  }
                  resetFormErrors("newSubCategory");
                }}
                placeholder="Enter a New Sub-Category"
                required={formType === "newCategory" ? false : true}
                errorMessage={getFieldError("newSubCategory")}
              />
            </>
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

export default CreateNewInventory;
