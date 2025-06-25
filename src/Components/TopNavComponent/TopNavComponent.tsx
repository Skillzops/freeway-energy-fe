import { useEffect, useState } from "react";
import logoplain from "../../assets/logoplain.svg";
import { useNavigate } from "react-router-dom";
import { MenuButton } from "../MenuComponent/MenuButton";
import UserProfile from "../UserPill";
import { useFormattedCurrentDate } from "../../hooks/useFormattedCurrentDate";
// import notification from "../../assets/notification.svg";
// import search from "../../assets/search.svg";
// import close from "../../assets/close.svg";
import support from "../../assets/support.svg";
import { DropDown } from "../DropDownComponent/DropDown";
import Cookies from "js-cookie";
import useTokens from "../../hooks/useTokens";
import { formatNumberWithSuffix } from "../../hooks/useFormatNumberWithSuffix";
import { Modal } from "@/Components/ModalComponent/Modal";

const TopNavComponent = () => {
  const { role } = useTokens();
  const navigate = useNavigate();
  const currentDate = useFormattedCurrentDate();
  // const [showSearchInput, setSearchInput] = useState<boolean>(false);
  // const [query, setQuery] = useState<string>("");

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // const handleSearch = () => {
  //   console.log(query);
  //   setSearchInput(false);
  // };

  const dropDownList = {
    items: ["My Profile", "Logout"],
    onClickLink: (index: number) => {
      console.log("INDEX:", index);
      switch (index) {
        case 0:
          navigate("/settings/profile");
          break;
        case 1:
          Cookies.remove("userData");
          sessionStorage.clear();
          window.location.replace("/");
          break;
        default:
          break;
      }
    },
    showCustomButton: true,
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-20 bg-white flex items-center justify-center w-full px-2 md:px-8 py-4 h-max transition-shadow ${
          isScrolled ? "border-b border-b-strokeGreyThree shadow-md" : ""
        }`}
      >
        <div className="flex items-start sm:items-center justify-between gap-1 w-full max-w-screen-2xl">
          <div className="flex flex-wrap sm:flex-nowrap items-center w-max gap-1 sm:gap-2">
            <img
              src={logoplain}
              alt="Logo"
              width="51px"
              className="w-[25px] sm:w-[51px] cursor-pointer"
              onClick={() => navigate("/home")}
            />
            <MenuButton />
            <UserProfile role={role.role} />
          </div>
          <div className="flex items-center w-max max-w-[350px] gap-1 sm:gap-4">
            <span className="hidden sm:flex items-center justify-center bg-[#F6F8FA] h-[32px] px-2 py-1 text-xs text-textDarkGrey border-[0.6px] border-strokeGreyThree rounded-full">
              {currentDate}
            </span>
            {/* {showSearchInput ? null : (
            <>
            <span className="hidden sm:flex items-center justify-center bg-[#F6F8FA] h-[32px] px-2 py-1 text-xs text-textDarkGrey border-[0.6px] border-strokeGreyThree rounded-full">
                {currentDate}
                </span>
              <div
              className="relative flex items-center justify-center w-[32px] h-[32px] bg-white border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom transition-all hover:bg-[#E2E4EB]"
                onClick={() => setIsOpen(true)}
              >
              <img
              src={notification}
              alt="Notification"
              className="w-[16px] cursor-pointer"
                />
                <span className="animate-ping -top-1.5 -right-1 absolute flex items-center justify-center bg-[#FEF5DA] text-transparent text-[8px] text-center font-medium min-w-4 min-h-4 p-[1px] border border-[#A58730] rounded-full shadow-innerCustom">
                  7
                </span>
                <span className="-top-1.5 -right-1 absolute flex items-center justify-center bg-[#FEF5DA] text-[8px] text-center font-medium min-w-4 min-h-4 p-[1px] border border-[#A58730] rounded-full shadow-innerCustom">
                  7
                </span>
              </div>
            </>
          )} */}
            {/* {showSearchInput ? (
            <div className="flex w-full items-center gap-2">
              <input
              type="search"
              className="text-xs font-medium text-textDarkGrey w-full h-[32px] pl-2 pr-1 py-1 border-[0.6px] border-strokeGreyThree rounded-full"
              value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                autoFocus
                placeholder="Enter your query"
                />
                </div>
                ) : (
                  <div
                  className="relative flex items-center justify-center w-[32px] h-[32px] bg-white border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom transition-all hover:bg-[#E2E4EB]"
              onClick={() => setSearchInput(true)}
            >
              <img
                src={search}
                alt="Search"
                className="w-[16px] cursor-pointer"
              />
            </div>
          )} */}
            {/* {showSearchInput ? (
            <div
            className="flex items-center justify-center w-[40px] h-[32px] bg-white border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom  transition-all hover:bg-[#E2E4EB]"
            onClick={() => setSearchInput(false)}
            >
              <img
              src={close}
              alt="Close"
                className="w-[20px] h-[20px] cursor-pointer"
                />
                </div>
                ) : (
                  <DropDown {...dropDownList} />
                  )} */}
            <DropDown {...dropDownList} />
          </div>
        </div>
      </header>
      <Modal
        layout="right"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        leftHeaderComponents={
          <p className="flex items-center justify-center gap-1 bg-[#F6F8FA] w-max px-2 py-1 text-xs text-textDarkGrey border-[0.4px] border-strokeGreyTwo rounded-full">
            Action Center
            <span className="flex items-center justify-center max-w-max px-1 border-[0.2px] text-xs rounded-full transition-all bg-[#FEF5DA] text-textDarkBrown border-textDarkBrown">
              {formatNumberWithSuffix(7)}
            </span>
          </p>
        }
      >
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-4 py-4 border-b-[0.4px] border-strokeGreyThree">
            <div className="w-[5%]">
              <img src={support} width="24px" />
            </div>
            <div className="flex flex-col gap-2 w-[77.5%]">
              <p className="text-xs text-textGrey font-bold uppercase">
                SUPPORT
              </p>
              <p className="text-xs text-textDarkGrey">
                John Ayodele has requested your approval for Dangote Cement EOI
                Request
              </p>
              <button className="text-[10px] px-2 py-0.5 border-[0.4px] border-strokeGreyThree rounded-full w-max hover:font-medium hover:bg-slate-50 transition-all">
                Return Home
              </button>
            </div>
            <span className="text-[10px] text-textGrey font-medium w-[17.5%]">
              17 Nov; 12:03pm
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TopNavComponent;
