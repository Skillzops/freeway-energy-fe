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

const TopNavComponent = () => {
  const { role, agentDetails, otherAgentInstances } = useTokens();
  const { apiCall } = useApiCall();

  const navigate = useNavigate();
  const currentDate = useFormattedCurrentDate();

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSwitchingProfile, setIsSwitchingProfile] = useState(false);

  // A user can hold both a Sales and an Installer profile. If they do,
  // otherAgentInstances (returned at login) lists the profile(s) that
  // aren't currently active - offer a one-click switch to it.
  const switchTarget = otherAgentInstances?.[0];

  const handleSwitchProfile = async () => {
    if (!switchTarget || isSwitchingProfile) return;
    setIsSwitchingProfile(true);
    try {
      const response = await apiCall({
        endpoint: "/v1/auth/switch-profile",
        method: "post",
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
        switchTarget.category === "INSTALLER"
          ? "/installer/dashboard"
          : "/agent/dashboard";
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
            <UserProfile
              role={
                agentDetails?.category?.toLowerCase() == "sales"
                  ? "SALES AGENT"
                  : agentDetails?.category?.toLowerCase() == "installer"
                  ? "INSTALLER"
                  : role?.role
              }
            />
            {switchTarget && (
              <button
                type="button"
                onClick={handleSwitchProfile}
                disabled={isSwitchingProfile}
                className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white bg-[#32290E] rounded-full hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap"
                title={`Switch to your ${
                  switchTarget.category === "INSTALLER" ? "Installer" : "Sales"
                } profile`}
              >
                {isSwitchingProfile
                  ? "Switching…"
                  : `Switch to ${
                      switchTarget.category === "INSTALLER"
                        ? "Installer"
                        : "Sales"
                    }`}
              </button>
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
