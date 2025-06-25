import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import buttonIcon from "../../assets/menu/menu.svg";
import { navData } from "./navInfo";

export type MenuButtonType = {
  buttonStyle?: string;
  sections?: { title: string; icon: any; link: string }[];
};

export const MenuButton = (props: MenuButtonType) => {
  const location = useLocation();
  const { buttonStyle, sections = navData } = props;
  const [dialog, setDialog] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);

  // Function to close modal if clicked outside
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setDialog(false); // Close modal if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        className={`${buttonStyle}
        flex items-center justify-center w-8 h-8 p-1 rounded-full 
        border-[0.2px] border-strokeGreyTwo hover:cursor-pointer
        transition-all duration-300 bg-white shadow-innerCustom
        hover:bg-[#E2E4EB]
        `}
        onClick={() => setDialog(!dialog)}
      >
        <img
          src={buttonIcon}
          alt="Menu Icon"
          width="16px"
          height="16px"
          color="red"
        />
      </div>
      {dialog && (
        <div
          ref={modalRef}
          className="absolute overflow-visible top-[60px] md:top-[70px] md:left-[90px] z-50 flex flex-col w-full bg-white p-4 gap-[10px] max-w-[200px] rounded-[20px] shadow-menuCustom"
        >
          {sections.map((section, index) => (
            <div key={index} className="bg-white">
              <div
                className={`flex items-center w-full h-[28px] px-2 py-2 gap-1 border-[0.6px] border-strokeGreyThree rounded-full transition-all hover:cursor-pointer
                   ${
                     location.pathname.startsWith(section.link)
                       ? "bg-primaryGradient text-white"
                       : "text-textGrey hover:text-textBlack"
                   }`}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <section.icon
                  stroke={
                    location.pathname.startsWith(section.link)
                      ? "white"
                      : hoveredIndex === index
                      ? "#050505"
                      : "#828DA9"
                  }
                  width="16"
                  height="16"
                />
                <Link to={section.link} className="">
                  {section.title}
                </Link>
              </div>

              {(index + 1) % 3 === 0 && index !== sections.length - 1 && (
                <div
                  className="w-full h-[1px] mt-[0.6em] border-t border-dashed"
                  style={{ borderColor: "#E0E0E0" }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
