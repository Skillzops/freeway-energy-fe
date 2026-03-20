import { useEffect, useMemo, useRef, useState } from "react";
import drop from "../../assets/table/dropdown.svg";
import dateIcon from "../../assets/table/date.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Icon } from "../Settings/UserModal";
import edit from "../../assets/edit.svg";
import { formatDate } from "@/utils/helpers";

type SearchMode = "local" | "api";

export type DropDownType = {
  name?: string;
  items?: string[];
  onClickLink?: (index: number, cardData?: any) => void;
  buttonImgStyle?: string;
  dropDownContainerStyle?: string;
  containerClassName?: string;
  buttonClassName?: string;
  buttonLabelClassName?: string;
  title?: string;
  isSearch?: boolean;
  isDate?: boolean;
  isDateRange?: boolean;
  onDateClick?: (startDate: string, endDate?: string) => void;
  showCustomButton?: boolean;
  disabled?: boolean[];
  defaultStyle?: boolean;
  cardData?: any;
  searchable?: boolean;
  searchPlaceholder?: string;

  searchMode?: SearchMode; // default: "local"
  onDropdownSearch?: (keyword: string) => void; // used when searchMode === "api"
  debounceMs?: number; // default: 350
  showSearchIcon?: boolean; // optional
  isLoading?: boolean;
  menuAlign?: "left" | "right";
  customButtonIcon?: string;
  customButtonClassName?: string;
};

