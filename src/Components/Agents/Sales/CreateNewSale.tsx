import React, { useCallback, useEffect, useState } from "react";
import { KeyedMutator } from "swr";
import { z, ZodIssue } from "zod";
import { useApiCall } from "@/utils/useApiCall";
import { SaleStore } from "@/stores/SaleStore";
import SelectCustomerProductModal from "./SelectCustomerProductModal";
import roletwo from "@/assets/table/roletwo.svg";
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
import { toJS } from "mobx";
import axios from "axios";
import ApiErrorMessage from "@/Components/ApiErrorMessage";
import { SelectInput, ModalInput, ToggleInput } from "@/Components/InputComponent/Input";
import { Modal } from "@/Components/ModalComponent/Modal";
import ProceedButton from "@/Components/ProceedButtonComponent/ProceedButtonComponent";

const public_key =
  import.meta.env.VITE_FLW_PUBLIC_KEY ||
  "FLWPUBK_TEST-720d3bd8434091e9b28a01452ebdd2e0-X";

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
  | "";

const CreateNewSale = observer(
  ({ isOpen, setIsOpen }: CreateSalesType) => {
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

      try {
        // Step 1: Validate data

        // Step 2: Calculate payment amount
        const calculatePaymentAmount = () => {
          return SaleStore.products.reduce((total, product) => {
            const params = SaleStore.getParametersByProductId(product.productId);
            const miscellaneous = SaleStore.getMiscellaneousByProductId(product.productId);
            
            // Calculate base product total
            let productTotal = Number(product.productPrice) * Number(product.productUnits);
            
            // Add miscellaneous costs
            if (miscellaneous?.costs) {
              const miscCosts = Array.from(miscellaneous.costs.values()).reduce((sum, cost) => sum + Number(cost), 0);
              productTotal += miscCosts;
            }
            
            // Apply discount
            if (params?.discount && params.discount > 0) {
              const discountAmount = (params.discount / 100) * productTotal;
              productTotal -= discountAmount;
            }
            
            // If installment payment, calculate initial payment based on installment duration
            if (params?.paymentMode === "INSTALLMENT" && params.installmentDuration) {
              // Calculate monthly installment amount
              const monthlyInstallment = productTotal / params.installmentDuration;
              // Use the user-defined initial payment or calculated monthly amount
              const initialPayment = params.installmentStartingPrice || monthlyInstallment;
              return total + initialPayment;
            }
            
            // For one-off payments, use full amount
            return total + productTotal;
          }, 0);
        };

        const paymentAmount = calculatePaymentAmount();
        console.log("Calculated payment amount:", paymentAmount);

        // Step 3: Store payment details for SalesSummary
        console.log("Creating payment data object...");
        const newPaymentData = {
          public_key: public_key,
          tx_ref: `sale_${Date.now()}`,
          amount: paymentAmount,
          currency: "NGN",
          customer: {
            email: SaleStore?.customer?.email || "",
            phone_number: SaleStore?.customer?.phone || "",
            name: SaleStore.customer?.customerName || "",
          },
          customizations: {
            title: "Sale Payment",
            description: "Payment for sale",
            logo: "https://yourdomain.com/logo.png",
          },
          meta: {
            saleId: "",
            customerName: SaleStore.customer?.customerName || "",
          },
          redirect_url: `${window.location.origin}/sales/all`,
          payment_options: "card,banktransfer,ussd",
        };
        
        console.log("Payment data created:", newPaymentData);
        
        // Step 4: Add payment details to store and go to summary
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
      } catch (error) {
        if (error instanceof z.ZodError) {
          setFormErrors(error.issues);
        } else if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "Form validation failed. Please check your inputs.";
          setApiError(message);
        } else {
          setApiError("Form validation failed. Please check your inputs.");
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
                  payload={payload}
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
