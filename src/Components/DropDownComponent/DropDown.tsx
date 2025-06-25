import { useState } from "react";
import drop from "../../assets/table/dropdown.svg";
import dateIcon from "../../assets/table/date.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Icon } from "../Settings/UserModal";
import edit from "../../assets/edit.svg";
import { Modal } from "@/Components/ModalComponent/Modal";

export type DropDownType = {
  name?: string;
  items?: string[];
  onClickLink?: (index: number, cardData?: any) => void;
  buttonImgStyle?: string;
  dropDownContainerStyle?: string;
  isSearch?: boolean;
  isDate?: boolean;
  onDateClick?: (date: string) => void;
  showCustomButton?: boolean;
  disabled?: boolean[];
  defaultStyle?: boolean;
  cardData?: any;
};

export const DropDown = (props: DropDownType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showIcon, setShowIcon] = useState<number | null>();

  const {
    name,
    items,
    onClickLink,
    buttonImgStyle,
    dropDownContainerStyle,
    isDate,
    onDateClick,
    showCustomButton = false,
    disabled = items?.map(() => false) || [],
    defaultStyle,
    cardData,
  } = props;

  const handleClick = () => {
    if (isDate) {
      setIsOpen(true);
    } else {
      setIsOpen(true);
    }
  };

  const handleOptionClick = (index: number, cardData?: any) => {
    // Prevent clicks if the item is disabled
    if (disabled[index]) return;
    if (onClickLink) onClickLink(index, cardData);
    setIsOpen(false);
  };

  const handleDateChange = (date: Date | null) => {
    if (date && onDateClick) {
      setSelectedDate(date);
      onDateClick(date.toISOString());
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex w-max">
      {showCustomButton ? (
        <div onClick={handleClick} className="w-max">
          <Icon icon={edit} />
        </div>
      ) : (
        <button
          className="flex items-center justify-between w-max gap-2 pl-2 pr-1 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full"
          onClick={handleClick}
        >
          <span className="text-xs font-medium text-textGrey">
            {isDate && selectedDate
              ? selectedDate.toLocaleDateString("default", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : name}
          </span>
          <img
            src={isDate ? dateIcon : drop}
            alt="DropdownIcon"
            className={`w-4 h-4 ${buttonImgStyle || ""}`}
          />
        </button>
      )}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setShowIcon(null);
        }}
      >
        {isDate ? (
          <div className="absolute top-[35px] right-0 z-50">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              inline
            />
          </div>
        ) : (
          <ul
            className={`${dropDownContainerStyle} absolute top-[35px] right-0 z-[1000] flex flex-col gap-0.5 p-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] shadow-lg w-[200px]`}
          >
            {items?.map((item, index) => (
              <li
                key={index}
                className={`flex items-center justify-between h-max px-2 py-1 text-xs rounded-full border-[0.4px] border-transparent
                ${
                  disabled[index]
                    ? "cursor-not-allowed text-gray-400 bg-gray-100"
                    : index === showIcon && !defaultStyle
                    ? "cursor-pointer bg-paleLightBlue text-textBlack"
                    : "cursor-pointer hover:bg-gray-100 text-textDarkGrey hover:border-strokeGreyTwo"
                }`}
                onClick={() => handleOptionClick(index, cardData)}
                onMouseEnter={() => !disabled[index] && setShowIcon(index)}
                onMouseLeave={() => setShowIcon(null)}
              >
                {item}
                {index === showIcon && !defaultStyle && !disabled[index] ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.3292 4.6233C10.5372 4.80491 10.5586 5.12077 10.377 5.32879L5.1389 11.3288C5.04394 11.4376 4.90661 11.5 4.76224 11.5C4.61786 11.5 4.48053 11.4376 4.38558 11.3288L2.29034 8.92879C2.10873 8.72077 2.13015 8.40491 2.33817 8.2233C2.54619 8.0417 2.86205 8.06311 3.04366 8.27113L4.76224 10.2397L9.62367 4.67113C9.80528 4.46311 10.1211 4.4417 10.3292 4.6233Z"
                      fill="#66C95B"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13.6786 4.6796C13.8786 4.87004 13.8863 5.18653 13.6959 5.38649L7.9814 11.3865C7.88041 11.4925 7.73801 11.549 7.5918 11.5409C7.44558 11.5328 7.31025 11.4611 7.22154 11.3446L6.93599 10.9696C6.7687 10.7499 6.81118 10.4362 7.03088 10.2689C7.21962 10.1251 7.47775 10.1362 7.65282 10.2815L12.9717 4.69683C13.1622 4.49686 13.4787 4.48915 13.6786 4.6796Z"
                      fill="#66C95B"
                    />
                  </svg>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
};
