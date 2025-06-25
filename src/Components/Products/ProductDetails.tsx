import React, { useState } from "react";
import producticon from "../../assets/product-grey.svg";
import creditcardicon from "../../assets/creditcardgrey.svg";
import settingsicon from "../../assets/settings.svg";
import { NameTag, ProductTag } from "../CardComponents/CardComponent";
import { formatDateTime, formatNumberWithCommas } from "../../utils/helpers";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { SmallFileInput } from "../InputComponent/Input";
import { LuImagePlus } from "react-icons/lu";
import { KeyedMutator } from "swr";

interface ProductDetailsProps {
  productId: string;
  productImage: string;
  productName: string;
  productTag: string;
  productPrice: {
    minimumInventoryBatchPrice: number;
    maximumInventoryBatchPrice: number;
  };
  paymentModes: string[] | string;
  datetime: string;
  name: string;
  displayInput?: boolean;
  refreshTable: KeyedMutator<any>;
}

export const Tag = ({ name, variant }: { name: string; variant?: string }) => {
  return (
    <p
      className={`flex items-center justify-center h-[24px] text-xs p-2 rounded-full ${
        variant === "ink"
          ? "text-inkBlueTwo bg-paleLightBlue"
          : "text-textBlack bg-[#F6F8FA]"
      }`}
    >
      {name}
    </p>
  );
};

const ProductDetails: React.FC<ProductDetailsProps> = ({
  productId = "",
  productImage = "",
  productName = "",
  productTag = "",
  productPrice = {
    minimumInventoryBatchPrice: 0,
    maximumInventoryBatchPrice: 0,
  },
  paymentModes = [],
  datetime = "",
  name = "",
  displayInput = false,
  refreshTable,
}) => {
  const [formData, setFormData] = useState({
    productId,
    productImage: productImage ?? "",
    productTag,
    paymentModes,
    productName: `${productTag}-${productId}`,
  });
  const [loading, setLoading] = useState<boolean>(false);
  // const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Check for unsaved changes by comparing the form data with the initial userData
    // if (data[name] !== value) {
    //   setUnsavedChanges(true);
    // } else {
    //   setUnsavedChanges(false);
    // }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.selectedOptions;
    const values = Array.from(options, (option) => option.value);
    setFormData((prevData) => ({
      ...prevData,
      paymentModes: values,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Submitted Data:", formData);
      refreshTable();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const { minimumInventoryBatchPrice, maximumInventoryBatchPrice } =
    productPrice;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="flex items-center justify-between p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <Tag name="Product Picture" variant="ink" />
        {displayInput ? (
          <SmallFileInput
            name="productImage"
            onChange={handleChange}
            placeholder="Upload Image"
            iconRight={<LuImagePlus />}
          />
        ) : (
          <div className="flex items-center justify-center w-full p-2 max-w-[100px] h-[100px] gap-2 border-[0.6px] border-strokeCream rounded-full overflow-clip">
            <img
              src={productImage}
              alt="Product Image"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={producticon} alt="Product Icon" /> PRODUCT DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Category" />
          {displayInput ? (
            <select
              name="productTag"
              value={formData.productTag}
              onChange={handleChange}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            >
              <option value="SHS">SHS</option>
              <option value="EAAS">EAAS</option>
              <option value="Rooftop">Rooftop</option>
            </select>
          ) : (
            <ProductTag productTag={productTag} />
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Name" />
          {displayInput ? (
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Enter Product Name"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">{productName}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={creditcardicon} alt="Credit Card Icon" /> Payment Mode
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Product Price" />
          <p className="flex items-center gap-0.5 text-xs font-bold text-textDarkGrey">
            {minimumInventoryBatchPrice === maximumInventoryBatchPrice
              ? `₦ ${formatNumberWithCommas(maximumInventoryBatchPrice)}`
              : `₦ ${formatNumberWithCommas(
                  minimumInventoryBatchPrice
                )} - ${formatNumberWithCommas(maximumInventoryBatchPrice)}`}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Payment Mode(s)" variant="ink" />
          {displayInput ? (
            <select
              multiple
              name="paymentModes"
              value={formData.paymentModes}
              onChange={handleMultiSelectChange}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-[10px]"
            >
              <option value="ONE_OFF">Single Deposit</option>
              <option value="INSTALLMENT">Installment</option>
            </select>
          ) : (
            <div className="flex items-center w-max gap-1">
              <div className="flex items-center w-max gap-1">
                {(typeof paymentModes === "string"
                  ? paymentModes.split(",")
                  : Array.isArray(paymentModes)
                  ? paymentModes
                  : []
                ).map((payment, index) => (
                  <Tag key={index} name={payment.trim().toLocaleUpperCase()} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {displayInput ? (
        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            loading={loading}
            variant={"gray"}
            disabled={false}
          />
        </div>
      ) : (
        <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
            <img src={settingsicon} alt="Settings Icon" /> GENERAL DETAILS
          </p>
          <div className="flex items-center justify-between">
            <Tag name="Date Created" />
            <p className="text-xs font-bold text-textDarkGrey">
              {formatDateTime("date", datetime)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Time Created" />
            <p className="text-xs font-bold text-textDarkGrey">
              {formatDateTime("time", datetime)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Created By" />
            <div className="text-xs font-bold text-textDarkGrey">
              <NameTag name={name} />
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default ProductDetails;
