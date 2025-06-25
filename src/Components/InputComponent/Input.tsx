import { ChangeEvent, ReactNode, useEffect, useRef, forwardRef } from "react";
import { CgChevronDown } from "react-icons/cg";
import { useState } from "react";
import { LuImagePlus } from "react-icons/lu";
import useBreakpoint from "@/hooks/useBreakpoint";
import { IoIosSwap } from "react-icons/io";

export const Asterik = () => {
  return (
    <span className="mb-1.5">
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.51025 6.444L2.54225 4.588L0.86225 5.628L0.09425 4.428L1.90225 3.372L0.09425 2.3L0.87825 1.116L2.54225 2.172L2.51025 0.299999H3.93425L3.90225 2.156L5.56625 1.116L6.35025 2.3L4.54225 3.372L6.35025 4.428L5.55025 5.628L3.90225 4.604L3.93425 6.444H2.51025Z"
          fill="#FF0707"
        />
      </svg>
    </span>
  );
};

type AllowedInputTypes =
  | "text"
  | "number"
  | "password"
  | "email"
  | "tel"
  | "date"
  | "search"
  | "url"
  | "file"
  | "hidden"
  | "radio"
  | "checkbox"
  | "reset";

export type InputType = {
  type: AllowedInputTypes;
  name: string;
  label: string;
  value: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onClick?: (event?: any) => void;
  onBlur?: (event?: any) => void;
  disabled?: boolean;
  required: boolean;
  checked?: boolean;
  readOnly?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  style?: string;
  className?: string;
  errorMessage?: string;
  errorClass?: string;
  maxLength?: number;
  description?: string;
  descriptionClass?: string;
  max?: number;
};

