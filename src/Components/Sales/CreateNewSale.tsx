import React, { useCallback, useEffect, useState } from "react";
import { KeyedMutator } from "swr";
// import { Modal } from "../ModalComponent/Modal"; // not needed for centered overlays
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
import { toJS } from "mobx";
import axios from "axios";
import SelectCustomerProductModal from "./SelectCustomerProductModal";

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
  | "guarantor"
  | "";

const CreateNewSale = observer(
  ({ isOpen, setIsOpen, allSalesRefresh }: CreateSalesType) => {
    const { apiCall } = useApiCall();
    const [formData, setFormData] = useState<FormData>(defaultSaleFormData);
    const [loading, setLoading] = useState(false);

    // centered modal for pickers (customer / product)
    const [isCustomerProductModalOpen, setIsCustomerProductModalOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState<"customer" | "product">("customer");

    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
    const [apiError, setApiError] = useState<string | Record<string, string[]>>("");
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
      setFormData((prev) => ({ ...prev, [name]: values }));
      resetFormErrors(name);
    };

    const getPayload = useCallback(() => {
      const payload: SalePayload = {
        category: SaleStore.category,
        customerId: SaleStore.customer?.customerId as string,
        saleItems: (SaleStore.getTransformedSaleItems() as SaleItem[]) || [],
        applyMargin: formData.applyMargin,
        paymentMethod: SaleStore.paymentMethod,
      };

      if (SaleStore.doesSaleItemHaveInstallment()) {
        payload.bvn = formData.bvn;
        if (SaleStore.guarantorDetails && SaleStore.guarantorDetails.fullName) {
          const guarantorDetails = { ...SaleStore.guarantorDetails };
          if (
            !guarantorDetails.identificationDetails ||
            !guarantorDetails.identificationDetails.idType ||
            !guarantorDetails.identificationDetails.idNumber
          ) {
            const { identificationDetails, ...rest } = guarantorDetails;
            payload.guarantorDetails = rest;
          } else {
            payload.guarantorDetails = guarantorDetails;
          }
        }
      }
      return payload;
    }, [formData]);

    const handleInputChange = (name: string, value: any) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
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
        formSchema.parse(payload);

        const newPaymentData = {
          publicKey: public_key,
          email: SaleStore?.customer?.email || "",
          amount: 0,
          currency: "NGN",
          reference: `sale_${Date.now()}`,
          metadata: {
            saleId: "",
            customerName: SaleStore.customer?.customerName || "",
            phoneNumber: SaleStore?.customer?.phone || "",
            tx_ref: `sale_${Date.now()}`,
            payment_options: "card,banktransfer,ussd",
            customer: {
              email: SaleStore?.customer?.email || "",
              name: SaleStore.customer?.customerName || "",
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

        SaleStore.addPaymentDetails(newPaymentData);
        setSummaryState(true);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setFormErrors(error.issues);
        } else if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message || "Form validation failed. Please check your inputs.";
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
      const doesParamsExist =
        SaleStore.parameters.length > 0 &&
        SaleStore.parameters.every((param) => param.currentProductId !== "");
      return isPayloadValid && doesParamsExist;
    };

    const getFieldError = (fieldName: string) =>
      formErrors.find((error) => error.path[0] === fieldName)?.message;

    const getSaleItemFieldErrorByIndex = (fieldName: string, productId: string) =>
      formErrors
        .filter((error: ZodIssue) => {
          if (error.path[0] === "saleItems") {
            const saleItemIndex = error.path[1] as number;
            const saleItem = SaleStore.saleItems[saleItemIndex];
            return saleItem && saleItem.productId === productId;
          }
          return false;
        })
        .filter((error) => error.path[2] === fieldName)
        .map((error) => error.message);

    revalidateStore(SaleStore);
    console.log("Sale Items:", toJS(SaleStore.getTransformedSaleItems()));

    // lock body scroll while any modal is open
    useEffect(() => {
      const anyOpen = isOpen || isCustomerProductModalOpen || !!extraInfoModal;
      if (anyOpen) document.body.style.overflow = "hidden";
      else document.body.style.overflow = "";
      return () => { document.body.style.overflow = ""; };
    }, [isOpen, isCustomerProductModalOpen, extraInfoModal]);

    // --- MAIN MODAL: New Sale (center + zoom) ---
    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        >
          {/* Panel */}
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-modal-zoom-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full w-9 h-9 grid place-items-center text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-slate-300"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>

            {/* Header */}
            <div
              className={`px-6 md:px-8 py-4 md:py-5 border-b border-strokeGreyThree ${
                getIsFormFilled() ? "bg-paleCreamGradientLeft" : "bg-paleGrayGradientLeft"
              }`}
            >
              <h2 className="text-[18px] md:text-[20px] text-textBlack font-semibold font-secondary">
                {!summaryState
                  ? "New Sale"
                  : !SaleStore.paymentDetails.reference
                  ? "Sale Summary"
                  : "Proceed to Payment"}
              </h2>
              <p className="text-[12px] md:text-[13px] text-textDarkGrey mt-1">
                {!summaryState
                  ? "Fill in the details below to create a new sale."
                  : !SaleStore.paymentDetails.reference
                  ? "Review the sale details before proceeding."
                  : "Complete the payment to finalize this sale."}
              </p>
            </div>

            {/* Body (scrollable) */}
            <form className="bg-white" onSubmit={handleSubmit} noValidate>
              <div className="px-6 md:px-8 py-6 md:py-8 max-h-[85vh] overflow-y-auto space-y-8">
                {!summaryState ? (
                  <>
                    {/* Basics */}
                    <section className="space-y-4">
                      <h3 className="text-[13px] font-semibold text-textDarkGrey uppercase tracking-wide">
                        Basics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
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

                        <div className="flex items-center justify-between gap-3 md:gap-4">
                          <div>
                            <p className="text-sm text-textBlack font-semibold">Apply Margin</p>
                            <p className="text-xs text-textLightGrey mt-0.5">
                              Include configured margin in this sale.
                            </p>
                          </div>
                          <ToggleInput
                            defaultChecked={formData.applyMargin}
                            onChange={(checked: boolean) => handleInputChange("applyMargin", checked)}
                          />
                        </div>
                      </div>
                    </section>

                    <hr className="border-strokeGreyThree/70" />

                    {/* Parties */}
                    <section className="space-y-4">
                      <h3 className="text-[13px] font-semibold text-textDarkGrey uppercase tracking-wide">
                        Parties
                      </h3>
                      <div className="grid grid-cols-1 gap-5 md:gap-6">
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
                                <div className="relative flex items-center gap-2 md:gap-3 w-max">
                                  <img src={roletwo} alt="Icon" width="30" />
                                  <span className="bg-[#EFF2FF] px-3 py-1.5 rounded-full text-xs font-bold text-textDarkGrey capitalize">
                                    {selectedCustomer?.customerName}
                                  </span>
                                  <button
                                    type="button"
                                    className="flex items-center justify-center w-7 h-7 bg-white border border-strokeGreyTwo rounded-full transition-all hover:bg-rose-50"
                                    title="Remove Customer"
                                    onClick={SaleStore.removeCustomer}
                                  >
                                    <RiDeleteBin5Fill color="#FC4C5D" />
                                  </button>
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
                      </div>
                    </section>

                    <hr className="border-strokeGreyThree/70" />

                    {/* Products */}
                    <section className="space-y-4">
                      <div className="flex items-end justify-between">
                        <h3 className="text-[13px] font-semibold text-textDarkGrey uppercase tracking-wide">
                          Products
                        </h3>
                        <button
                          type="button"
                          className="text-xs font-semibold text-[#800020] hover:underline"
                          onClick={() => {
                            setIsCustomerProductModalOpen(true);
                            setModalType("product");
                          }}
                        >
                          + Add Product
                        </button>
                      </div>

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
                          <div className="flex flex-wrap items-center w-full gap-4 md:gap-6">
                            {selectedProducts?.map((data, index) => (
                              <ProductSaleDisplay
                                key={index}
                                productData={data}
                                onRemoveProduct={(productId) => SaleStore.removeProduct(productId)}
                                setExtraInfoModal={(value) => {
                                  setCurrentProductId(data.productId);
                                  setExtraInfoModal(value);
                                }}
                                getIsFormFilled={getIsFormFilled}
                                getFieldError={getSaleItemFieldErrorByIndex}
                              />
                            ))}
                          </div>
                        }
                        errorMessage={
                          !SaleStore.doesProductCategoryExist
                            ? "Failed to fetch products"
                            : getFieldError("products")
                        }
                      />
                    </section>

                    {/* Installment-only */}
                    {SaleStore.doesSaleItemHaveInstallment() && (
                      <>
                        <hr className="border-strokeGreyThree/70" />
                        <section className="space-y-4">
                          <h3 className="text-[13px] font-semibold text-textDarkGrey uppercase tracking-wide">
                            Installment Details
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <Input
                              type="text"
                              name="bvn"
                              label="BANK VERIFICATION NUMBER"
                              value={formData.bvn as string}
                              onChange={(e) => {
                                const numericValue = e.target.value.replace(/\D/g, "");
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

                            <ModalInput
                              type="button"
                              name="guarantorDetails"
                              label="GUARANTOR DETAILS"
                              onClick={() => setExtraInfoModal("guarantor")}
                              placeholder="Enter Guarantor"
                              required={false}
                              isItemsSelected={Boolean(SaleStore.guarantorDetails.fullName)}
                              customSelectedText="Update Guarantor"
                              itemsSelected={
                                <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border border-strokeGreyThree rounded-md">
                                  {SaleStore.guarantorDetails.fullName && (
                                    <ExtraInfoSection
                                      label="Guarantor"
                                      onClear={() => SaleStore.removeGuarantorDetails()}
                                    />
                                  )}
                                </div>
                              }
                              errorMessage={getFieldError("guarantorDetails")}
                            />
                          </div>
                        </section>
                      </>
                    )}

                    {/* Spacer for sticky footer */}
                    <div className="h-6" />
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

              {/* Sticky Footer (only on form step) */}
              {!summaryState && (
                <div className="sticky bottom-0 inset-x-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 border-t border-strokeGreyThree">
                  <div className="px-6 md:px-8 py-3 md:py-4 flex items-center justify-end">
                    <ProceedButton
                      type="button"
                      loading={false}
                      variant={getIsFormFilled() ? "gradient" : "gray"}
                      disabled={!getIsFormFilled()}
                      onClick={() => setSummaryState(true)}
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* SECONDARY: Customer/Product chooser (center + zoom) */}
        {isCustomerProductModalOpen && (
          <div
            className="fixed inset-0 z-[110] grid place-items-center p-4 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setIsCustomerProductModalOpen(false)}
          >
            <div
              className="relative w-full max-w-4xl rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-modal-zoom-in overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                className="absolute right-3 top-3 rounded-full w-9 h-9 grid place-items-center text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-slate-300"
                onClick={() => setIsCustomerProductModalOpen(false)}
              >
                ✕
              </button>

              {/* If your internal component animates/slides, this wrapper still forces center+zoom */}
              <div className="max-h-[85vh] overflow-y-auto">
                <SelectCustomerProductModal
                  isModalOpen={true}
                  setModalOpen={setIsCustomerProductModalOpen}
                  modalType={modalType}
                />
              </div>

              {/* Optional sticky footer could go here if you want quick actions */}
            </div>
          </div>
        )}

        {/* TERTIARY: Extra info modal (keep your existing behavior, or center it too) */}
        {extraInfoModal !== "" && (
          <div
            className="fixed inset-0 z-[120] grid place-items-center p-4 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setExtraInfoModal("")}
          >
            <div
              className="relative w-full max-w-3xl rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-modal-zoom-in overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                className="absolute right-3 top-3 rounded-full w-9 h-9 grid place-items-center text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-slate-300"
                onClick={() => setExtraInfoModal("")}
              >
                ✕
              </button>

              <div className="max-h-[85vh] overflow-y-auto">
                <SetExtraInfoModal
                  extraInfoModal={extraInfoModal}
                  setExtraInfoModal={setExtraInfoModal}
                  currentProductId={currentProductId}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

export default CreateNewSale;
