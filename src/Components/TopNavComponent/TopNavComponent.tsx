import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuButton } from "../MenuComponent/MenuButton";
import UserProfile from "../UserPill";
import { useFormattedCurrentDate } from "../../hooks/useFormattedCurrentDate";
import support from "../../assets/support.svg";
import { DropDown } from "../DropDownComponent/DropDown";
import Cookies from "js-cookie";
import useTokens from "../../hooks/useTokens";
import { useApiCall } from "@/utils/useApiCall";
import { formatNumberWithSuffix } from "../../hooks/useFormatNumberWithSuffix";
import { Modal } from "@/Components/ModalComponent/Modal";
import { brandAssets } from "@/config/brandConfig";

const categoryLabel = (category?: string | null) => {
  if (category === "INSTALLER") return "Installer";
  if (category === "SALES") return "Sales";
  if (category === "BUSINESS") return "Business";
  return category || "";
};

const TopNavComponent = () => {
  const { role, agentDetails, otherAgentInstances } = useTokens();
  const { apiCall } = useApiCall();

  const navigate = useNavigate();
  const currentDate = useFormattedCurrentDate();

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSwitchingProfile, setIsSwitchingProfile] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // A user can hold both a Sales and an Installer profile. profileOptions
  // lists all of them (current one first) so the switcher can show every
  // profile with either "Current" or a "Switch" action next to it.
  const profileOptions = agentDetails?.category
    ? [
        { id: agentDetails.id, category: agentDetails.category, isCurrent: true },
        ...(otherAgentInstances || []).map((agent: { id: string; category: string }) => ({
          id: agent.id,
          category: agent.category,
          isCurrent: false,
        })),
      ]
    : [];

  const handleSwitchProfile = async (targetAgentId: string, targetCategory: string) => {
    if (isSwitchingProfile) return;
    setIsSwitchingProfile(true);
    try {
      const response = await apiCall({
        endpoint: "/v1/auth/switch-profile",
        method: "post",
        data: { targetAgentId },
        showToast: false,
      });

      const existingCookie = Cookies.get("userData");
      const existingData = existingCookie ? JSON.parse(existingCookie) : {};

      Cookies.set(
        "userData",
        JSON.stringify({
          ...existingData,
          ...response.data,
          token: response.headers.access_token,
        }),
        { expires: 7, path: "/", sameSite: "Lax" }
      );

      const destination =
        targetCategory === "INSTALLER" ? "/installer/dashboard" : "/agent/dashboard";
      window.location.replace(destination);
    } catch (error) {
      console.error("Failed to switch profile", error);
      setIsSwitchingProfile(false);
    }
  };

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
              src={brandAssets.logoFull}
              alt="Logo"
              className="h-[28px] sm:h-[34px] w-auto object-contain cursor-pointer shrink-0"
              // onClick={() => navigate("/home")}
            />
            <MenuButton />
            {profileOptions.length > 0 ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    profileOptions.length > 1 &&
                    setIsProfileMenuOpen((open) => !open)
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#32290E] rounded-full whitespace-nowrap ${
                    profileOptions.length > 1 ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  {categoryLabel(agentDetails?.category).toUpperCase()}
                  {profileOptions.length > 1 && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`transition-transform ${
                        isProfileMenuOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {isProfileMenuOpen && profileOptions.length > 1 && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute top-[38px] left-0 z-50 w-[220px] bg-white border-[0.6px] border-strokeGreyThree rounded-2xl shadow-lg overflow-hidden">
                      <div className="px-3 py-2 text-[11px] font-semibold text-textDarkGrey uppercase border-b border-strokeGreyThree bg-[#F9FAFB]">
                        Switch Profile
                      </div>
                      <ul className="flex flex-col gap-0.5 p-1.5">
                        {profileOptions.map((option) => (
                          <li
                            key={option.id}
                            className={`flex items-center justify-between px-2 py-1.5 text-xs rounded-lg ${
                              option.isCurrent ? "bg-[#F6F8FA]" : ""
                            }`}
                          >
                            <span
                              className={
                                option.isCurrent
                                  ? "font-semibold text-textBlack"
                                  : "text-textDarkGrey"
                              }
                            >
                              {categoryLabel(option.category)}
                            </span>
                            {option.isCurrent ? (
                              <span className="text-[11px] font-medium text-blue-600">
                                Current
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={isSwitchingProfile}
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  handleSwitchProfile(option.id, option.category);
                                }}
                                className="text-[11px] font-medium text-blue-600 hover:underline disabled:opacity-50"
                              >
                                {isSwitchingProfile ? "Switching…" : "Switch"}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <UserProfile role={role?.role} />
            )}
          </div>
          <div className="flex items-center w-max max-w-[350px] gap-1 sm:gap-4">
            <span className="hidden sm:flex items-center justify-center bg-[#F6F8FA] h-[32px] px-2 py-1 text-xs text-textDarkGrey border-[0.6px] border-strokeGreyThree rounded-full">
              {currentDate}
            </span>
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
