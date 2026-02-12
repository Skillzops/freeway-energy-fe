import React, { useEffect, useState, useCallback } from "react";
import { MdCancel } from "react-icons/md";
import clsx from "clsx";

export type ModalType = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  layout?: "right" | "default" | "center";
  bodyStyle?: string;
  headerClass?: string;
  leftHeaderContainerClass?: string;
  leftHeaderComponents?: React.ReactNode;
  rightHeaderContainerClass?: string;
  rightHeaderComponents?: React.ReactNode;
};

export const Modal = ({
  isOpen,
  onClose,
  children,
  size = "medium",
  layout = "default",
  bodyStyle,
  headerClass,
  leftHeaderContainerClass,
  leftHeaderComponents,
  rightHeaderContainerClass,
  rightHeaderComponents,
}: ModalType) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(
        () => {
          setIsClosing(false);
          onClose();
        },
        layout === "right" ? 250 : 0
      );
    }
  }, [isOpen, layout, onClose]);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  // Modal size mapping
  const sizeClasses = {
    small: "w-[90vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw] max-w-[360px]",
    medium: "w-[95vw] sm:w-[70vw] md:w-[60vw] lg:w-[50vw] xl:w-[42vw] max-w-[530px]",
    large: "w-[100vw] sm:w-[92vw] md:w-[80vw] lg:w-[72vw] xl:w-[60vw] max-w-[820px]",
  };

  // Conditional layout styles
  const layoutClasses = clsx(
    layout === "right" &&
      "relative z-50 h-[100vh] mt-2 mr-1.5 bg-white shadow-lg transition-transform transform rounded-md",
    layout === "center" &&
      "relative z-50 bg-white shadow-lg rounded-2xl transition-transform transform",
    sizeClasses[size],
    {
      "animate-slide-out-right": isClosing,
      "animate-slide-in-right": !isClosing && layout === "right",
      "translate-x-full": !isClosing && layout === "right",
      "-translate-y-full mt-2": layout === "default",
    }
  );

  const wrapperClasses = clsx(
    layout === "right"
      ? "fixed inset-0 z-50 flex items-center justify-end"
      : layout === "center"
        ? "fixed inset-0 z-50 flex items-center justify-center"
        : "relative inline-block"
  );

  return (
    <div className={wrapperClasses}>
      <div
        className="fixed inset-0 z-40 transition-opacity bg-black opacity-50"
        onClick={handleClose}
        aria-hidden="true"
      ></div>

      {layout === "right" ? (
        <div className={layoutClasses} role="dialog" aria-modal="true">
          <header
            className={`flex items-center p-2 h-[40px] border-b-[0.6px] border-b-strokeGreyThree ${
              leftHeaderComponents ? "justify-between" : "justify-end"
            } ${headerClass}`}
          >
            <div
              className={`flex ${
                leftHeaderContainerClass
                  ? leftHeaderContainerClass
                  : "items-center gap-1"
              }`}
            >
              {leftHeaderComponents}
            </div>
            <div
              className={`flex ${
                rightHeaderContainerClass
                  ? rightHeaderContainerClass
                  : "items-center gap-1 "
              }`}
            >
              {rightHeaderComponents}
              <button
                onClick={handleClose}
                className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full top-4 right-4 hover:bg-slate-100"
                aria-label="Close modal"
                title="Close modal"
              >
                <MdCancel className="text-error" />
              </button>
            </div>
          </header>

          <section className={`${bodyStyle} h-full overflow-auto`}>
            {children}
          </section>
        </div>
      ) : layout === "center" ? (
        <div className={layoutClasses} role="dialog" aria-modal="true">
          {children}
        </div>
      ) : (
        <section className={`${bodyStyle} h-full overflow-auto`}>
          {children}
        </section>
      )}
    </div>
  );
};
