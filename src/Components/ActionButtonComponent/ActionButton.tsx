import { BRAND_CONFIG } from "@/config/brandConfig";
import React, { ReactNode } from "react";

interface ActionButtonProps {
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  buttonClass?: string;
  labelClass?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  disabled = false,
  buttonClass = "",
  labelClass = "",
}) => {
  const COLOR = BRAND_CONFIG.colors.legacy.brandPrimary
  const RING = "";
  const SHADOW = BRAND_CONFIG.colors.legacy.accent;

  const base =
    "flex items-center h-[32px] gap-1 px-3 py-1 rounded-full border transition-all select-none focus:outline-none";
  const stateClass = disabled
    ? "cursor-not-allowed"
    : "hover:brightness-110 active:brightness-95";

  return (
    <button
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${stateClass} ${buttonClass}`}
      style={{
        backgroundColor: disabled ? `${COLOR}66` : COLOR,
        borderColor: disabled ? `${COLOR}66` : COLOR,
        color: "#fff",
        boxShadow: disabled ? "none" : SHADOW,
        outline: "none",
      }}
      onFocus={(e) => {
        (e.currentTarget.style as any).boxShadow = disabled
          ? "none"
          : `${SHADOW}, 0 0 0 2px ${RING}`;
      }}
      onBlur={(e) => {
        (e.currentTarget.style as any).boxShadow = disabled ? "none" : SHADOW;
      }}
    >
      {icon ?? null}
      <span className={`${labelClass} text-[11px] font-medium leading-none`}>
        {label}
      </span>
    </button>
  );
};

export default ActionButton;
