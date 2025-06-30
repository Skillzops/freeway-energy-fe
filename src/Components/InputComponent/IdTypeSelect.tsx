import React from "react";
import { SelectInput } from "./Input";

export const ID_TYPE_OPTIONS = [
  { label: "--", value: "" },
  { label: "NIN", value: "Nin" },
  { label: "Passport", value: "Passport" },
  { label: "Driver License", value: "Driver_License" },
  { label: "Voter ID", value: "Voter_ID" },
  { label: "Social Security Number", value: "Social_Security_Number" },
];

type IdTypeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  errorMessage?: string;
};

const IdTypeSelect: React.FC<IdTypeSelectProps> = ({
  value,
  onChange,
  required = false,
  errorMessage,
}) => (
  <SelectInput
    label="ID Type"
    options={ID_TYPE_OPTIONS}
    value={value}
    onChange={onChange}
    required={required}
    placeholder="Select ID Type"
    errorMessage={errorMessage}
  />
);

export default IdTypeSelect; 