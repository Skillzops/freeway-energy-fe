import type React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary";
type ButtonType = "button" | "submit" | "reset";
type ButtonSize = "default" | "sm" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  type?: ButtonType;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

const SecondaryButton: React.FC<ButtonProps> = ({
  variant = "primary",
  type = "button",
  size = "default",
  loading = false,
  loadingText,
  icon,
  iconPosition = "right",
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses = "font-medium rounded-full shadow-sm transition-all";

  // Size classes
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-5 py-3 min-w-[150px]",
    lg: "px-10 py-4 text-lg min-w-[180px]",
  };

  // Variant specific classes
  const variantClasses = {
    primary:
      "bg-primaryGradient text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-white text-textDarkGrey border-[0.6px] border-strokeGreyTwo hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  // Width classes
  const widthClasses = fullWidth ? "w-full" : "w-max";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        widthClasses,
        className
      )}
      {...props}
    >
      {icon && iconPosition === "left" && !loading && icon}

      <div className="flex items-center justify-center w-full gap-1.5">
        {loading ? (
          <>
            <span className="truncate">{loadingText}</span>
            <span className="dot-loader mt-1"></span>
          </>
        ) : (
          children
        )}
      </div>

      {icon && iconPosition === "right" && !loading && icon}
    </button>
  );
};

export default SecondaryButton;
