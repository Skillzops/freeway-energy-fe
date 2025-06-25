import React from "react";
import curvedlines from "@/assets/sales/curvedlines.png";
import skewedsettings from "@/assets/sales/skewedsettings.svg";
import { MdCancel } from "react-icons/md";

interface SecondaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  description?: string;
  backgroundImage?: string;
  headerIcon?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  height?: string;
  descriptionClassName?: string;
  isRoundedFull?: boolean;
}

const SecondaryModal: React.FC<SecondaryModalProps> = ({
  isOpen,
  onClose,
  description,
  backgroundImage = curvedlines,
  headerIcon,
  children,
  width = "w-96",
  height = "min-h-[500px]",
  descriptionClassName = "",
  isRoundedFull = true,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity bg-black opacity-50"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div
          className={`space-y-3 bg-white px-5 py-4 rounded-[20px] shadow-menuCustom ${width} ${height} relative`}
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex items-start justify-between w-full">
            {headerIcon ? (
              headerIcon
            ) : (
              <img src={skewedsettings} alt="Skewed settings" width="45px" />
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full top-4 right-4 hover:bg-slate-100"
              aria-label="Close modal"
              title="Close modal"
            >
              <MdCancel className="text-error" />
            </button>
          </div>
          {description && (
            <p
              className={`bg-[#FEF5DA] w-full px-2 py-1 text-textGrey text-xs italic font-medium ${
                isRoundedFull ? "rounded-md" : "rounded-full"
              } ${descriptionClassName}`}
            >
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </>
  );
};

export default SecondaryModal;
