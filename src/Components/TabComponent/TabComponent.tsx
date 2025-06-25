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
}

const TabComponent: React.FC<TabComponentProps> = ({
  tabs,
  onTabSelect,
  tabsContainerClass,
  activeTabName,
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
      className={`flex flex-wrap flex-row items-start sm:items-center justify-between sm:justify-start max-w-full gap-1 bg-white sm:w-max p-1 border-[0.6px] border-strokeGreyThree ${
        tabsContainerClass ? tabsContainerClass : "rounded-md sm:rounded-full"
      }`}
    >
      {tabs.map((tab) => (
        <div
          key={tab.name}
          className={`flex group items-center justify-center gap-2 px-2 py-1 text-xs font-medium cursor-pointer rounded-full ${
            activeTab?.name === tab.name
              ? "bg-primaryGradient text-white"
              : "bg-white hover:bg-[#F6F8FA] text-textGrey"
          }`}
          onClick={() => handleTabClick(tab)}
        >
          {tab.name}
          {tab.count !== null && (
            <span
              className={`flex items-center justify-center max-w-max px-1 border-[0.2px] text-xs rounded-full transition-all
            ${
              activeTab?.name === tab.name
                ? "bg-[#FEF5DA] text-textDarkBrown border-textDarkBrown"
                : "bg-[#EAEEF2] text-textDarkGrey border-strokeGrey group-hover:bg-[#FEF5DA] group-hover:text-textDarkBrown group-hover:border-textDarkBrown"
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
