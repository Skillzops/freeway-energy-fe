import React, { useEffect, useMemo, useState } from "react";
import { Tag } from "../Products/ProductDetails";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import inventoryIcon from "../../assets/inventory/inventoryIcon.svg";
import { GoDotFill } from "react-icons/go";
import { formatDateTime, formatNumberWithCommas } from "@/utils/helpers";
import { NairaSymbol } from "../CardComponents/CardComponent";
import { KeyedMutator } from "swr";
import { useApiCall } from "@/utils/useApiCall";
import ApiErrorMessage from "../ApiErrorMessage";

type InventoryDetailsProps = {
  inventoryId: string | number;
  inventoryImage: string;
  inventoryName: string;
  inventoryClass: string;
  inventoryCategory: string;
  sku: string;
  manufacturerName: string;
  dateOfManufacture: string | null;
  numberOfStock: number;
  remainingQuantity: number;
  costPrice: number;
  salePrice: number;
  stockValue: string | number;
  displayInput?: boolean;
  setDisplayInput?: React.Dispatch<React.SetStateAction<boolean>>;
  tagStyle: (value: string) => string;
  refreshTable: KeyedMutator<any>;
  refreshListView: KeyedMutator<any>;
};

const InventoryDetails: React.FC<InventoryDetailsProps> = ({
  inventoryId = "",
  inventoryImage = "",
  inventoryName = "",
  inventoryClass = "",
  inventoryCategory = "",
  sku = "",
  manufacturerName = "",
  dateOfManufacture = "",
  numberOfStock = 0,
  remainingQuantity = 0,
  costPrice = 0,
  salePrice = 0,
  stockValue,
  displayInput = false,
  setDisplayInput,
  tagStyle,
  refreshTable,
  refreshListView,
}) => {
  const { apiCall } = useApiCall();
  const defaultFormData = useMemo(
    () => ({
      inventoryName,
      inventoryClass,
      sku,
      manufacturerName,
      dateOfManufacture: dateOfManufacture || "",
    }),
    [inventoryName, inventoryClass, sku, manufacturerName, dateOfManufacture]
  );
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | string[] | Record<string, unknown> | null>(null);

  useEffect(() => {
    setFormData(defaultFormData);
    if (!displayInput) setApiError(null);
  }, [defaultFormData, displayInput]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setApiError(null);
  };

  const updatedPayload = {
    ...(formData.inventoryName.trim() !== defaultFormData.inventoryName.trim() && {
      name: formData.inventoryName.trim(),
    }),
    ...(formData.manufacturerName.trim() !== defaultFormData.manufacturerName.trim() && {
      manufacturerName: formData.manufacturerName.trim(),
    }),
    ...(formData.sku.trim() !== defaultFormData.sku.trim() && {
      sku: formData.sku.trim(),
    }),
    ...(formData.inventoryClass !== defaultFormData.inventoryClass && {
      class: formData.inventoryClass,
    }),
    ...(String(formData.dateOfManufacture || "") !==
      String(defaultFormData.dateOfManufacture || "") && {
      dateOfManufacture: formData.dateOfManufacture || "",
    }),
  };

  const isFormFilled = Object.keys(updatedPayload).length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormFilled) return;
    setLoading(true);
    setApiError(null);
    try {
      await apiCall({
        endpoint: `/v1/inventory/${inventoryId}`,
        method: "patch",
        data: updatedPayload,
        successMessage: "Inventory updated successfully!",
      });
      await Promise.all([refreshListView(), refreshTable()]);
      setDisplayInput?.(false);
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        "Inventory update failed: Internal Server Error";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="flex items-center justify-between p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <Tag name="Inventory Picture" variant="ink" />
        <div className="flex items-center justify-center w-full p-2 max-w-[100px] h-[100px] gap-2 border-[0.6px] border-strokeCream rounded-full overflow-clip">
          <img
            src={inventoryImage}
            alt="Inventory Image"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={inventoryIcon} alt="Inventory Icon" /> ITEM DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Name" />
          {displayInput ? (
            <input
              type="text"
              name="inventoryName"
              value={formData.inventoryName}
              onChange={handleChange}
              required={true}
              placeholder="Enter Inventory Name"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {inventoryName}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Class" variant="ink" />
          {displayInput ? (
            <select
              name="inventoryClass"
              value={formData.inventoryClass}
              onChange={handleChange}
              required={true}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-[10px]"
            >
              <option value="REGULAR">Regular</option>
              <option value="RETURNED">Returned</option>
              <option value="REFURBISHED">Refurbished</option>
            </select>
          ) : (
            <span
              className={`${tagStyle(
                inventoryClass
              )} flex items-center justify-center gap-0.5 w-max px-2 h-[24px] text-xs uppercase rounded-full`}
            >
              <GoDotFill width={4} height={4} />
              {inventoryClass}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Category" variant="ink" />
          {inventoryCategory ? (
            <span className="flex items-center justify-center bg-[#FEF5DA] gap-0.5 w-max px-2 h-[24px] text-textDarkBrown text-xs uppercase rounded-full">
              <GoDotFill width={4} height={4} />
              {inventoryCategory}
            </span>
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">N/A</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="SKU" />
          {displayInput ? (
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Enter SKU"
              required={false}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {sku ? sku : "N/A"}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={inventoryIcon} alt="Inventory Icon" /> MANUFACTURERS DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Manufacturers Name" />
          {displayInput ? (
            <input
              type="text"
              name="manufacturerName"
              value={formData.manufacturerName}
              onChange={handleChange}
              placeholder="Enter Manufacturer Name"
              required={true}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {manufacturerName}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Date Of Manufacture" />
          {displayInput ? (
            <input
              type="date"
              name="dateOfManufacture"
              value={formData.dateOfManufacture || ""}
              onChange={handleChange}
              placeholder="Enter Date of Manufacture"
              required={false}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {dateOfManufacture
                ? formatDateTime("date", dateOfManufacture)
                : "N/A"}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={inventoryIcon} alt="Inventory Icon" />
          CURRENT BATCH STOCK DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Total Quantity of Stock" />
          <p className="text-xs font-bold text-textDarkGrey">
            {formatNumberWithCommas(numberOfStock)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Remaining Quantity of Stock" />
          <p className="text-xs font-bold text-textDarkGrey">
            {formatNumberWithCommas(remainingQuantity)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Cost of Stock" />
          <p className="flex items-center justify-end gap-1 w-max text-xs font-bold text-textDarkGrey">
            <NairaSymbol color="#828DA9" />
            {formatNumberWithCommas(costPrice)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Price of Stock" />
          <p className="flex items-center justify-end gap-1 w-max text-xs font-bold text-textDarkGrey">
            <NairaSymbol color="#828DA9" />
            {formatNumberWithCommas(salePrice)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Stock Value" />
          <p className="flex items-center justify-end gap-1 w-max text-xs font-bold text-textDarkGrey">
            <NairaSymbol color="#828DA9" />
            {formatNumberWithCommas(stockValue)}
          </p>
        </div>
      </div>

      <ApiErrorMessage apiError={apiError} />

      {displayInput && (
        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            loading={loading}
            variant={isFormFilled ? "gradient" : "gray"}
            disabled={!isFormFilled}
          />
        </div>
      )}
    </form>
  );
};

export default InventoryDetails;
