import { useApiCall, useGetRequest } from "../../utils/useApiCall";
import roletwo from "../../assets/table/roletwo.svg";
// import call from "../../assets/settings/call.svg";
// import message from "../../assets/settings/message.svg";
import editInput from "../../assets/settings/editInput.svg";
import { useMemo, useState } from "react";
import { GoDotFill } from "react-icons/go";
import { DropDown } from "../DropDownComponent/DropDown";
import { Modal } from "@/Components/ModalComponent/Modal";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import StaffDetails from "./StaffDetails";
import TabComponent from "../TabComponent/TabComponent";
import { DateTimeTag, SimpleTag } from "../CardComponents/CardComponent";

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
  const isActivityTab = tabContent === "activityHistory";
  const {
    data: activityData,
    isLoading: activityLoading,
    error: activityError,
    errorStates: activityErrorStates,
    mutate: refreshActivity,
  } = useGetRequest(
    isActivityTab && userID ? `/v1/audit-logs/user/${userID}` : null,
    true,
    60000
  );
  const activityLogs = useMemo(() => {
    if (Array.isArray(activityData)) return activityData;
    if (Array.isArray(activityData?.logs)) return activityData.logs;
    if (Array.isArray(activityData?.data)) return activityData.data;
    return [];
  }, [activityData]);

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
      } catch {
        void 0;
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

const ActivityHistoryList = ({
  logs,
}: {
  logs: Array<Record<string, any>>;
}) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="border border-strokeGreyThree rounded-[12px] p-3 text-xs text-textGrey bg-[#F9FAFB]">
        No activity found for this user.
      </div>
    );
  }

  const formatValues = (val: any) => {
    if (!val) return "none";
    if (typeof val !== "object") return String(val);
    if (Object.keys(val).length === 0) return "none";
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {logs.map((log, idx) => (
        <div
          key={log.id || log._id || idx}
          className="border border-strokeGreyThree rounded-[12px] p-3 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col gap-2 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
            <SimpleTag
              text={log.action || log.method || "N/A"}
              dotColour="#9BA4BA"
              containerClass="bg-[#F6F8FA] font-semibold text-textDarkGrey px-2 py-1 border-[0.4px] border-strokeGreyThree rounded-full"
            />
            {log.createdAt ? <DateTimeTag datetime={log.createdAt} showAll={false} /> : null}
          </div>
          <p className="text-xs text-textDarkGrey break-all whitespace-pre-wrap min-w-0">
            {log.entity || log.route || log.endpoint || log.metadata?.url || "Unknown resource"}
          </p>
          <div className="grid gap-2 min-w-0">
            <div className="rounded-[10px] border border-strokeGreyThree bg-[#F8FAFC] p-2 min-w-0">
              <p className="text-[11px] font-semibold text-textDarkGrey mb-1">Old Values</p>
              <pre className="text-[11px] leading-snug text-textGrey whitespace-pre-wrap break-all max-h-[90px] overflow-auto">
                {formatValues(log.oldValues)}
              </pre>
            </div>
            <div className="rounded-[10px] border border-strokeGreyThree bg-[#F8FAFC] p-2 min-w-0">
              <p className="text-[11px] font-semibold text-textDarkGrey mb-1">New Values</p>
              <pre className="text-[11px] leading-snug text-textGrey whitespace-pre-wrap break-all max-h-[90px] overflow-auto">
                {formatValues(log.newValues)}
              </pre>
            </div>
            <div className="rounded-[10px] border border-strokeGreyThree bg-[#F8FAFC] p-2 min-w-0">
              <p className="text-[11px] font-semibold text-textDarkGrey mb-1">Changes</p>
              <pre className="text-[11px] leading-snug text-textGrey whitespace-pre-wrap break-all max-h-[90px] overflow-auto">
                {formatValues(log.changes)}
              </pre>
            </div>
          </div>
          {log.requestUrl ? (
            <p className="text-[11px] text-textGrey break-all whitespace-pre-wrap min-w-0">URL: {log.requestUrl}</p>
          ) : null}
          {log.statusCode ? (
            <p className="text-[11px] text-textGrey">Status: {log.statusCode}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
};

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
              count: key === "activityHistory" ? activityLogs.length : count,
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
          ) : tabContent === "activityHistory" ? (
            <DataStateWrapper
              isLoading={activityLoading}
              error={activityError}
              errorStates={activityErrorStates}
              refreshData={refreshActivity}
              errorMessage="Failed to fetch activity history"
            >
              <ActivityHistoryList logs={activityLogs} />
            </DataStateWrapper>
          ) : (
            <div>
              {tabNames?.find((item) => item.key === tabContent)?.name} Coming Soon
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
