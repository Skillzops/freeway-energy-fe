import React, { useEffect, useState } from "react";
import { formatNumberWithSuffix } from "../../hooks/useFormatNumberWithSuffix";

export interface Tab {
  name: string;
  key: string;
  count?: number | null;
}

export interface TabComponentProps {
  tabs: Tab[];
  onTabSelect: (key: string) => void;
  tabsContainerClass?: string;
  activeTabName?: string;
  variant?: "pill" | "stacked";
}

const TabComponent: React.FC<TabComponentProps> = ({
  tabs,
  onTabSelect,
  tabsContainerClass,
  activeTabName,
  variant = "pill",
}) => {
  const [activeTab, setActiveTab] = useState<Tab | null>(tabs[0] || null);

  // Sync internal active tab state with the `activeTabName` prop
  useEffect(() => {
    if (activeTabName) {
      const matchingTab = tabs.find((tab) => tab.name === activeTabName);
      if (matchingTab) {
        setActiveTab(matchingTab);
      }
    }
  }, [activeTabName, tabs]);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    onTabSelect(tab.key);
  };

  return (
    <div
      className={`flex flex-wrap items-start justify-between max-w-full gap-1 bg-white p-1 border-[0.6px] border-strokeGreyThree ${
        variant === "stacked"
          ? "flex-col w-full rounded-2xl"
          : "flex-row sm:items-center sm:justify-start sm:w-max rounded-md sm:rounded-full"
      } ${tabsContainerClass ? tabsContainerClass : ""}`}
    >
      {tabs.map((tab) => (
        <div
          key={tab.name}
          className={`flex group items-center gap-2 text-xs font-medium cursor-pointer rounded-full ${
            variant === "stacked" ? "w-full justify-between px-3 py-2" : "justify-center px-2 py-1"
          } ${
            activeTab?.name === tab.name
              ? "bg-primaryGradient text-white shadow-sm"
              : "bg-transparent hover:bg-[#F6F8FA] text-textBlack"
          }`}
          onClick={() => handleTabClick(tab)}
        >
          {tab.name}
          {tab.count !== null && (
            <span
              className={`flex items-center justify-center max-w-max px-1 border-[0.2px] text-xs rounded-full transition-all ${
                activeTab?.name === tab.name
                  ? "bg-white/90 text-textDarkGrey border-white/70"
                  : "bg-[#EAEEF2] text-textDarkGrey border-strokeGrey group-hover:bg-[#FEF5DA] group-hover:text-[#32290E] group-hover:border-[#A58730]"
              }`}
            >
              {tab.count && formatNumberWithSuffix(tab.count)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default TabComponent;