export const DropDown = (props: DropDownType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedRange, setSelectedRange] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [showIcon, setShowIcon] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const debounceTimer = useRef<number | null>(null);

  const {
    name,
    items,
    onClickLink,
    buttonImgStyle,
    dropDownContainerStyle,
    containerClassName,
    buttonClassName,
    buttonLabelClassName,
    title,
    isDate,
    isDateRange,
    onDateClick,
    showCustomButton = false,
    disabled = items?.map(() => false) || [],
    defaultStyle,
    cardData,
    searchable = false,
    searchPlaceholder = "Search...",

    searchMode = "local",
    onDropdownSearch,
    debounceMs = 350,
    showSearchIcon = true,
    isLoading = false,
    menuAlign = "right",
    customButtonIcon,
    customButtonClassName,
  } = props;

  const formatDateOnly = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleClick = () => {
    if ((items?.length ?? 0) === 0 && !isDate) return;
    setIsOpen(true);
  };

  const handleOptionClick = (index: number, cardData?: any) => {
    if (disabled[index]) return;
    onClickLink?.(index, cardData);
    setIsOpen(false);
    setShowIcon(null);
  };

  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setSelectedRange(dates);
    if (onDateClick && start && end) {
      onDateClick(formatDateOnly(start), formatDateOnly(end));
      setIsOpen(false);
      setShowIcon(null);
    }
  };

  const displayDateLabel = () => {
    if (isDateRange) {
      const [start, end] = selectedRange;
      if (!start && !end) return name;
      const startLabel = start ? formatDate(start) : "";
      const endLabel = end ? formatDate(end) : null;
      return endLabel ? `${startLabel} - ${endLabel}` : startLabel;
    }

    return isDate && selectedDate
      ? formatDate(selectedDate)
      : name;
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setShowIcon(null);
    setSearchTerm("");
  };

  // API refetch on input change (debounced) when searchMode === "api"
  useEffect(() => {
    if (!isOpen) return;
    if (!searchable) return;
    if (searchMode !== "api") return;
    if (!onDropdownSearch) return;

    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);

    debounceTimer.current = window.setTimeout(() => {
      onDropdownSearch(searchTerm.trim());
    }, debounceMs);

    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [
    isOpen,
    searchable,
    searchMode,
    onDropdownSearch,
    searchTerm,
    debounceMs,
  ]);

  const triggerSearchNow = () => {
    if (searchMode !== "api") return;
    onDropdownSearch?.(searchTerm.trim());
  };

  const filteredItems = useMemo(() => {
    const safeItems = items ?? [];

    // API mode: no local filtering; show items as provided by server
    if (searchMode === "api") {
      return safeItems.map((item, originalIndex) => ({ item, originalIndex }));
    }

    // Local mode: filter locally
    return safeItems
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) =>
        searchable
          ? (item || "").toLowerCase().includes(searchTerm.toLowerCase())
          : true
      );
  }, [items, searchTerm, searchable, searchMode]);

  const menuAlignClass = menuAlign === "left" ? "left-0" : "right-0";
  const containerWidthClass = containerClassName ?? "w-max";
  const buttonClasses = buttonClassName
    ? `flex items-center justify-between gap-2 ${buttonClassName}`
    : "flex items-center justify-between w-max gap-2 pl-2 pr-1 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full";

  return (
    <div className={`relative flex ${containerWidthClass}`}>
      {showCustomButton ? (
        <div
          onClick={handleClick}
          className={`w-max cursor-pointer ${customButtonClassName ?? ""}`}
        >
          <Icon icon={customButtonIcon || edit} />
        </div>
      ) : (
        <button
          type="button"
          className={buttonClasses}
          onClick={handleClick}
        >
          <span className={`text-xs font-medium text-textGrey ${buttonLabelClassName ?? ""}`}>
            {displayDateLabel()}
          </span>
          <img
            src={isDate ? dateIcon : drop}
            alt="DropdownIcon"
            className={`w-4 h-4 ${buttonImgStyle || ""}`}
          />
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeDropdown}
          />

          <div className={`absolute top-[35px] ${menuAlignClass} z-50`}>
            {isDate ? (
              <DatePicker
                startDate={selectedRange[0] ?? undefined}
                endDate={selectedRange[1] ?? undefined}
                onChange={(dates: [Date | null, Date | null]) =>
                  handleRangeChange(dates)
                }
                dateFormat="yyyy-MM-dd"
                inline
                selectsRange={true}
              />
            ) : (
              <div
                className={`flex flex-col gap-0 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] shadow-lg w-[220px] max-h-72 ${
                  dropDownContainerStyle || ""
                }`}
              >
                {title ? (
                  <div className="px-3 py-2 text-[11px] font-semibold text-textDarkGrey uppercase border-b border-strokeGreyThree bg-[#F9FAFB] rounded-t-[20px]">
                    {title}
                  </div>
                ) : null}

                {searchable ? (
                  <div className="px-2 pb-1 pt-2 border-b border-strokeGreyThree bg-white sticky top-0 z-10 rounded-t-[20px]">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") triggerSearchNow();
                        }}
                        placeholder={searchPlaceholder}
                        className="w-full px-2 py-1 text-xs border border-strokeGreyTwo rounded-full focus:outline-none focus:ring-1 focus:ring-strokeGreyTwo"
                      />

                      {searchMode === "api" && showSearchIcon ? (
                        <button
                          type="button"
                          onClick={triggerSearchNow}
                          className="p-2 rounded-full border border-strokeGreyTwo bg-[#F6F8FA] hover:bg-gray-100 disabled:opacity-60"
                          title="Search"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="animate-spin"
                            >
                              <path
                                d="M12 2a10 10 0 1 0 10 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="11"
                                cy="11"
                                r="8"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M21 21l-4.35-4.35"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </button>
                      ) : null}
                    </div>

                    {searchMode === "api" && isLoading ? (
                      <div className="mt-1 px-1 text-[10px] text-textGrey">
                        Searching...
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <ul className="flex flex-col gap-0.5 p-2 max-h-64 overflow-y-auto">
                  {filteredItems.map(({ item, originalIndex }, index) => {
                    const isDisabled = disabled[originalIndex];
                    return (
                      <li
                        key={`${item}-${originalIndex}-${index}`}
                        className={`flex items-center justify-between h-max px-2 py-1 text-xs rounded-full border-[0.4px] border-transparent
                          ${
                            isDisabled
                              ? "cursor-not-allowed text-gray-400 bg-gray-100"
                              : index === showIcon && !defaultStyle
                              ? "cursor-pointer bg-paleLightBlue text-textBlack"
                              : "cursor-pointer hover:bg-gray-100 text-textDarkGrey hover:border-strokeGreyTwo"
                          }`}
                        onClick={() => {
                          if (isLoading) return;
                          handleOptionClick(originalIndex, cardData);
                        }}
                        onMouseEnter={() => !isDisabled && setShowIcon(index)}
                        onMouseLeave={() => setShowIcon(null)}
                      >
                        {item}
                      </li>
                    );
                  })}

                  {filteredItems.length === 0 ? (
                    <li className="px-2 py-2 text-xs text-textGrey italic">
                      No options found
                    </li>
                  ) : null}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
