import { useState } from "react";
import { Input } from "../InputComponent/Input";
import { z } from "zod";
import { nextOfKinDetailsSchema } from "./salesSchema";
import { SaleStore } from "@/stores/SaleStore";
import { formatDateForInput } from "@/utils/helpers";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { GooglePlacesInput } from "../InputComponent/GooglePlacesInput";

type FormData = z.infer<typeof nextOfKinDetailsSchema>;

const defaultFormData: FormData = {
  fullName: "",
  relationship: "",
  phoneNumber: "",
  email: "",
  homeAddress: "",
  dateOfBirth: "",
  nationality: "",
};

const NextOfKinForm = ({ handleClose }: { handleClose: () => void }) => {
  const savedData = SaleStore.nextOfKinDetails || defaultFormData;

  const [formData, setFormData] = useState<FormData>({
    ...savedData,
    dateOfBirth: formatDateForInput(savedData.dateOfBirth),
  });
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const validateItems = () => {
    const result = nextOfKinDetailsSchema.safeParse(formData);
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

  const isFormFilled = nextOfKinDetailsSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const saveForm = () => {
    if (!validateItems()) return;
    SaleStore.addNextOfKinDetails({
      ...formData,
      dateOfBirth: !formData.dateOfBirth
        ? ""
        : new Date(formData.dateOfBirth).toISOString(),
    });
    handleClose();
  };

  return (
    <div className="flex flex-col justify-between h-full max-h-[360px] py-4 pr-1 sm:pr-3 overflow-y-auto gap-4">
      <Input
        type="text"
        name="fullName"
        label="Full Name"
        value={formData.fullName}
        onChange={handleInputChange}
        placeholder="Enter Full Name"
        required={true}
        errorMessage={getFieldError("fullName")}
      />
      <Input
        type="text"
        name="relationship"
        label="Relationship"
        value={formData.relationship}
        onChange={handleInputChange}
        placeholder="Enter Relationship"
        required={true}
        errorMessage={getFieldError("relationship")}
      />
      <Input
        type="text"
        name="phoneNumber"
        label="Phone Number"
        value={formData.phoneNumber}
        onChange={handleInputChange}
        placeholder="Enter Phone Number"
        required={true}
        errorMessage={getFieldError("phoneNumber")}
      />
      <Input
        type="email"
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Enter Email"
        required={false}
        errorMessage={getFieldError("email")}
      />
      {/* <Input
        type="text"
        name="homeAddress"
        label="Home Address"
        value={formData.homeAddress}
        onChange={handleInputChange}
        placeholder="Enter Home Address"
        required={false}
        errorMessage={getFieldError("homeAddress")}
      /> */}
      <GooglePlacesInput
        type="text"
        name="homeAddress"
        label="Home Address"
        value={formData.homeAddress}
        placeholder="Search for a location"
        required={true}
        errorMessage={getFieldError("homeAddress")}
        onChange={(value, _place, coordinates) => {
          setFormData((prev) => ({
            ...prev,
            homeAddress: value,
            longitude: coordinates?.lng || "",
            latitude: coordinates?.lat || "",
          }));
        }}
      />
      <Input
        type="date"
        name="dateOfBirth"
        label="Date of Birth"
        value={formData.dateOfBirth || ""}
        onChange={handleInputChange}
        placeholder="Enter Date of Birth"
        required={true}
        errorMessage={getFieldError("dateOfBirth")}
        description={"Enter Date of Birth"}
      />
      <Input
        type="text"
        name="nationality"
        label="Nationality"
        value={formData.nationality}
        onChange={handleInputChange}
        placeholder="Enter Nationality"
        required={false}
        errorMessage={getFieldError("nationality")}
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

export default NextOfKinForm;
