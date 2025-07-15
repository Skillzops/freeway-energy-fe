import React, { useRef } from "react";
import { LuImagePlus } from "react-icons/lu";

interface UploadPhotoInputProps {
  label?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  errorMessage?: string;
  required?: boolean;
  accept?: string;
  maxSizeInMB?: number;
}

export const UploadPhotoInput: React.FC<UploadPhotoInputProps> = ({
  label = "Photograph",
  value,
  onChange,
  errorMessage,
  required = false,
  accept = ".jpeg,.jpg,.png,.svg",
  maxSizeInMB = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeInMB}MB`);
      return;
    }
    
    // Check file extension to match backend validation
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'svg'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert(`File type not supported. Please use files with extensions: ${allowedExtensions.join(', ')}`);
      return;
    }
    
    onChange(file);
  };

  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between w-full h-[48px] px-[1.1em] bg-white border border-strokeGreyThree rounded-3xl cursor-pointer transition-colors hover:border-gold"
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="text-sm text-textLightGrey font-normal italic">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {value ? (
            <span className="text-sm text-textGrey truncate max-w-[120px]">{value.name}</span>
          ) : null}
          <LuImagePlus className="w-6 h-6 text-textLightGrey" />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
      </div>
      {errorMessage && (
        <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}; 