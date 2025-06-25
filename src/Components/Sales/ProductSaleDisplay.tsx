import React from "react";
import { Tag } from "../Products/ProductDetails";
import {
  NairaSymbol,
  ProductTag,
  SimpleTag,
} from "../CardComponents/CardComponent";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { ExtraInfoType } from "./CreateNewSale";
import { SaleStore } from "@/stores/SaleStore";
import { observer } from "mobx-react-lite";

export const ProductDetailRow = ({
  label,
  value,
  showNaira = false,
  title,
}: {
  label: string;
  value: string | number;
  showNaira?: boolean;
  title?: string;
}) => (
  <div className="flex items-center justify-between gap-2 w-full">
    <Tag name={label} />
    <p
      className="flex gap-1 items-center justify-end text-xs font-bold text-textDarkGrey"
      title={title}
    >
      {showNaira && <NairaSymbol />}
      {label === "Product Category" ? <ProductTag productTag={value} /> : value}
    </p>
  </div>
);

export const ExtraInfoSection = ({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) => (
  <div className="flex flex-col gap-2 w-full">
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center justify-between w-max gap-2">
        <p className="text-textDarkGrey text-sm font-semibold">{label}</p>
        <SimpleTag
          text={"SAVED"}
          dotColour="#00AF50"
          containerClass="bg-[#F6F8FA] text-success font-semibold px-2 py-1 border-[0.4px] border-strokeGreyThree rounded-full"
        />
      </div>
      <button
        type="button"
        className="text-sm font-semibold text-errorTwo"
        title={`Clear ${label}`}
        onClick={() => {
          onClear();
        }}
      >
        Clear
      </button>
    </div>
  </div>
);

const ProductSaleDisplay = observer(
  ({
    productData,
    onRemoveProduct,
    setExtraInfoModal,
    getIsFormFilled,
    getFieldError,
  }: {
    productData: {
      productId: string;
      productName: string;
      productUnits: number;
      productImage: string;
      productPrice: string;
      productTag: string;
    };
    onRemoveProduct: (productId: string) => void;
    setExtraInfoModal: React.Dispatch<React.SetStateAction<ExtraInfoType>>;
    getIsFormFilled: () => boolean;
    getFieldError: (fieldName: string, productId: string) => string[];
  }) => {
    const { productTag, productId, productName, productUnits, productPrice } =
      productData;

    const doesParamsExist = Boolean(
      SaleStore.getParametersByProductId(productId)
    );
    const miscellaneousCosts =
      SaleStore.getMiscellaneousByProductId(productId)?.costs;
    const doesDevicesExist = Boolean(SaleStore.getSelectedDevices(productId));
    const doesRecipientExist = Boolean(
      SaleStore.getRecipientByProductId(productId)
    );

    const types = ["parameters", "miscellaneous", "devices", "recipient"];

    const allErrors = [
      ...getFieldError("quantity", productId),
      ...getFieldError("paymentMode", productId),
      ...getFieldError("installmentDuration", productId),
      ...getFieldError("installmentStartingPrice", productId),
      ...getFieldError("devices", productId),
      ...getFieldError("miscellaneousPrices", productId),
      ...getFieldError("saleRecipient", productId),
    ];

    return (
      <div className="flex flex-col gap-2 w-full p-2.5 border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <ProductDetailRow label="Product Category" value={productTag} />
        <ProductDetailRow label="Product Name" value={productName} />
        <ProductDetailRow label="Product Units" value={productUnits} />
        <ProductDetailRow label="Product Price" value={productPrice} />

        <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
          {doesParamsExist && (
            <ExtraInfoSection
              label="Parameters"
              onClear={() => SaleStore.removeParameter(productId)}
            />
          )}
          {miscellaneousCosts && Object.keys(miscellaneousCosts).length > 0 && (
            <ExtraInfoSection
              label="Miscellaneous Costs"
              onClear={() => SaleStore.removeMiscellaneousPrice(productId)}
            />
          )}
          {doesDevicesExist && (
            <ExtraInfoSection
              label="Devices"
              onClear={() => {
                SaleStore.removeDevices(productId);
                SaleStore.removeTentativeDevices(productId);
              }}
            />
          )}
          {doesRecipientExist && (
            <ExtraInfoSection
              label="Recipient"
              onClear={() => SaleStore.removeRecipient(productId)}
            />
          )}
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex flex-wrap items-center w-[90%] gap-3 gap-y-3">
              {types?.map((type) => (
                <div
                  key={type}
                  className={`flex items-center justify-center text-sm font-medium px-3 py-1 w-max rounded-full cursor-pointer transition-all
                  ${
                    type === "parameters"
                      ? "bg-primaryGradient text-white"
                      : "bg-white text-textDarkGrey border-[0.6px] border-strokeGreyTwo"
                  }
                  `}
                  onClick={() => setExtraInfoModal(type as ExtraInfoType)}
                >
                  {type === "parameters"
                    ? "Set Parameters"
                    : type === "miscellaneous"
                    ? "Set Miscellaneous Costs"
                    : type === "devices"
                    ? "Link Device"
                    : "Set Recipient"}
                </div>
              ))}
            </div>
            <span
              className="flex items-center justify-center w-7 h-7 bg-white cursor-pointer border-[0.6px] border-strokeGreyTwo rounded-full transition-all hover:opacity-50"
              title="Remove Product"
              onClick={() => {
                onRemoveProduct(productId);
                getIsFormFilled();
              }}
            >
              <RiDeleteBin5Fill color="#FC4C5D" />
            </span>
          </div>
        </div>
        {/* ERROR SECTION */}
        {allErrors.length > 0 && (
          <div className="p-3 mt-4 border border-red-500 rounded-md bg-red-50">
            {allErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error}.
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
);

export default ProductSaleDisplay;
