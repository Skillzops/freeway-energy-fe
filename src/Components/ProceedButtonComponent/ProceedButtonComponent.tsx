import React, { useState } from "react";

interface ButtonProps {
  type?: "reset" | "submit" | "button";
  onClick?: (event?: any) => void;
  className?: string;
  variant?: "yellow" | "gray" | "gradient" | "red";
  loading?: boolean;
  disabled?: boolean;
}

const ProceedButton: React.FC<ButtonProps> = ({
  type,
  onClick,
  className,
  variant = "yellow",
  loading,
  disabled = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Define different styles for each variant
  const variantClasses = {
    yellow:
      "bg-[#FEF5DA] border border-[#A58730]/20 shadow-[2px_6px_8px_0px_rgba(0,0,0,0.15)] hover:bg-[#941C12] hover:border-[#63130C]/20",
    gray: "bg-[#E2E4EB] border border-[#9BA4BA]/20",
    gradient: "bg-[#FEF5DA] border border-[#A58730]/20 shadow-innerCustom",
    red: "bg-[#941C12] border border-[#63130C]/20",
  };

  return loading ? (
    <div className="flex items-center justify-center w-16 h-16">
      <div className="loaderTwo"></div>
    </div>
  ) : (
    <button
      onClick={onClick}
      type={type}
      className={`flex items-center justify-center w-16 h-16 rounded-full transition-all ${
        isHovered ? variantClasses.red : variantClasses[variant]
      } ${className} ${disabled ? "cursor-not-allowed opacity-75" : ""}`}
      disabled={disabled}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {variant !== "gradient" ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_48_2923)">
            <path
              d="M16 19C16 18.258 16.733 17.15 17.475 16.22C18.429 15.02 19.569 13.973 20.876 13.174C21.856 12.575 23.044 12 24 12M24 12C23.044 12 21.855 11.425 20.876 10.826C19.569 10.026 18.429 8.979 17.475 7.781C16.733 6.85 16 5.74 16 5M24 12H0"
              stroke={
                isHovered ? "white" : variant === "red" ? "white" : "#828DA9"
              }
              strokeWidth="1.33333"
            />
          </g>
          <defs>
            <clipPath id="clip0_48_2923">
              <rect
                width="24"
                height="24"
                fill="white"
                transform="matrix(-1 0 0 -1 24 24)"
              />
            </clipPath>
          </defs>
        </svg>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_51_2955)">
            <path
              d="M16 19C16 18.258 16.733 17.15 17.475 16.22C18.429 15.02 19.569 13.973 20.876 13.174C21.856 12.575 23.044 12 24 12M24 12C23.044 12 21.855 11.425 20.876 10.826C19.569 10.026 18.429 8.979 17.475 7.781C16.733 6.85 16 5.74 16 5M24 12H0"
              stroke={isHovered ? "white" : "url(#paint0_linear_51_2955)"}
              strokeWidth="1.33333"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_51_2955"
              x1="24"
              y1="12"
              x2="0"
              y2="12"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#982214" />
              <stop offset="1" stopColor="#F8CB48" />
            </linearGradient>
            <clipPath id="clip0_51_2955">
              <rect
                width="24"
                height="24"
                fill="white"
                transform="matrix(-1 0 0 -1 24 24)"
              />
            </clipPath>
          </defs>
        </svg>
      )}
    </button>
  );
};

export default ProceedButton;
