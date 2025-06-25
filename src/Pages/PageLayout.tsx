import React from "react";
import TopNavComponent from "../Components/TopNavComponent/TopNavComponent";
import HeaderBadge from "../Components/HeaderBadgeComponent/HeaderBadge";

interface LayoutProps {
  pageName?: string;
  badge?: string;
  showheaderBadge?: boolean;
  className?: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<LayoutProps> = ({
  pageName,
  badge,
  showheaderBadge = true,
  className = "w-full",
  children,
}) => {
  return (
    <main className="relative flex flex-col items-center w-full pt-[67px] min-h-screen">
      <div className="flex flex-col items-center justify-center w-full max-w-screen-2xl">
        <TopNavComponent />
        {showheaderBadge && (
          <HeaderBadge pageName={pageName as string} image={badge as string} />
        )}
        <div className={`${className}`}>{children}</div>
      </div>
    </main>
  );
};

export default PageLayout;
