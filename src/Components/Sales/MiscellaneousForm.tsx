import { SaleStore } from "@/stores/SaleStore";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { z } from "zod";
import SecondaryButton from "../SecondaryButton/SecondaryButton";

interface CostItem {
  name: string;
  cost: string;
}

interface FormErrors {
  name?: string[];
  cost?: string[];
}

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  cost: z.number().min(0, { message: "Cost must be a positive number" }),
});

export default function MiscellaneousForm({
  handleClose,
  currentProductId,
}: {
  handleClose: () => void;
  currentProductId: string;
}) {
  const [items, setItems] = useState<CostItem[]>(() => {
    const miscellaneous =
      SaleStore.getMiscellaneousByProductId(currentProductId);
    if (miscellaneous && miscellaneous.costs.size > 0) {
      return Array.from(miscellaneous.costs.entries()).map(([name, cost]) => ({
        name,
        cost: cost.toString(),
      }));
    }
    return [{ name: "", cost: "" }];
  });
  const [errors, setErrors] = useState<(FormErrors | null)[]>([]);

  const addItem = () => {
    setItems([...items, { name: "", cost: "" }]);
    setErrors([...errors, null]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    const newErrors = errors.filter((_, i) => i !== index);
    setItems(newItems);
    setErrors(newErrors);
  };

  const handleChange = (
    index: number,
    field: keyof CostItem,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);

    // Clear error when user starts typing
    const newErrors = [...errors];
    newErrors[index] = {
      ...newErrors[index],
      [field]: undefined,
    };
    setErrors(newErrors);
  };

  const isFormFilled =
    items.length > 0 &&
    items.every((item) => item.name.trim() !== "" && item.cost.trim() !== "");

  const validateItems = () => {
    const newErrors = items.map((item) => {
      const result = schema.safeParse({
        ...item,
        cost: Number.parseFloat(item.cost) || 0,
      });
      return result.success ? null : result.error.formErrors.fieldErrors;
    });
    setErrors(newErrors);
    return newErrors.every((error) => error === null);
  };

  const saveForm = () => {
    if (!validateItems()) return;

    const newItems = items.map((item) => ({
      name: item.name,
      cost: Number(item.cost),
    }));

    const newItemsObject = newItems.reduce((acc, item) => {
      acc[item.name] = item.cost;
      return acc;
    }, {} as Record<string, number>);

    SaleStore.addOrUpdateMiscellaneousPrice(currentProductId, newItemsObject);
    SaleStore.addSaleItem(currentProductId);
    handleClose();
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[330px] gap-2">
      <div className="space-y-4 overflow-y-auto max-h-[270px]">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr,1fr,auto] gap-4 items-start"
          >
            <div className="space-y-1">
              <input
                value={item.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
                placeholder="Cost Title Here"
                className={`w-full px-3 py-2 border rounded-md outline-none transition-colors
                  ${
                    errors[index]?.name
                      ? "border-errorTwo focus:border-errorTwo"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
              />
              {errors[index]?.name && (
                <p className="text-xs text-errorTwo font-semibold">
                  {errors[index]?.name.join(", ")}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₦
                </span>
                <input
                  value={item.cost}
                  onChange={(e) => handleChange(index, "cost", e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full pl-7 pr-4 py-2 border rounded-md outline-none transition-colors no-spinner
                    ${
                      errors[index]?.cost
                        ? "border-errorTwo focus:border-errorTwo"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                />
              </div>
              {errors[index]?.cost && (
                <p className="text-xs text-errorTwo font-semibold ">
                  {errors[index]?.cost.join(", ")}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center h-full">
              <span
                className="flex items-center justify-center w-7 h-7 bg-white cursor-pointer border-[0.6px] border-strokeGreyTwo rounded-full transition-all hover:opacity-50"
                title="Remove Customer"
                onClick={() => removeItem(index)}
              >
                <RiDeleteBin5Fill color="#FC4C5D" />
              </span>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={addItem}
            className="w-8 h-8 rounded-full bg-success hover:bg-green-500 transition-colors duration-200 flex items-center justify-center text-white shadow-lg hover:shadow-xl"
            title="Add New Miscellaneous Cost"
          >
            <IoMdAdd className="w-5 h-5" />
            <span className="sr-only">Add Another Cost</span>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1">
        <SecondaryButton
          variant="secondary"
          children="Cancel"
          onClick={handleClose}
        />
        <SecondaryButton
          disabled={!isFormFilled}
          children="Save"
          onClick={saveForm}
        />
      </div>
    </div>
  );
}
