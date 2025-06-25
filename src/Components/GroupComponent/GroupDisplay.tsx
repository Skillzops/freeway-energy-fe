import React from "react";

interface GroupItem {
  title: string;
  content: React.ReactNode;
  hasToggled: boolean;
}

interface GroupDisplayProps {
  items: GroupItem[];
}

const GroupItemComponent: React.FC<
  GroupItem & { isLast: boolean; isFirst: boolean }
> = ({ title, content, hasToggled, isFirst }) => {
  return (
    <div className={`${isFirst ? "rounded-t-[20px] border-0" : ""}`}>
      {/* Title */}
      <div
        className={`flex items-center text-left text-textBlack px-6 py-3
        ${hasToggled ? "bg-paleCreamGradientLeft" : "bg-paleGrayGradientLeft"}
        border-y-[0.6px] border-strokeGreyThree`}
      >
        <span
          className={`text-lg font-semibold ${
            hasToggled ? "text-textBlack" : "text-textDarkGrey"
          }`}
        >
          {title}
        </span>
      </div>

      {/* Content */}
      <div className="py-3 px-6">{content}</div>
    </div>
  );
};

const GroupDisplay: React.FC<GroupDisplayProps> = ({ items }) => {
  return (
    <div className="w-full mx-auto rounded-[20px] overflow-hidden">
      {items.map((item, index) => (
        <GroupItemComponent
          key={index}
          title={item.title}
          content={item.content}
          hasToggled={item.hasToggled}
          isFirst={index === 0}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
};

export default GroupDisplay;