export const Input = forwardRef<HTMLInputElement, InputType>(
  (
    {
      type = "text",
      name,
      label,
      value,
      onChange,
      placeholder = "Enter your firstname",
      onClick,
      onBlur,
      disabled = false,
      required = false,
      checked,
      readOnly = false,
      iconLeft,
      iconRight,
      style,
      className,
      errorMessage,
      errorClass,
      maxLength,
      description,
      descriptionClass,
      max,
    },
    ref
  ) => {
    const similarTypes = [
      "text",
      "number",
      "email",
      "password",
      "search",
      "hidden",
      "tel",
      "url",
      "date",
      "file",
    ];

    if (similarTypes.includes(type)) {
      return (
        <div className={`w-full ${className}`}>
          <div
            className={`relative autofill-parent ${
              type === "hidden" ? "hidden" : "flex"
            } ${style ? style : "max-w-full"} ${
              disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"
            }
        ${value ? "border-strokeCream" : "border-strokeGrey"}
          items-center w-full  px-[1.1em] py-[1.25em] gap-1 rounded-3xl h-[48px] border-[0.6px]
          transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
            onClick={onClick}
          >
            <span
              className={`absolute flex -top-2 items-center justify-center text-[10px] text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px] transition-opacity duration-500 ease-in-out
            ${value ? "opacity-100" : "opacity-0"}
            `}
            >
              {label.toUpperCase()}
            </span>

            {iconLeft && iconLeft}

            {required && <Asterik />}

            <input
              ref={ref}
              type={type}
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              onClick={onClick}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              checked={checked}
              readOnly={readOnly}
              min={0}
              className={`w-full text-sm font-semibold ${
                value ? "text-textBlack" : "text-textGrey"
              } placeholder:text-textGrey placeholder:font-normal placeholder:italic`}
              maxLength={maxLength}
              max={max}
            />

            {iconRight && iconRight}
          </div>
          {description && (
            <p
              className={`mt-1 px-[1.3em] text-xs text-textDarkGrey font-semibold w-full ${descriptionClass}`}
            >
              {description}
            </p>
          )}
          {errorMessage && (
            <p
              className={`mt-1 px-[1.3em] text-xs text-errorTwo font-semibold w-full ${errorClass}`}
            >
              {errorMessage}
            </p>
          )}
        </div>
      );
    } else {
      return "Input Type Not Allowed";
    }
  }
);

Input.displayName = "Input";

export const SmallInput = ({
  type = "text",
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
  disabled = false,
  checked,
  readOnly = false,
  className = "",
  errorMessage,
}: {
  type: AllowedInputTypes;
  name: string;
  value?: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  checked?: boolean;
  readOnly?: boolean;
  className?: string;
  errorMessage?: string;
}) => {
  const mobileStyle = useBreakpoint("max", 500);
  return (
    <div className={`${!mobileStyle ? "w-full max-w-[160px]" : "w-max"}`}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        checked={checked}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`px-2 py-1 w-full border-[0.6px] border-strokeGreyThree rounded-full ${className}`}
      />
      {errorMessage && (
        <p className="mt-0.5 px-2 text-[11px] text-errorTwo font-semibold w-full">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export const SmallSelectInput = ({
  name,
  value,
  options,
  onChange,
  required = false,
  placeholder = "Select an option",
  className = "",
  errorMessage,
}: {
  name: string;
  value: string | number;
  options: { label: string; value: string }[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  errorMessage?: string;
}) => {
  const mobileStyle = useBreakpoint("max", 500);
  return (
    <div className={`${!mobileStyle ? "w-full max-w-[160px]" : "w-max"}`}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`px-2 py-1 w-full border-[0.6px] border-strokeGreyThree rounded-full ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option: any) => (
          <option
            key={option.value}
            value={option.value}
            className="w-full capitalize"
          >
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage && (
        <p className="mt-0.5 px-2 text-[11px] text-errorTwo font-semibold w-full">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

type ModalInputType = {
  type: string;
  name: string;
  label: string;
  value?: any[];
  placeholder: string;
  onClick: () => void;
  disabled?: boolean;
  required?: boolean;
  style?: string;
  errorMessage?: string;
  isItemsSelected?: boolean;
  itemsSelected: ReactNode;
  customSelectedText?: string;
};

export const ModalInput = ({
  type = "text",
  label,
  placeholder = "Enter your firstname",
  onClick,
  disabled = false,
  required = false,
  style,
  errorMessage,
  isItemsSelected,
  itemsSelected,
  customSelectedText,
}: ModalInputType) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 w-full">
        <div
          className={`flex relative ${
            isItemsSelected
              ? "flex-col rounded-[20px] border-strokeCream"
              : "flex-row rounded-3xl h-[48px] border-strokeGrey"
          } items-center gap-[4px] ${style} ${
            disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"
          }  w-full max-w-full py-[1.25em] border-[0.6px] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent `}
        >
          {isItemsSelected && (
            <span className="absolute flex left-[1.6em] -top-2 z-40 items-center justify-center text-[10px] text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px] transition-opacity duration-500 ease-in-out opacity-100">
              {label.toUpperCase()}
            </span>
          )}

          <div
            className={`flex items-center pl-[1.1em] ${
              isItemsSelected ? "w-full" : "w-max"
            }`}
          >
            {isItemsSelected ? (
              <button
                type="button"
                className="flex items-center justify-center w-max gap-1 bg-white text-xs px-2 py-1 text-textDarkGrey font-medium border border-strokeGreyTwo rounded-full hover:text-textBlack hover:border-textBlack transition-all"
                onClick={onClick}
              >
                {customSelectedText
                  ? customSelectedText
                  : `Change ${label.toLowerCase()} selected`}
                <IoIosSwap />
              </button>
            ) : (
              required && <Asterik />
            )}
          </div>

          {isItemsSelected ? (
            <div
              className={`flex flex-col items-center justify-start not-italic text-textBlack w-full px-[1.1em] py-2 max-h-[550px] overflow-y-auto
            ${isItemsSelected ? "opacity-100" : "opacity-0"}
          
          `}
            >
              {itemsSelected}
            </div>
          ) : type === "button" ? (
            <span
              className="w-full text-sm text-textGrey italic cursor-pointer"
              onClick={onClick}
            >
              {placeholder}
            </span>
          ) : null}
        </div>
      </div>
      {errorMessage && (
        <p className="mt-1 px-[1.3em] text-xs text-errorTwo font-semibold w-full">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export type FileInputType = {
  name: string;
  label: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required: boolean;
  iconRight?: ReactNode;
  style?: string;
  accept?: string;
  errorMessage?: string;
  description?: string;
  descriptionClass?: string;
};

export const FileInput = ({
  name,
  label,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  iconRight,
  style,
  accept = "*/*",
  errorMessage,
  description = "",
  descriptionClass,
}: FileInputType) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Simply set the selected file and pass it to the parent via onChange
      setSelectedFile(file);
      onChange({
        target: {
          name,
          files: e.target.files, // Pass the file to parent
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const openFile = () => {
    return (document.getElementById(name) as HTMLInputElement).click();
  };

  return (
    <div className="w-full">
      <div
        className={`relative autofill-parent flex
          ${style} 
          ${selectedFile ? "border-strokeCream" : "border-strokeGrey"}
          ${disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"}
          items-center w-full max-w-full h-[48px] px-[1.1em] py-[1.25em] 
          gap-1 rounded-3xl border-[0.6px] cursor-pointer
          transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
        onClick={openFile}
      >
        <span
          className={`absolute flex -top-2 items-center justify-center text-[10px] text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px] transition-opacity duration-500 ease-in-out
            ${selectedFile ? "opacity-100" : "opacity-0"}
          `}
        >
          {label.toUpperCase()}
        </span>
        {required && <Asterik />}

        {/* Hidden file input */}
        <input
          type="file"
          id={name}
          name={name}
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: "none" }}
          accept={accept}
        />
        {/* Custom button to trigger file input */}
        <div className="flex items-center justify-between w-full">
          <>
            <button
              type="button"
              disabled={disabled}
              className="text-sm text-textGrey italic truncate"
            >
              {selectedFile ? (
                <span className="text-sm not-italic font-semibold text-textBlack">
                  {selectedFile.name}
                </span>
              ) : (
                placeholder
              )}
            </button>
          </>

          <span>
            {iconRight ? (
              iconRight
            ) : (
              <LuImagePlus color="black" title="Upload Image" />
            )}
          </span>
        </div>
      </div>
      {description && (
        <p
          className={`mt-1 px-[1.3em] text-xs text-textDarkGrey font-semibold w-full ${descriptionClass}`}
        >
          {description}
        </p>
      )}
      {errorMessage && (
        <p className="mt-1 px-[1.3em] text-xs text-errorTwo font-semibold w-full">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export const SmallFileInput = ({
  name,
  onChange,
  placeholder,
  iconRight,
  required,
}: {
  name: string;
  onChange: (e: any) => void;
  placeholder: string;
  iconRight?: ReactNode;
  required?: boolean;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      onChange(e);
    }
  };

  const openFile = () => {
    return (document.getElementById(name) as HTMLInputElement).click();
  };

  return (
    <div className="px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full">
      {/* Hidden file input */}
      <input
        type="file"
        id={name}
        name={name}
        onChange={handleFileChange}
        style={{ display: "none" }}
        required={required}
      />
      {/* Custom button to trigger file input */}
      <div className="flex items-center justify-between w-full">
        <>
          <button type="button" onClick={openFile}>
            {selectedFile ? (
              <span className="text-xs text-textDarkGrey">
                {selectedFile.name}
              </span>
            ) : (
              <span className="text-xs text-textBlack text-ellipsis">
                {placeholder}
              </span>
            )}
          </button>
        </>

        <span onClick={openFile} className="cursor-pointer">
          {iconRight && iconRight}
        </span>
      </div>
    </div>
  );
};

export type RadioOption = {
  label: string;
  value: string;
  bgColour?: string;
  color?: string;
};

export type RadioInputType = {
  name: string;
  value?: string | string[];
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  radioOptions: RadioOption[];
  radioLayout?: "row" | "column";
  radioParentStyle?: string;
  radioSelectedStyle?: string;
  className?: string;
  radioLabelStyle?: string;
  selectMultiple?: boolean;
};

export const RadioInput = ({
  name,
  value,
  onChange,
  required = false,
  radioOptions,
  radioLayout = "row",
  radioParentStyle,
  radioSelectedStyle,
  className,
  radioLabelStyle,
  selectMultiple = false,
}: RadioInputType) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(value) ? value : value ? [value] : []
  );

  const handleSingleChange = (value: string) => {
    const event = {
      target: {
        value: value,
        name,
        type: "radio",
      },
    } as ChangeEvent<HTMLInputElement>;
    setSelectedValues([value]); // Only one value for single selection
    onChange(event); // Pass the event to the onChange handler
  };

  const handleMultipleChange = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((selected) => selected !== value) // Deselect if already selected
      : [...selectedValues, value]; // Add to selected values

    setSelectedValues(newSelectedValues); // Update the state with selected values

    // Trigger the onChange event without constructing a full ChangeEvent object
    const event = {
      target: {
        value: newSelectedValues,
        name,
        type: "checkbox", // Use "checkbox" for multi-selection
      },
    } as unknown as ChangeEvent<HTMLInputElement>;
    onChange(event); // Pass the event to the onChange handler
  };

  const handleChange = (value: string) => {
    if (selectMultiple) {
      handleMultipleChange(value);
    } else {
      handleSingleChange(value);
    }
  };

  return (
    <>
      <div
        className={`flex 
        ${radioParentStyle}
        ${radioLayout === "row" ? "flex-row" : "flex-col"} gap-2`}
      >
        {radioOptions.map((option, index) => (
          <label
            key={option.value}
            htmlFor={`${name}-${index}`}
            className={`flex items-center justify-center bg-white w-max max-w-[400px]  
            gap-3 rounded-3xl text-base text-center text-textGrey font-semibold transition-all
            border border-strokeGreyTwo cursor-pointer ${
              className ? className : "h-[35px] px-[1em] py-[0.2em]"
            }
            ${
              selectedValues.includes(option.value)
                ? `${radioSelectedStyle} bg-primaryGradient text-white`
                : ""
            }`}
          >
            <input
              type={selectMultiple ? "checkbox" : "radio"}
              id={`${name}-${index}`}
              name={name}
              value={option.value}
              onChange={() => handleChange(option.value)}
              required={required && !selectMultiple} // Required only for single selection
              className="hidden"
            />
            <span
              className={`flex items-center justify-center ${radioLabelStyle}`}
              style={{ backgroundColor: option.bgColour, color: option.color }}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </>
  );
};

export type SelectOption = {
  label: string | any;
  value: string | any;
};

export type SelectInputType = {
  label: string;
  options: SelectOption[];
  value: string | string[];
  onChange: (values: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  style?: string;
  icon?: ReactNode;
  iconStyle?: string;
  iconPosition?: "left" | "right";
  errorMessage?: string;
};

export const SelectInput = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  style,
  icon = <CgChevronDown color="black" title="Show options" />,
  iconStyle = "text-lg",
  errorMessage,
}: SelectInputType) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [valueLabel, setValueLabel] = useState<string | number>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the label corresponding to the initial value
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      setValueLabel(selectedOption.label);
    }
  }, [value, options]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
    } else {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
    };
  }, [isOpen]);

  return (
    <div className="w-full">
      <div ref={dropdownRef} className={`relative w-full max-w-full`}>
        <div
          className={`relative flex items-center
            w-full max-w-full h-[48px] px-[1.25em] py-[1.25em] 
            rounded-3xl text-sm text-textGrey border-[0.6px] gap-1 cursor-pointer
            transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"}
            ${value ? "border-strokeCream" : "border-strokeGrey"}
            ${style}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span
            className={`absolute flex -top-2 items-center justify-center text-[10px] text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px] transition-opacity duration-500 ease-in-out
              ${value ? "opacity-100" : "opacity-0"}`}
          >
            {label.toUpperCase()}
          </span>
          {required && <Asterik />}

          <div className="w-full">
            {value ? (
              <span className="font-semibold text-textBlack uppercase">
                {valueLabel}
              </span>
            ) : (
              <span className="text-textGrey italic">{placeholder}</span>
            )}
          </div>

          <span className={`${iconStyle} absolute right-3 p-[0.3em]`}>
            {icon}
          </span>
        </div>
        {isOpen && (
          <div className="absolute mt-1.5 flex flex-col gap-1 bg-white p-2 border border-strokeGreyTwo rounded-[20px] w-full max-h-60 overflow-y-auto shadow-lg z-50">
            {options?.map((option) => (
              <div
                key={option.value}
                className="text-xs capitalize text-textDarkGrey cursor-pointer px-2 py-1 border border-transparent hover:bg-[#F6F8FA] hover:border hover:border-strokeGreyTwo hover:rounded-full"
                onClick={() => {
                  handleSelect(option.value);
                  setValueLabel(option.label);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {errorMessage && (
        <p className="mt-1 px-[1.3em] text-xs text-errorTwo font-semibold w-full">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export type MultipleSelectInputType = {
  label: string;
  options: SelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  style?: string;
  icon?: ReactNode;
  iconStyle?: string;
  errorMessage?: string;
};

export const SelectMultipleInput = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select options",
  disabled = false,
  required = false,
  style,
  icon = <CgChevronDown />,
  iconStyle = "text-lg",
  errorMessage,
}: MultipleSelectInputType) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCheckboxChange = (optionValue: string) => {
    const updatedValue = value.includes(optionValue)
      ? value.filter((val) => val !== optionValue)
      : [...value, optionValue];
    onChange(updatedValue);
  };

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
    } else {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
    };
  }, [isOpen]);

  return (
    <div className="w-full">
      <div ref={dropdownRef} className={`relative w-full max-w-full `}>
        <div
          className={`relative flex items-center justify-between 
          ${style}
          ${value ? "border-strokeCream" : "border-strokeGrey"}
          ${disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"} 
          w-full h-[48px] px-[1.3em] py-[1em] cursor-pointer
          rounded-3xl text-sm text-textGrey border-[0.6px] gap-[4.23px]
          transition-all focus:outline-none focus:ring-2 focus:ring-primary`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span
            className={`absolute flex -top-2 items-center justify-center text-[10px] text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px] 
            transition-opacity duration-500 ease-in-out
            ${value.length > 0 ? "opacity-100" : "opacity-0"}`}
          >
            {label.toUpperCase()}
          </span>

          {required && <Asterik />}

          <div className="w-full">
            {value.length > 0 ? (
              <span className="font-semibold text-textBlack">
                {value.length} selected
              </span>
            ) : (
              <span className="text-textGrey italic">{placeholder}</span>
            )}
          </div>
          <span className={`${iconStyle}`}>{icon}</span>
        </div>

        {isOpen && (
          <div className="absolute mt-1.5 flex flex-col gap-0 bg-white p-2 border border-strokeGreyTwo rounded-[20px] w-full max-h-60 overflow-y-auto shadow-lg z-10">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center text-xs capitalize text-textDarkGrey cursor-pointer px-2 py-1 border border-transparent hover:bg-[#F6F8FA] hover:border hover:border-strokeGreyTwo hover:rounded-full"
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={value.includes(option.value)}
                  onChange={() => handleCheckboxChange(option.value)}
                  className="mr-2 w-3 h-3"
                />
                {option.label}
              </label>
            ))}
          </div>
        )}
      </div>
      {errorMessage && (
        <p className="mt-1 px-[1.3em] text-xs text-errorTwo font-semibold w-full">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export type ToggleInputType = {
  onChange: (checked: boolean) => void;
  defaultChecked?: boolean;
  disabled?: boolean;
};

export const ToggleInput = ({
  onChange,
  defaultChecked = false,
  disabled = false,
}: ToggleInputType) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleToggle = () => {
    if (!disabled) {
      setIsChecked((prev) => {
        const newChecked = !prev;
        onChange(newChecked);
        return newChecked;
      });
    }
  };

  return (
    <div
      className={`relative inline-block w-16 h-10 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={handleToggle}
    >
      <div
        className={`absolute inset-y-1 inset-x-1 rounded-full transition-colors duration-300 border-[0.4px] ${
          isChecked
            ? "bg-[#FFF3D5] border-[#A58730]"
            : "bg-[#F6F8FA] border-[#CCD0DC]"
        }`}
      ></div>
      <div
        className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${
          isChecked ? "transform translate-x-6 bg-[#A58730]" : "bg-[#CCD0DC]"
        }`}
      ></div>
    </div>
  );
};
