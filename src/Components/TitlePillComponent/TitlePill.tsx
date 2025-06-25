import { formatNumberWithCommas } from "@/utils/helpers";
import { ReactNode } from "react";

export type TitlePillType = {
  parentClass?: string;
  icon: string;
  iconBgColor: string;
  topText: string;
  bottomText: string;
  leftIcon?: ReactNode;
  value: number | string;
};

export const TitlePill = (props: TitlePillType) => {
  const {
    parentClass,
    icon,
    iconBgColor,
    topText,
    bottomText,
    leftIcon,
    value,
  } = props;

  return (
    <div
      className={`${parentClass} flex items-center justify-between gap-6 bg-white h-[40px] pl-1 pr-[20px] py-1 border-[0.6px] border-[#A5873033] rounded-full shadow-titlePillCustom`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center w-[32px] h-[32px] rounded-full ${iconBgColor}`}
        >
          <img src={icon} alt="Pill Icon" className="w-[20px] h-[20px]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] leading-3 text-textDarkGrey font-semibold">
            {topText}
          </p>
          <p className="text-sm leading-3 text-textGrey">{bottomText}</p>
        </div>
      </div>
      <div className="flex items-center justify-end w-max gap-1">
        {leftIcon && leftIcon}
        <p className="text-xl font-medium text-textBlack">
          {typeof value === "number" && !isNaN(value)
            ? formatNumberWithCommas(value)
            : value}
        </p>
      </div>
    </div>
  );
};
