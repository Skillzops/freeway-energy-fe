import React, { useCallback, useEffect, useState } from "react";
import { KeyedMutator } from "swr";
import { Modal } from "../ModalComponent/Modal";
import { z, ZodIssue } from "zod";
import { useApiCall } from "@/utils/useApiCall";
import {
  Input,
  ModalInput,
  SelectInput,
  ToggleInput,
} from "../InputComponent/Input";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { SaleStore } from "@/stores/SaleStore";
import SelectCustomerProductModal from "./SelectCustomerProductModal";
import roletwo from "../../assets/table/roletwo.svg";
import { observer } from "mobx-react-lite";
import ProductSaleDisplay, { ExtraInfoSection } from "./ProductSaleDisplay";
import SetExtraInfoModal from "./SetExtraInfoModal";
import { RiDeleteBin5Fill } from "react-icons/ri";
import {
  formSchema,
  defaultSaleFormData,
  SalePayload,
  SaleItem,
} from "./salesSchema";
import { revalidateStore } from "@/utils/helpers";
import SalesSummary from "./SalesSummary";
import ApiErrorMessage from "../ApiErrorMessage";
import { FlutterwaveConfig } from "flutterwave-react-v3/dist/types";
import { toJS } from "mobx";

const public_key =
  import.meta.env.VITE_FLW_PUBLIC_KEY ||
  "FLWPUBK_TEST-720d3bd8434091e9b28a01452ebdd2e0-X";
const base_url = import.meta.env.VITE_API_BASE_URL;

type CreateSalesType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allSalesRefresh: KeyedMutator<any>;
};

type FormData = z.infer<typeof formSchema>;

export type ExtraInfoType =
  | "parameters"
  | "miscellaneous"
  | "devices"
  | "recipient"
  | "identification"
  | "nextOfKin"
  | "guarantor"
  | "";

