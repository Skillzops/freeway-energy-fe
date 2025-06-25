import { useApiCall, useGetRequest } from "../../utils/useApiCall";
import roletwo from "../../assets/table/roletwo.svg";
// import call from "../../assets/settings/call.svg";
// import message from "../../assets/settings/message.svg";
import editInput from "../../assets/settings/editInput.svg";
import { useState } from "react";
import { GoDotFill } from "react-icons/go";
import { DropDown } from "../DropDownComponent/DropDown";
import { Modal } from "@/Components/ModalComponent/Modal";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import StaffDetails from "./StaffDetails";
import TabComponent from "../TabComponent/TabComponent";

const UserModal = ({
  isOpen,
  setIsOpen,
  userID,
  refreshTable,
  rolesList,
}: any) => {
  const { apiCall } = useApiCall();
  const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [tabContent, setTabContent] = useState<string>("staffDetails");

  const { data, isLoading, error, errorStates, mutate } = useGetRequest(
    `/v1/users/single/${userID}`,
    true
  );

  // const handleCallClick = () => {
  //   const callURL = `tel:${data?.phone}`;
  //   window.open(callURL, "_self");
  // };

  // const handleWhatsAppClick = () => {
  //   const whatsappURL = `https://wa.me/${data?.phone}`;
  //   window.open(whatsappURL, "_blank");
  // };

  const deleteUserById = async () => {
    const confirmation = prompt(
      `Are you sure you want to delete ${data?.firstname} ${data?.lastname}. Enter "Yes" or "No".`,
      "No"
    );

    if (confirmation?.trim()?.toLowerCase() === "yes") {
      try {
        await apiCall({
          endpoint: `/v1/users/${data?.id}`,
          method: "delete",
          successMessage: "User deleted successfully!",
        });
        setIsOpen(false);
        refreshTable();
      } catch (error) {
        console.error("User deletion failed:", error);
      }
    } else {
      setIsOpen(false);
    }
  };

  const dropDownList = {
    items: [
      "Edit Staff Details",
      `${data?.isBlocked ? "Unblock" : "Block"} Staff`,
      "Delete Staff",
    ],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          setDisplayInput(true);
          break;
        case 1:
          apiCall({
            endpoint: `/v1/users/${data.id}`,
            method: "patch",
            data: {
              email: data?.email,
              isBlocked: !data?.isBlocked,
            },
            successMessage: "User blocked successfully!",
          });
          break;
        case 2:
          deleteUserById();
          break;
        default:
          break;
      }
    },
    // disabled: [false, !data ? true : false, false],
    disabled: [false, true, false],
    defaultStyle: true,
    showCustomButton: true,
  };

  const tabNames = [
    { name: "Staff Details", key: "staffDetails", count: null },
    { name: "Activity History", key: "activityHistory", count: 0 },
    { name: "Messages", key: "messages", count: 0 },
  ];

  return (
    <Modal
      layout="right"
      bodyStyle="pb-44"
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setDisplayInput(false);
      }}
      leftHeaderComponents={
        !data ? null : (
          <>
            <p className="flex items-center justify-center gap-1 bg-[#F6F8FA] w-max px-2 py-1 text-xs text-[#007AFF] border-[0.4px] border-strokeGreyTwo rounded-full uppercase">
              <GoDotFill />
              {data?.role?.role}
            </p>
            <p
              className={`flex items-center justify-center gap-1 bg-[#F6F8FA] w-max px-2 py-1 text-xs ${
                data?.status.toLowerCase() === "active"
                  ? "text-success"
                  : "text-errorTwo"
              } border-[0.4px] border-strokeGreyTwo rounded-full uppercase`}
            >
              <GoDotFill />
              {data?.status}
            </p>
          </>
        )
      }
      rightHeaderComponents={
        !data ? null : displayInput ? (
          <p
            className="text-xs text-textDarkGrey font-semibold cursor-pointer"
            onClick={() => setDisplayInput(false)}
            title="Cancel editing user details"
          >
            Cancel Edit
          </p>
        ) : (
          <button className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full hover:bg-slate-100">
            <img
              src={editInput}
              alt="Edit Button"
              width="15px"
              onClick={() => setDisplayInput(true)}
            />
          </button>
        )
      }
    >
      <div className="bg-white">
        <header
          className={`flex items-center ${
            data ? "justify-between" : "justify-end"
          } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
        >
          {data ? (
            <div className="flex items-center gap-1">
              <img src={roletwo} alt="Icon" />
              <span className="bg-[#EFF2FF] px-2 py-1 rounded-full text-xs font-bold text-textDarkGrey capitalize">
                {data?.firstname} {data?.lastname}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            {/* <Icon icon={call} iconText="Call" handleClick={handleCallClick} />
            <Icon
              icon={message}
              iconText="Message"
              handleClick={handleWhatsAppClick}
            /> */}
            <DropDown {...dropDownList} />
          </div>
        </header>
        <div className="flex flex-col w-full gap-4 px-4 py-2">
          <TabComponent
            tabs={tabNames.map(({ name, key, count }) => ({
              name,
              key,
              count,
            }))}
            onTabSelect={(key) => setTabContent(key)}
            tabsContainerClass="p-2 rounded-[20px]"
          />
          {tabContent === "staffDetails" ? (
            <DataStateWrapper
              isLoading={isLoading}
              error={error}
              errorStates={errorStates}
              refreshData={mutate}
              errorMessage="Failed to fetch staff information"
            >
              <StaffDetails
                data={data}
                rolesList={rolesList}
                refreshUserData={mutate}
                refreshUserTable={refreshTable}
                displayInput={displayInput}
                setDisplayInput={setDisplayInput}
              />
            </DataStateWrapper>
          ) : (
            <div>
              {tabNames?.find((item) => item.key === tabContent)?.name} Coming
              Soon
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserModal;

export const Icon = ({
  handleClick,
  icon,
  iconText,
}: {
  handleClick?: () => void;
  icon: string;
  iconText?: string;
}) => {
  return (
    <button
      className="flex items-center justify-center gap-1 w-max px-2 h-[32px] bg-white border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom transition-all hover:bg-gold"
      onClick={handleClick}
    >
      <img src={icon} alt={iconText} className="w-[16px] cursor-pointer" />
      {iconText ? (
        <p className="text-[10px] text-textBlack font-medium">{iconText}</p>
      ) : null}
    </button>
  );
};
