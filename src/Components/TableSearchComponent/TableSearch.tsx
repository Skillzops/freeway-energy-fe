import React, { useState } from "react";
import search from "../../assets/table/searchdropdown.svg";

export type TableSearchType = {
  name?: string;
  onSearch?: (query: string) => void;
  queryValue?: string;
  setQueryValue?: React.Dispatch<React.SetStateAction<string>>;
  refreshTable?: () => Promise<any>;
  placeholder?: string;
  containerClass?: string;
  inputContainerStyle?: string;
  inputClass?: string;
  buttonContainerStyle?: string;
  icon?: string;
};

export const TableSearch = (props: TableSearchType) => {
  const {
    name,
    onSearch,
    setQueryValue,
    refreshTable,
    placeholder,
    containerClass,
    inputContainerStyle,
    inputClass,
    buttonContainerStyle,
    icon,
  } = props;
  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearch = () => {
    if (onSearch && query) onSearch(query);
    setIsSearching(query ? true : false);
  };

  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value === "" && refreshTable) {
      await refreshTable();
      setIsSearching(false);
      if (setQueryValue) setQueryValue("");
    }
  };

  return (
    <div
      className={`relative flex ${containerClass ? containerClass : "w-max "}`}
    >
      {isSearching ? (
        // Input field is shown when isSearching is true
        <div className={`flex items-center gap-2 ${inputContainerStyle}`}>
          <input
            type="search"
            className={`text-xs font-medium text-textDarkGrey pl-2 pr-1 py-1 border-[0.6px] border-strokeGreyThree rounded-full ${inputClass}`}
            value={query}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            autoFocus
            placeholder={placeholder || "Search"}
          />
        </div>
      ) : (
        // Button is shown when isSearching is false
        <button
          className={`flex items-center justify-between gap-6 pl-2 pr-1 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full ${
            buttonContainerStyle ? buttonContainerStyle : "w-max "
          }`}
          onClick={() => setIsSearching(true)}
        >
          <span className="text-xs font-medium text-textGrey">{name}</span>
          <img src={icon || search} alt="Search Icon" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
