import { useLocation, Link } from "react-router-dom";
import useDefaultNavigation from "../../hooks/useDefaultNavigation";
import { formatNumberWithSuffix } from "../../hooks/useFormatNumberWithSuffix";

export type SideMenuType = {
  navigationList: {
    title: string;
    link: string;
    count: number | null;
  }[];
  parentClass?: string;
};

export const SideMenu = (props: SideMenuType) => {
  const location = useLocation();
  const { navigationList, parentClass } = props;
  useDefaultNavigation(navigationList);

  return (
    <div
      className={`${parentClass} flex flex-wrap flex-row w-full h-max sm:max-w-[208px] items-center justify-between bg-white p-2 sm:p-4 gap-2 border border-strokeGreyThree rounded-[20px] sm:flex-col`}
    >
      {navigationList.map((item, index) => (
        <Link
          to={item.link}
          key={index}
          className={`flex group items-center justify-center sm:justify-between w-max sm:w-full h-[24px] px-3 py-1.5 sm:pl-2 sm:pr-1 sm:py-1 gap-2 sm:gap-0 rounded-full cursor-pointer transition-all
            ${
              location.pathname === item.link
                ? "bg-primaryGradient"
                : "bg-white hover:bg-[#F6F8FA]"
            }`}
        >
          <p
            className={`text-xs font-medium transition-all ${
              location.pathname === item.link
                ? "text-white"
                : "text-textGrey group-hover:font-normal"
            }`}
          >
            {item.title}
          </p>
          {item?.count !== null ? (
            <span
              className={`flex items-center justify-center max-w-max px-1 border-[0.2px] text-xs rounded-full transition-all
              ${
                location.pathname === item.link
                  ? "bg-[#FEF5DA] text-textDarkBrown border-textDarkBrown"
                  : "bg-[#EAEEF2] text-textDarkGrey border-strokeGrey group-hover:bg-[#FEF5DA] group-hover:text-textDarkBrown group-hover:border-textDarkBrown"
              }`}
            >
              {formatNumberWithSuffix(item?.count)}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
};