const CreateNewSale = observer(
  ({ isOpen, setIsOpen, allSalesRefresh }: CreateSalesType) => {
    const { apiCall } = useApiCall();
    const [formData, setFormData] = useState<FormData>(defaultSaleFormData);
    const [loading, setLoading] = useState(false);
    const [isCustomerProductModalOpen, setIsCustomerProductModalOpen] =
      useState<boolean>(false);
    const [modalType, setModalType] = useState<"customer" | "product">(
      "customer"
    );
    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
    const [apiError, setApiError] = useState<string | Record<string, string[]>>(
      ""
    );
    const [extraInfoModal, setExtraInfoModal] = useState<ExtraInfoType>("");
    const [currentProductId, setCurrentProductId] = useState<string>("");
    const [summaryState, setSummaryState] = useState<boolean>(false);

    const selectedCustomer = SaleStore.customer;
    const selectedProducts = SaleStore.products;

    const resetFormErrors = (name: string) => {
      setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
      setApiError("");
    };

    const handleSelectChange = (name: string, values: string | string[]) => {
      setFormData((prev) => ({
        ...prev,
        [name]: values,
      }));
      resetFormErrors(name);
    };

    const getPayload = useCallback(() => {
      const payload: SalePayload = {
        category: SaleStore.category,
        customerId: SaleStore.customer?.customerId as string,
        saleItems: SaleStore.getTransformedSaleItems() as SaleItem[],
        applyMargin: formData.applyMargin,
      };
      if (SaleStore.doesSaleItemHaveInstallment()) {
        payload.bvn = formData.bvn;
        payload.identificationDetails = SaleStore.identificationDetails;
        payload.nextOfKinDetails = SaleStore.nextOfKinDetails;
        payload.guarantorDetails = SaleStore.guarantorDetails;
      }
      return payload;
    }, [formData]);

    const handleInputChange = (name: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      resetFormErrors(name);
    };

    const payload = getPayload();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      try {
        // Step 1: Validate data
        const validatedData = formSchema.parse(payload);

        // Step 2: API call
        const response = await apiCall({
          endpoint: "/v1/sales/create",
          method: "post",
          data: validatedData,
          successMessage: "Sale created successfully!",
        });

        // Step 3: Refresh sales list
        await allSalesRefresh();

        // Step 4: Handle save payment information
        const paymentData = response?.data?.paymentData;
        const newPaymentData: FlutterwaveConfig = {
          ...paymentData,
          public_key,
          redirect_url: `${base_url}/sales`,
          customer: {
            ...paymentData?.customer,
            phone_number: SaleStore?.customer?.phone || "",
            name: SaleStore.customer?.customerName || "",
          },
        };
        if (paymentData?.amount) {
          SaleStore.addPaymentDetails(newPaymentData);
        }
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          setFormErrors(error.issues);
        } else {
          const message =
            error?.response?.data?.message ||
            "Sale Creation Failed: Internal Server Error";
          setApiError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    const resetSaleModalState = () => {
      setIsOpen(false);
      SaleStore.purgeStore();
      setSummaryState(false);
    };

    useEffect(() => {
      if (loading && apiError) setApiError("");
    }, [payload, apiError, loading]);

    const getIsFormFilled = () => {
      const isPayloadValid = formSchema.safeParse(payload).success;
      const doesParamsExist =
        SaleStore.parameters.length > 0 &&
        SaleStore.parameters.every((param) => param.currentProductId !== "");
      return isPayloadValid && doesParamsExist;
    };

    const getFieldError = (fieldName: string) => {
      return formErrors.find((error) => error.path[0] === fieldName)?.message;
    };

    const getSaleItemFieldErrorByIndex = (
      fieldName: string,
      productId: string
    ) => {
      return formErrors
        .filter((error: ZodIssue) => {
          // Ensure the error is related to the saleItems array
          if (error.path[0] === "saleItems") {
            // Check if the error is for the specific productId
            const saleItemIndex = error.path[1] as number;
            const saleItem = SaleStore.saleItems[saleItemIndex];
            return saleItem && saleItem.productId === productId;
          }
          return false;
        })
        .filter((error) => {
          // Filter errors for the specific fieldName
          const errorField = error.path[2]; // The field name in the saleItemSchema
          return errorField === fieldName;
        })
        .map((error) => error.message);
    };

    revalidateStore(SaleStore);
    console.log("Sale Items:", toJS(SaleStore.getTransformedSaleItems()));

    return (
      <>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          layout="right"
          bodyStyle="pb-[100px]"
          size="large"
        >
          <form
            className="flex flex-col items-center bg-white"
            onSubmit={handleSubmit}
            noValidate
          >
            <div
              className={`flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree ${
                getIsFormFilled()
                  ? "bg-paleCreamGradientLeft"
                  : "bg-paleGrayGradientLeft"
              }`}
            >
              <h2
                style={{ textShadow: "1px 1px grey" }}
                className="text-xl text-textBlack font-semibold font-secondary"
              >
                {!summaryState
                  ? "New Sale"
                  : !SaleStore.paymentDetails.tx_ref
                  ? "Sale Summary"
                  : "Proceed to Payment"}
              </h2>
            </div>
            <div className="flex flex-col items-center justify-center w-full px-[2.5em] gap-4 py-8">
              {!summaryState ? (
                <>
                  <SelectInput
                    label="Sale Category"
                    options={[{ label: "Product", value: "PRODUCT" }]}
                    value={formData.category}
                    onChange={(selectedValue) => {
                      handleSelectChange("category", selectedValue);
                      SaleStore.addUpdateCategory(selectedValue as "PRODUCT");
                    }}
                    required={true}
                    placeholder="Select Sale Category"
                    errorMessage={getFieldError("category")}
                  />
                  <ModalInput
                    type="button"
                    name="customerId"
                    label="CUSTOMER"
                    onClick={() => {
                      setIsCustomerProductModalOpen(true);
                      setModalType("customer");
                    }}
                    placeholder="Select Customer"
                    required={true}
                    isItemsSelected={Boolean(selectedCustomer?.customerId)}
                    itemsSelected={
                      <div className="w-full">
                        {selectedCustomer?.customerId && (
                          <div className="relative flex items-center gap-1 w-max">
                            <img src={roletwo} alt="Icon" width="30px" />
                            <span className="bg-[#EFF2FF] px-3 py-1.5 rounded-full text-xs font-bold text-textDarkGrey capitalize">
                              {selectedCustomer?.customerName}
                            </span>
                            <span
                              className="flex items-center justify-center w-7 h-7 bg-white cursor-pointer border-[0.6px] border-strokeGreyTwo rounded-full transition-all hover:opacity-50"
                              title="Remove Customer"
                              onClick={SaleStore.removeCustomer}
                            >
                              <RiDeleteBin5Fill color="#FC4C5D" />
                            </span>
                          </div>
                        )}
                      </div>
                    }
                    errorMessage={
                      !SaleStore.doesCustomerExist
                        ? "Failed to fetch customers"
                        : getFieldError("customerId")
                    }
                  />
                  <ModalInput
                    type="button"
                    name="products"
                    label="PRODUCTS"
                    onClick={() => {
                      setIsCustomerProductModalOpen(true);
                      setModalType("product");
                    }}
                    placeholder="Select Product"
                    required={true}
                    isItemsSelected={selectedProducts.length > 0}
                    itemsSelected={
                      <div className="flex flex-wrap items-center w-full gap-6">
                        {selectedProducts?.map((data, index) => {
                          return (
                            <ProductSaleDisplay
                              key={index}
                              productData={data}
                              onRemoveProduct={(productId) =>
                                SaleStore.removeProduct(productId)
                              }
                              setExtraInfoModal={(value) => {
                                setCurrentProductId(data.productId);
                                setExtraInfoModal(value);
                              }}
                              getIsFormFilled={getIsFormFilled}
                              getFieldError={getSaleItemFieldErrorByIndex}
                            />
                          );
                        })}
                      </div>
                    }
                    errorMessage={
                      !SaleStore.doesProductCategoryExist
                        ? "Failed to fetch products"
                        : getFieldError("products")
                    }
                  />
                  {SaleStore.doesSaleItemHaveInstallment() && (
                    <>
                      <Input
                        type="text"
                        name="bvn"
                        label="BANK VERIFICATION NUUMBER"
                        value={formData.bvn as string}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(
                            /\D/g,
                            ""
                          ); // Remove non-numeric characters
                          if (numericValue.length <= 11) {
                            handleInputChange(e.target.name, numericValue);
                          }
                        }}
                        placeholder="Enter 11 digit BVN"
                        required={false}
                        errorMessage={getFieldError("bvn")}
                        maxLength={11}
                      />
                      <ModalInput
                        type="button"
                        name="identificationDetails"
                        label="IDENTIFICATION DETAILS"
                        onClick={() => {
                          setExtraInfoModal("identification");
                        }}
                        placeholder="Enter Identification"
                        required={false}
                        isItemsSelected={Boolean(
                          SaleStore.identificationDetails.idNumber
                        )}
                        customSelectedText="Update Identification Details"
                        itemsSelected={
                          <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-md">
                            {SaleStore.identificationDetails.idNumber && (
                              <ExtraInfoSection
                                label="Identification"
                                onClear={() =>
                                  SaleStore.removeIdentificationDetails()
                                }
                              />
                            )}
                          </div>
                        }
                        errorMessage={getFieldError("identificationDetails")}
                      />
                      <ModalInput
                        type="button"
                        name="nextOfKinDetails"
                        label="NEXT OF KIN DETAILS"
                        onClick={() => {
                          setExtraInfoModal("nextOfKin");
                        }}
                        placeholder="Enter Next of Kin"
                        required={false}
                        isItemsSelected={Boolean(
                          SaleStore.nextOfKinDetails.fullName
                        )}
                        customSelectedText="Update Next of Kin"
                        itemsSelected={
                          <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-md">
                            {SaleStore.nextOfKinDetails.fullName && (
                              <ExtraInfoSection
                                label="Next of Kin"
                                onClear={() =>
                                  SaleStore.removeNextOfKinDetails()
                                }
                              />
                            )}
                          </div>
                        }
                        errorMessage={getFieldError("nextOfKinDetails")}
                      />
                      <ModalInput
                        type="button"
                        name="guarantorDetails"
                        label="GUARANTOR DETAILS"
                        onClick={() => {
                          setExtraInfoModal("guarantor");
                        }}
                        placeholder="Enter Guarantor"
                        required={false}
                        isItemsSelected={Boolean(
                          SaleStore.guarantorDetails.fullName
                        )}
                        customSelectedText="Update Guarantor"
                        itemsSelected={
                          <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-md">
                            {SaleStore.guarantorDetails.fullName && (
                              <ExtraInfoSection
                                label="Guarantor"
                                onClear={() =>
                                  SaleStore.removeGuarantorDetails()
                                }
                              />
                            )}
                          </div>
                        }
                        errorMessage={getFieldError("guarantorDetails")}
                      />
                    </>
                  )}

                  <div className="flex items-center justify-between gap-2 w-full">
                    <p className="text-sm text-textBlack font-semibold">
                      Apply Margin
                    </p>
                    <ToggleInput
                      defaultChecked={formData.applyMargin}
                      onChange={(checked: boolean) => {
                        handleInputChange("applyMargin", checked);
                      }}
                    />
                  </div>

                  <ProceedButton
                    type="button"
                    loading={false}
                    variant={getIsFormFilled() ? "gradient" : "gray"}
                    disabled={!getIsFormFilled()}
                    onClick={() => setSummaryState(true)}
                  />
                </>
              ) : (
                <SalesSummary
                  setSummaryState={setSummaryState}
                  resetSaleModalState={resetSaleModalState}
                  loading={loading}
                  getIsFormFilled={getIsFormFilled}
                  apiErrorMessage={<ApiErrorMessage apiError={apiError} />}
                />
              )}
            </div>
          </form>
        </Modal>
        <SelectCustomerProductModal
          isModalOpen={isCustomerProductModalOpen}
          setModalOpen={setIsCustomerProductModalOpen}
          modalType={modalType}
        />
        {extraInfoModal === "" ? null : (
          <SetExtraInfoModal
            extraInfoModal={extraInfoModal}
            setExtraInfoModal={setExtraInfoModal}
            currentProductId={currentProductId}
          />
        )}
      </>
    );
  }
);

export default CreateNewSale;
