import { useState } from "react";
import { Input, SelectInput } from "../InputComponent/Input";
import { z } from "zod";
import { identificationDetailsSchema } from "./salesSchema";
import { SaleStore } from "@/stores/SaleStore";
import { formatDateForInput } from "@/utils/helpers";
import SecondaryButton from "../SecondaryButton/SecondaryButton";

type FormData = z.infer<typeof identificationDetailsSchema>;

const defaultFormData: FormData = {
  idType: "",
  idNumber: "",
  issuingCountry: "",
  issueDate: "",
  expirationDate: "",
  fullNameAsOnID: "",
  addressAsOnID: "",
};

const IdentificationForm = ({ handleClose }: { handleClose: () => void }) => {
  const savedData = SaleStore.identificationDetails || defaultFormData;

  const [formData, setFormData] = useState<FormData>({
    ...savedData,
    issueDate: formatDateForInput(savedData.issueDate),
    expirationDate: formatDateForInput(savedData.expirationDate),
  });
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const validateItems = () => {
    const result = identificationDetailsSchema.safeParse(formData);
    if (!result.success) {
      setFormErrors(result.error.issues);
      return false;
    }
    setFormErrors([]);
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateItems();
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };

  const handleSelectChange = (name: string, values: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
    validateItems();
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };

  const isFormFilled = identificationDetailsSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const saveForm = () => {
    if (!validateItems()) return;
    SaleStore.addIdentificationDetails({
      ...formData,
      issueDate: !formData.issueDate
        ? ""
        : new Date(formData.issueDate)?.toISOString(),
      expirationDate: !formData.issueDate
        ? ""
        : new Date(formData.expirationDate)?.toISOString(),
    });
    handleClose();
  };

  return (
    <div className="flex flex-col justify-between h-full max-h-[360px] py-4 pr-1 sm:pr-3 overflow-y-auto gap-4">
      <SelectInput
        label="ID Type"
        options={[
          { label: "NIN", value: "Nin" },
          { label: "Passport", value: "Passport" },
          { label: "Driver's License", value: "Driver_License" },
          { label: "Voter ID", value: "Voter_ID" },
          { label: "Social Security Number", value: "Social_Security_Number" },
        ]}
        value={formData.idType}
        onChange={(selectedValue) =>
          handleSelectChange("idType", selectedValue)
        }
        placeholder="Select ID Type"
        required={true}
        errorMessage={getFieldError("idType")}
      />
      <Input
        type="text"
        name="idNumber"
        label="ID Number"
        value={formData.idNumber}
        onChange={handleInputChange}
        placeholder="Enter ID Number"
        required={true}
        errorMessage={getFieldError("idNumber")}
      />
      <Input
        type="text"
        name="issuingCountry"
        label="Issuing Country"
        value={formData.issuingCountry}
        onChange={handleInputChange}
        placeholder="Enter Issuing Country"
        required={true}
        errorMessage={getFieldError("issuingCountry")}
      />
      <Input
        type="date"
        name="issueDate"
        label="Issue Date"
        value={formData.issueDate}
        onChange={handleInputChange}
        placeholder="Enter Issue Date"
        required={true}
        errorMessage={getFieldError("issueDate")}
        description={"Enter Issue Date"}
      />
      <Input
        type="date"
        name="expirationDate"
        label="Expiration Date"
        value={formData.expirationDate}
        onChange={handleInputChange}
        placeholder="Enter Expiration Date"
        required={true}
        errorMessage={getFieldError("expirationDate")}
        description={"Enter Expiration Date"}
      />
      <Input
        type="text"
        name="fullNameAsOnID"
        label="Full Name as on ID"
        value={formData.fullNameAsOnID}
        onChange={handleInputChange}
        placeholder="Enter Full Name as on ID"
        required={true}
        errorMessage={getFieldError("fullNameAsOnID")}
      />
      <Input
        type="text"
        name="addressAsOnID"
        label="Address as on ID"
        value={formData.addressAsOnID}
        onChange={handleInputChange}
        placeholder="Enter Address as on ID"
        required={false}
        errorMessage={getFieldError("addressAsOnID")}
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

export default IdentificationForm;
