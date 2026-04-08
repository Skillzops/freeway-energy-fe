import React, { useRef, useState } from "react";
import { LuImagePlus } from "react-icons/lu";

interface UploadPhotoInputProps {
  label?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  onValidationError?: (message?: string) => void;
  errorMessage?: string;
  required?: boolean;
  accept?: string;
  maxSizeInMB?: number;
}

export const UploadPhotoInput: React.FC<UploadPhotoInputProps> = ({
  label = "Photograph",
  value,
  onChange,
  onValidationError,
  errorMessage,
  required: _required = false,
  accept = ".jpeg,.jpg,.png",
  maxSizeInMB = 1
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string>("");


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const max = maxSizeInMB ?? 1;
    const sizeMB = file.size / 1024 / 1024;
    const maxBytes = max * 1024 * 1024;
    setLocalError("");

    console.debug("UploadPhotoInput size check", {
      name: file.name,
      sizeBytes: file.size,
      sizeMB: sizeMB.toFixed(3),
      maxMB: max,
      maxBytes
    });

    // Check file size in MB before accepting
    if (file.size > maxBytes) {
      console.warn(`UploadPhotoInput: rejected file ${file.name} size ${sizeMB.toFixed(2)}MB > ${max}MB`);
      const msg = `File size must be <= ${max}MB (yours ~${sizeMB.toFixed(2)}MB)`;
      setLocalError(msg);
      onValidationError?.(msg);
      event.target.value = ""; // reset the input so the same file can be re-selected
      onChange(null); // clear parent state so filename is not shown
      return;
    }

    // Check file extension to match backend validation
    const allowedExtensions = ["jpeg", "jpg", "png"];
    const fileExtension = file.name.toLowerCase().split(".").pop();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      const msg = `File type not supported. Please use files with extensions: ${allowedExtensions.join(", ")}`;
      setLocalError(msg);
      onValidationError?.(msg);
      event.target.value = "";
      onChange(null);
      return;
    }

    onValidationError?.(undefined);
    onChange(file);
  };

  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between w-full h-[48px] px-[1.1em] bg-white border border-strokeGreyThree rounded-3xl cursor-pointer transition-colors hover:border-gold"
        onClick={() => fileInputRef.current?.click()}>

        <span className="text-sm text-textLightGrey font-normal italic">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {value && !localError ?
          <span className="text-sm text-textGrey truncate max-w-[120px]">{value.name}</span> :
          null}
          <LuImagePlus className="w-6 h-6 text-textLightGrey" />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange} />

      </div>
      {(errorMessage || localError) &&
      <p className="text-xs text-red-500 mt-1">{errorMessage || localError}</p>
      }
    </div>);

};
