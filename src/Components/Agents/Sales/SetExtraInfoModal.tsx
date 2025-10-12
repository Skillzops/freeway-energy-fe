import React, { useState } from "react";
import curvedlines from "@/assets/sales/curvedlines.png";
import skewedsettings from "@/assets/sales/skewedsettings.svg";
import { ExtraInfoType } from "./CreateNewSale";
import { MdCancel } from "react-icons/md";
import ParametersForm from "./ParametersForm";
import MiscellaneousForm from "./MiscellaneousForm";
import UploadDevicesForm from "./UploadDevicesForm";
import IdentificationForm from "./IdentificationForm";
import NextOfKinForm from "./NextOfKin";
import GuarantorForm from "./GuarantorForm";
import { observer } from "mobx-react-lite";
import SaleRecipientForm from "./SaleRecipientForm";

const SetExtraInfoModal = observer(
  ({
    extraInfoModal,
    setExtraInfoModal,
    currentProductId,
  }: {
    extraInfoModal: ExtraInfoType;
    setExtraInfoModal: React.Dispatch<React.SetStateAction<ExtraInfoType>>;
    currentProductId: string;
  }) => {
    const descriptionText =
      extraInfoModal === "parameters"
        ? "Please select parameters for this product."
        : extraInfoModal === "miscellaneous"
        ? "Type the title of the Miscellaneous on the left and the Amount on the right. You can add another cost by clicking the add button bellow."
        : extraInfoModal === "devices"
        ? "Link Device(s)"
        : extraInfoModal === "recipient"
        ? "Fill Sale Recipient"
        : extraInfoModal === "identification"
        ? "Fill Identification Details"
        : extraInfoModal === "nextOfKin"
        ? "Fill Next of Kin Details"
        : "Fill Guarantor Details";

    const [description, setDescription] = useState<string>(descriptionText);
    const handleClose = () => {
      setExtraInfoModal("");
    };

    const renderModalContent = () => {
      switch (extraInfoModal) {
        case "parameters":
          return (
            <ParametersForm
              handleClose={handleClose}
              currentProductId={currentProductId}
            />
          );
        case "miscellaneous":
          return (
            <MiscellaneousForm
              handleClose={handleClose}
              currentProductId={currentProductId}
            />
          );
        case "devices":
          return (
            <UploadDevicesForm
              handleClose={handleClose}
              setDescription={setDescription}
              currentProductId={currentProductId}
            />
          );
        case "recipient":
          return (
            <SaleRecipientForm
              handleClose={handleClose}
              currentProductId={currentProductId}
            />
          );
        case "identification":
          return <IdentificationForm handleClose={handleClose} />;
        case "nextOfKin":
          return <NextOfKinForm handleClose={handleClose} />;
        case "guarantor":
          return <GuarantorForm handleClose={handleClose} />;
        default:
          return null;
      }
    };

    return (
      <>
        <div
          className="fixed inset-0 z-40 transition-opacity bg-black opacity-50"
          onClick={handleClose}
          aria-hidden="true"
        ></div>

        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div
            className="space-y-3 bg-white px-5 py-4 rounded-[20px] shadow-menuCustom w-96 min-h-[500px] relative"
            style={{
              backgroundImage: `url(${curvedlines})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex items-start justify-between w-full">
              <img src={skewedsettings} alt="Skewed settings" width="45px" />
              <button
                onClick={handleClose}
                className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full top-4 right-4 hover:bg-slate-100"
                aria-label="Close modal"
                title="Close modal"
              >
                <MdCancel className="text-error" />
              </button>
            </div>
            <p
              className={`bg-[#FEF5DA] w-full px-2 py-1 text-textGrey text-xs italic font-medium ${
                extraInfoModal === "miscellaneous"
                  ? "rounded-md"
                  : "rounded-full"
              }`}
            >
              {description}
            </p>
            {renderModalContent()}
          </div>
        </div>
      </>
    );
  }
);

export default SetExtraInfoModal;
