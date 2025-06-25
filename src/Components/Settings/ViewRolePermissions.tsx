import React, { useEffect, useMemo, useState } from "react";
import TabComponent from "../TabComponent/TabComponent";
import { DropDown } from "../DropDownComponent/DropDown";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { KeyedMutator } from "swr";
import { toast } from "react-toastify";
import RoleDetails from "./RoleDetails";
import PermissionDetails from "./PermissionDetails";
import UsersAssigned from "./UsersAssigned";

const ViewRolePermissions = ({
  roleData,
  refreshTable,
  setUserID,
  setIsOpen,
  setIsUserOpen,
  displayInput,
  setDisplayInput,
}: {
  roleData: {
    id: string;
    role: string;
    active: boolean;
    permissionIds: string[];
    permissions: {
      id: string;
      action: string;
      subject: string;
    }[];
  };
  refreshTable: KeyedMutator<any>;
  setUserID: React.Dispatch<React.SetStateAction<string>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUserOpen: React.Dispatch<React.SetStateAction<boolean>>;
  displayInput: boolean;
  setDisplayInput: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { apiCall } = useApiCall();
  const [activeTabName, setActiveTabName] = useState<string>("");
  const [tabContent, setTabContent] = useState<string>("roleDetails");

  const fetchSingleRoleData = useGetRequest(
    `/v1/roles/more_details/${roleData.id}`,
    true
  );

  const deleteUserById = async () => {
    const confirmation = prompt(
      `Are you sure you want to delete the role "${roleData.role}" along with all users and permissions assigned to it? This action is irreversible! Enter "Yes" or "No".`,
      "No"
    );

    if (confirmation?.trim()?.toLowerCase() === "yes") {
      toast.info(`Deleting ${roleData.role} role`);
      apiCall({
        endpoint: `/v1/roles/${roleData.id}`,
        method: "delete",
        successMessage: "Role deleted successfully!",
      })
        .then(async () => {
          await refreshTable();
          setIsOpen(false);
        })
        .catch(() => toast.error(`Failed to delete ${roleData.role} role`));
    }
  };

  const dropDownList = {
    items: ["Edit Role & Permissions", "Delete Role"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          setActiveTabName(tabNames[0].name);
          setTabContent(tabNames[0].key);
          setDisplayInput(true);
          break;
        case 1:
          deleteUserById();
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const userCount = fetchSingleRoleData?.data?.users?.length;

  const tabNames = useMemo(() => {
    return [
      { name: "Roles Details", key: "roleDetails", count: null },
      { name: "Permissions", key: "permissions", count: null },
      {
        name: "Assigned Users",
        key: "assignedUsers",
        count: userCount,
      },
    ];
  }, [userCount]);

  useEffect(() => {
    if (fetchSingleRoleData?.error) {
      setDisplayInput(false);
      setActiveTabName(tabNames[0].name);
      setTabContent(tabNames[0].key);
    }
  }, [fetchSingleRoleData?.error, setDisplayInput, tabNames]);

  return (
    <DataStateWrapper
      isLoading={fetchSingleRoleData?.isLoading}
      error={fetchSingleRoleData?.error}
      errorStates={fetchSingleRoleData?.errorStates}
      refreshData={fetchSingleRoleData?.mutate}
      errorMessage="Failed to fetch single role information."
    >
      <header className="flex items-center justify-between bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree">
        <p className="flex items-center justify-center bg-[#EFF2FF] text-xs text-textBlack font-semibold p-2 rounded-full h-[24px] capitalize">
          {fetchSingleRoleData?.data?.role}
        </p>
        <DropDown {...dropDownList} />
      </header>

      <div className="flex flex-col w-full gap-4 px-4 py-2">
        <TabComponent
          tabs={tabNames.map(({ name, key, count }) => ({
            name,
            key,
            count,
          }))}
          onTabSelect={(key) => {
            setActiveTabName("");
            setTabContent(key);
          }}
          activeTabName={activeTabName}
          tabsContainerClass="p-2 rounded-[20px]"
        />
        {tabContent === "roleDetails" ? (
          <RoleDetails
            fetchSingleRoleData={fetchSingleRoleData}
            userCount={userCount}
            editInput={displayInput}
            roleData={roleData}
            refreshTable={refreshTable}
            refreshRoleDetails={fetchSingleRoleData?.mutate}
            setEditInput={setDisplayInput}
          />
        ) : tabContent === "permissions" ? (
          <PermissionDetails fetchSingleRoleData={fetchSingleRoleData} />
        ) : (
          <UsersAssigned
            fetchSingleRoleData={fetchSingleRoleData}
            setUserID={setUserID}
            setIsOpen={setIsOpen}
            setIsUserOpen={setIsUserOpen}
          />
        )}
      </div>
    </DataStateWrapper>
  );
};

export default ViewRolePermissions;

export const DetailComponent = ({
  label,
  value,
  parentClass,
  labelClass,
  valueClass,
  icon,
  inputComponent,
}: {
  label: string;
  value?: string | number;
  parentClass?: string;
  labelClass?: string;
  valueClass?: string;
  icon?: string;
  inputComponent?: React.ReactNode;
}) => {
  return (
    <div
      className={`${
        parentClass ? parentClass : "p-2.5"
      } flex items-center justify-between bg-white w-full text-textDarkGrey text-xs rounded-full border-[0.6px] border-strokeGreyThree`}
    >
      <span
        className={`${labelClass} flex items-center justify-center bg-[#F6F8FA] text-textBlack text-xs p-2 h-[24px] rounded-full`}
      >
        {label}
      </span>
      {inputComponent ? (
        inputComponent
      ) : (
        <div className="flex items-center gap-1">
          {icon && <img src={icon} alt="Icon" />}
          <span
            className={`${valueClass} text-xs font-bold text-textDarkGrey capitalize`}
          >
            {value}
          </span>
        </div>
      )}
    </div>
  );
};
