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
import axios from "axios";

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
  // | "identification"
  // | "nextOfKin"
  | "guarantor"
  | "";

interface PaymentData {
  amount: number;
  tx_ref: string;
  saleId: string;
  customer: {
    email: string;
    name: string;
  };
}

interface ApiResponse {
  data: {
    paymentData: {
      amount: number;
      tx_ref: string;
      saleId: string;
      customer: {
        name: string;
        email: string;
      };
    };
  };
}

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
        paymentMethod: SaleStore.paymentMethod,
      };
      
      // If any sale item has installment payment mode, include additional required fields
      if (SaleStore.doesSaleItemHaveInstallment()) {
        // Include BVN from formData
        payload.bvn = formData.bvn;
        
        // Only include guarantor details if they have actual data
        if (SaleStore.guarantorDetails && SaleStore.guarantorDetails.fullName) {
          // Create a copy of guarantor details without empty identification details
          const guarantorDetails = { ...SaleStore.guarantorDetails };
          
          // Only include identification details if they have actual data
          if (!guarantorDetails.identificationDetails || 
              !guarantorDetails.identificationDetails.idType || 
              !guarantorDetails.identificationDetails.idNumber) {
            // Create a new object without identification details
            const { identificationDetails, ...guarantorWithoutId } = guarantorDetails;
            payload.guarantorDetails = guarantorWithoutId;
          } else {
            payload.guarantorDetails = guarantorDetails;
          }
        }
        
        // Don't include identification details or next of kin details
        // payload.identificationDetails = SaleStore.identificationDetails;
        // payload.nextOfKinDetails = SaleStore.nextOfKinDetails;
      }
      
      console.log("Generated payload:", JSON.stringify(payload, null, 2));
      return payload;
    }, [formData]);

    const handleInputChange = (name: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (name === "paymentMethod") {
        SaleStore.setPaymentMethod(value);
      }
      resetFormErrors(name);
    };

    const payload = getPayload();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      console.log(payload);

      try {
        // Step 1: Validate data
        const validatedData = formSchema.parse(payload);

        // Step 2: API call
        console.log("Sending payload to API:", getPayload());
        const response = await apiCall({
          endpoint: "/v1/sales/create",
          method: "post",
          data: getPayload(),
          successMessage: "Sale created successfully!",
        }) as ApiResponse;

        // Step 3: Refresh sales list
        await allSalesRefresh();

        console.log("Step 4: Processing payment information...");
        console.log("API Response:", response);
        console.log("Response data:", response?.data);
        
        // Step 4: Handle save payment information
        const paymentData = response?.data?.paymentData;
        console.log("Payment data extracted:", paymentData);
        
        console.log("Public key check:", { public_key, exists: !!public_key });
        
        if (!public_key) {
          console.error("Flutterwave public key not configured");
          setApiError("Payment system configuration error. Please contact support.");
          return;
        }
        
        console.log("Creating payment data object...");
        const newPaymentData = {
          publicKey: public_key,
          email: SaleStore?.customer?.email || paymentData?.customer?.email || "",
          amount: paymentData?.amount || 0,
          currency: "NGN",
          reference: paymentData?.tx_ref || `sale_${Date.now()}`,
          metadata: {
            saleId: paymentData?.saleId || "",
            customerName: SaleStore.customer?.customerName || "",
            phoneNumber: SaleStore?.customer?.phone || "",
            tx_ref: paymentData?.tx_ref || `sale_${Date.now()}`,
            payment_options: "card,banktransfer,ussd",
            customer: {
              email: SaleStore?.customer?.email || paymentData?.customer?.email || "",
              name: SaleStore.customer?.customerName || paymentData?.customer?.name || "",
              phone_number: SaleStore?.customer?.phone || "",
            },
            customizations: {
              title: "Sale Payment",
              description: "Payment for sale",
              logo: "https://yourdomain.com/logo.png",
            },
          },
          callback: null,
          onClose: null,
          channels: ["card", "bank", "ussd"],
        };
        
        console.log("Payment data created:", newPaymentData);
        console.log("Payment amount check:", { amount: paymentData?.amount, hasAmount: paymentData?.amount && paymentData?.amount > 0 });
        
        if (paymentData?.amount && paymentData?.amount > 0 && validatedData.paymentMethod === "ONLINE") {
          console.log("Adding payment details to store and setting summary state...");
          try {
            SaleStore.addPaymentDetails(newPaymentData);
            console.log("Payment details added to store successfully");
            setSummaryState(true);
            console.log("Summary state set to true successfully");
          } catch (storeError) {
            console.error("Error in store operations:", storeError);
            setApiError("Error processing payment information. Please try again.");
            return;
          }
        } else {
          console.log("Cash payment or no payment required, closing modal...");
          // For cash payments or no payment required, just close the modal
          resetSaleModalState();
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          setFormErrors(error.issues);
        } else if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "Sale Creation Failed: Internal Server Error";
          setApiError(message);
        } else {
          setApiError("Sale Creation Failed: Internal Server Error");
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
      const validationResult = formSchema.safeParse(payload);
      const isPayloadValid = validationResult.success;
      
      if (!isPayloadValid) {
        console.log("Payload validation failed:", validationResult.error.issues);
      }
      
      const doesParamsExist =
        SaleStore.parameters.length > 0 &&
        SaleStore.parameters.every((param) => param.currentProductId !== "");
      
      console.log("Form validation:", {
        isPayloadValid,
        doesParamsExist,
        payload: payload,
        parameters: SaleStore.parameters
      });
      
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
                  : !SaleStore.paymentDetails.reference
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
                  <Input
                    type="text"
                    name="bvn"
                    label="BANK VERIFICATION NUMBER"
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
                    placeholder="Enter 11 digit BVN (Optional)"
                    required={false}
                    errorMessage={getFieldError("bvn")}
                    maxLength={11}
                    description="BVN must be exactly 11 digits (numbers only)"
                  />
                  {/* <ModalInput
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
                  /> */}
                  {/* <ModalInput
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
                  /> */}
                  {SaleStore.doesSaleItemHaveInstallment() && (
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
                  payload={getPayload()}
                  refreshTable={allSalesRefresh}
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
