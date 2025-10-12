import { useState } from "react";
import { Input } from "../InputComponent/Input";
import { z } from "zod";
import { saleRecipientSchema } from "./salesSchema";
import { SaleStore } from "@/stores/SaleStore";
import SecondaryButton from "../SecondaryButton/SecondaryButton";

type FormData = z.infer<typeof saleRecipientSchema>;

const defaultFormData: FormData = {
  firstname: "",
  lastname: "",
  address: "",
  phone: "",
  email: "",
};

const SaleRecipientForm = ({
  handleClose,
  currentProductId,
}: {
  handleClose: () => void;
  currentProductId: string;
}) => {
  const [formData, setFormData] = useState<FormData>(
    SaleStore.getRecipientByProductId(currentProductId) || defaultFormData
  );
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [autoFillChecked, setAutoFillChecked] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };

  const isFormFilled = saleRecipientSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const validateItems = () => {
    const result = saleRecipientSchema.safeParse(formData);
    if (!result.success) {
      setFormErrors(result.error.issues);
      return true;
    }
    setFormErrors([]);
    return true;
  };

  const saveForm = () => {
    if (!validateItems()) return;
    SaleStore.addOrUpdateRecipient(currentProductId, formData);
    SaleStore.addSaleItem(currentProductId);
    handleClose();
  };

  const handleAutoFillCustomer = () => {
    const customer = SaleStore.customer;
    if (customer && customer.firstname) {
      setFormData({
        firstname: customer.firstname,
        lastname: customer.lastname,
        address: customer.location,
        phone: customer.phone,
        email: customer.email,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoFillChecked(e.target.checked);
    if (e.target.checked) {
      handleAutoFillCustomer();
    }
  };

  return (
    <div className="flex flex-col justify-between h-full max-h-[360px] py-4 pr-1 sm:pr-3 overflow-y-auto gap-4">
      {/* Conditionally render the checkbox for auto-filling */}
      {SaleStore?.customer?.firstname && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="autoFillCustomer"
            checked={autoFillChecked}
            onChange={handleCheckboxChange}
            className="w-4 h-4"
          />
          <label htmlFor="autoFillCustomer" className="text-sm">
            Autofill Customer Data
          </label>
        </div>
      )}
      <Input
        type="text"
        name="firstname"
        label="First Name"
        value={formData.firstname}
        onChange={handleInputChange}
        placeholder="Enter First Name"
        required={true}
        errorMessage={getFieldError("firstname")}
      />
      <Input
        type="text"
        name="lastname"
        label="Last Name"
        value={formData.lastname}
        onChange={handleInputChange}
        placeholder="Enter Last Name"
        required={true}
        errorMessage={getFieldError("lastname")}
      />
      <Input
        type="text"
        name="address"
        label="Address"
        value={formData.address}
        onChange={handleInputChange}
        placeholder="Enter Address"
        required={true}
        errorMessage={getFieldError("address")}
      />
      <Input
        type="text"
        name="phone"
        label="Phone"
        value={formData.phone}
        onChange={handleInputChange}
        placeholder="Enter Phone"
        required={true}
        errorMessage={getFieldError("phone")}
      />
      <Input
        type="email"
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Enter Email"
        required={true}
        errorMessage={getFieldError("email")}
      />
      <div className="flex items-center justify-between gap-1 mt-4">
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
};

export default SaleRecipientForm;
