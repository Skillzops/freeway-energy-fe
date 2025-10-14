
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import buttonIcon from "../../assets/menu/menu.svg";
import { navData, AgentNavData, InstallerNavData } from "./navInfo";
import useTokens from "@/hooks/useTokens";

export type MenuButtonType = {
  buttonStyle?: string;
  sections?: { title: string; icon: any; link: string }[];
};

export const MenuButton = ({ buttonStyle, sections }: MenuButtonType) => {
  const userData = useTokens();
  const location = useLocation();

  const role = userData?.role?.role;
  const cate = userData?.agentDetails?.category;

  const value =
    cate === "INSTALLER"
      ? InstallerNavData
      : role === "AssignedAgent"
        ? AgentNavData
        : role === "admin"
          ? navData
          : [];

  const [sideMenuArray, setSideMenuArray] = useState(value);
  const [dialog, setDialog] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setSideMenuArray(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialog &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setDialog(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dialog]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDialog(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={dialog}
        onClick={() => setDialog((s) => !s)}
        className={`${buttonStyle ?? ""} group inline-flex items-center justify-center w-9 h-9 rounded-full
          shadow-innerCustom border border-transparent
          bg-[#800020] text-white transition-all duration-200
          hover:brightness-110 active:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#CFB8BE]`}
        title="Open menu"
      >
        <img
          src={buttonIcon}
          alt="Menu"
          width="16"
          height="16"
          className="block brightness-0 invert pointer-events-none"
        />
      </button>

      {dialog && (
        <div
          ref={modalRef}
          role="menu"
          aria-label="Quick navigation"
          className="absolute top-[60px] md:top-[70px] md:left-[90px] z-50 w-[220px] overflow-visible"
        >
          <div 
            className="rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.22)] p-3
                       bg-[linear-gradient(180deg,#800020_0%,#6E001C_60%,#5A0018_100%)]
                       text-white border border-white/10
                       transition-transform duration-200 origin-top-left"
          >
            {sideMenuArray.map((section, index) => {
              const isActive = location.pathname.startsWith(section.link);
              const isHover = hoveredIndex === index;
              const pillClasses = isActive || isHover
                ? "bg-white text-[#800020] border-white"
                : "bg-white/10 text-white border-white/20";

              const iconColor = isActive || isHover ? "#800020" : "#FFFFFF";

              return (
                <div key={section.title} className="w-full"> 
                  <Link
                    to={section.link}
                    role="menuitem"
                    onClick={() => setDialog(false)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    // style={{border: "2px solid white"}}
                    className={`flex items-center w-full h-9 px-3 gap-2 rounded-full border 
                                transition-all duration-200 select-none
                                ${pillClasses} hover:shadow-sm active:scale-[0.99]`}
                  >
                    <section.icon width="16" height="16" stroke={iconColor} />
                    <span className="text-[13px] font-semibold truncate" >
                      {section.title}
                    </span>
                  </Link>

                  {(index + 1) % 3 === 0 && index !== sideMenuArray.length - 1 && (
                    <div className="w-full h-px my-2 border-t border-dashed border-white/20" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative">
            <div
              className="absolute -top-2 left-6 w-3 h-3 rotate-45 
                         bg-[#800020] border-l border-t border-white/20"
            />
          </div>
        </div>
      )}
    </>
  );
};

