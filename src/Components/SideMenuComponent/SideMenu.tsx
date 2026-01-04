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

export const SideMenu = ({ navigationList, parentClass }: SideMenuType) => {
  const location = useLocation();
  useDefaultNavigation(navigationList);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={`${parentClass ?? ""} w-full sm:max-w-[220px] rounded-2xl bg-white/90 backdrop-blur
      border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]
      p-2 sm:p-3 flex sm:flex-col flex-wrap gap-2`}
    >
      {navigationList.map((item, i) => {
        const active = isActive(item.link);
        return (
          <Link
            to={item.link}
            key={i}
            aria-current={active ? "page" : undefined}
            data-active={active ? "true" : "false"}
            className={`
              group relative w-max sm:w-full rounded-full
              px-3 sm:px-2 py-1.5 sm:py-1
              flex items-center sm:justify-between gap-2
              outline-none ring-0
              transition-[background,transform,box-shadow] duration-200
              ${active
                ? "bg-gradient-to-r from-[var(--brand-primary-hex)] to-accent text-white shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
                : "bg-white text-black hover:bg-black/5"
              }
              focus-visible:ring-2 focus-visible:ring-primary-hex focus-visible:ring-opacity-60
              hover:-translate-y-[1px] active:translate-y-0
            `}
          >
            <span
              className={`
                text-xs font-medium truncate
                ${active ? "text-white" : "text-black/80 group-hover:text-black"}
              `}
            >
              {item.title}
            </span>

            {item.count !== null && (
              <span
                className={`
                  ml-auto inline-flex items-center justify-center
                  min-w-[22px] h-[18px] px-1.5 rounded-full text-[10px] font-medium
                  transition-colors
                  ${active
                    ? "bg-white/90 text-black"
                    : "bg-black/5 text-black/70 group-hover:bg-primary-hex/10 group-hover:text-primary-hex"
                  }
                  border border-black/10
                `}
              >
                {formatNumberWithSuffix(item.count)}
              </span>
            )}

            {!active && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full opacity-0
                group-hover:opacity-100 transition-opacity
                ring-1 ring-primary-hex/20"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
};
