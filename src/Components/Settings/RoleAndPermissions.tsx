import { useState } from "react";
import lightCheckeredBg from "../../assets/lightCheckeredBg.png";
import addCircleGold from "../../assets/settings/addCircleGold.svg";
import { GoDotFill } from "react-icons/go";
import { ApiErrorStatesType } from "../../utils/useApiCall";
import UserModal from "./UserModal";
import { Modal } from "../ModalComponent/Modal";
import { KeyedMutator } from "swr";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import EditPermissions from "./EditPermissions";
import ViewRolePermissions from "./ViewRolePermissions";
import editInput from "../../assets/settings/editInput.svg";

const columnList = ["TITLE", "ASSIGNED USERS", "PERMISSIONS", "ACTIONS"];
const columnWidth = ["w-[15%]", "w-[22.5%]", "w-[50%]", "w-[12.5%]"];

const RoleAndPermissions = ({
  allRoles,
  allRolesLoading,
  allRolesError,
  allRolesRefresh,
  allRolesErrorStates,
  rolesList,
}: {
  allRoles: any;
  allRolesLoading: boolean;
  allRolesError: any;
  allRolesRefresh: KeyedMutator<any>;
  allRolesErrorStates: ApiErrorStatesType;
  rolesList: any;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUserOpen, setIsUserOpen] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>("");
  const [modalInfo, setModalInfo] = useState<string | any>(null);
  const [displayInput, setDisplayInput] = useState<boolean>(false);

  const [roleData, setRoleData] = useState<{
    id: string;
    role: string;
    active: boolean;
    permissionIds: string[];
    permissions: {
      id: string;
      action: string;
      subject: string;
    }[];
  }>({
    id: "",
    role: "",
    active: true,
    permissionIds: [""],
    permissions: [
      {
        id: "",
        action: "",
        subject: "",
      },
    ],
  });

  return (
    <>
      <DataStateWrapper
        isLoading={allRolesLoading}
        error={allRolesError}
        errorStates={allRolesErrorStates}
        refreshData={allRolesRefresh}
        errorClass="rounded-[20px]"
        errorMessage={
          allRolesErrorStates.isPermissionError
            ? "You don't have the right permission"
            : "Failed to fetch roles list."
        }
      >
        <div className="relative flex flex-col justify-end bg-white p-2 sm:p-4 w-full lg:max-w-[700px] min-h-[414px] border-[0.6px] border-strokeGreyThree rounded-[20px] overflow-x-auto max-w-full">
          <img
            src={lightCheckeredBg}
            alt="Light Checkered Background"
            className="absolute top-0 left-0 w-full"
          />
          <div className="z-10 flex justify-end min-w-[575px]">
            <img
              src={addCircleGold}
              alt="Edit Button"
              className="w-[24px] h-[24px] hover:cursor-pointer"
              onClick={() => {
                setModalInfo("edit-permissions");
                setIsOpen(true);
              }}
            />
          </div>
          <div className="z-10 flex flex-col gap-4 mt-[60px] md:mt-[80px] p-[16px_16px_0px_16px] border-[0.6px] border-strokeGreyThree rounded-[20px] min-w-[575px]">
            <div className="flex items-center justify-between w-full">
              {columnList.map((column, index) => (
                <span
                  key={index}
                  className={`flex items-center ${
                    index === 3 ? "justify-center" : "justify-start"
                  } gap-1 ${
                    columnWidth[index]
                  } text-xs font-light text-textDarkGrey`}
                >
                  <GoDotFill color="#E0E0E0" />
                  {column}
                </span>
              ))}
            </div>
            <div className="flex flex-col">
              {allRoles?.map((role: any) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between w-full border-t-[0.2px] border-t-strokeGreyThree"
                >
                  <p
                    className={`py-2 text-xs text-textBlack font-semibold capitalize ${columnWidth[0]}`}
                  >
                    {role.role}
                  </p>
                  <p
                    className={`py-2 text-xs text-textDarkGrey ${columnWidth[1]}`}
                  >
                    {role?._count?.users}
                  </p>
                  <div
                    className={`flex items-center flex-wrap gap-2.5 py-2 ${columnWidth[2]}`}
                  >
                    {Array.from(
                      new Map(
                        role.permissions.map((permission: any) => [
                          permission.subject,
                          permission,
                        ])
                      ).values()
                    ).map((permission: any) => (
                      <span
                        key={permission.id}
                        className="flex items-center justify-center gap-1 bg-[#F6F8FA] px-2 py-1 text-xs uppercase text-textDarkGrey border-[0.4px] border-strokeGreyThree rounded-full"
                      >
                        <GoDotFill color="#9BA4BA" />
                        {permission.subject}
                      </span>
                    ))}
                  </div>
                  <div
                    className={`flex items-center justify-center ${columnWidth[3]}`}
                  >
                    <span
                      className="flex items-center justify-center px-2 pt-[1px] text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-[32px] shadow-innerCustom cursor-pointer hover:bg-gold"
                      onClick={async () => {
                        setRoleData({
                          id: role.id,
                          role: role.role,
                          active: role.active,
                          permissionIds: role.permissionIds,
                          permissions: role.permissions,
                        });
                        setIsOpen(true);
                        setModalInfo("view-permissions");
                      }}
                    >
                      View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DataStateWrapper>
      <Modal
        bodyStyle="pb-44"
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setDisplayInput(false);
        }}
        layout="right"
        rightHeaderComponents={
          modalInfo ===
          "edit-permissions" ? null : !roleData.id ? null : displayInput ? (
            <p
              className="text-xs text-textDarkGrey font-semibold cursor-pointer"
              onClick={() => setDisplayInput(false)}
              title="Cancel editing role & permission details"
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
        {modalInfo === "edit-permissions" ? (
          <EditPermissions
            setIsOpen={setIsOpen}
            allRolesRefresh={allRolesRefresh}
          />
        ) : (
          roleData.id && (
            <ViewRolePermissions
              roleData={roleData}
              refreshTable={allRolesRefresh}
              setUserID={setUserID}
              setIsOpen={setIsOpen}
              setIsUserOpen={setIsUserOpen}
              displayInput={displayInput}
              setDisplayInput={setDisplayInput}
            />
          )
        )}
      </Modal>
      <UserModal
        isOpen={isUserOpen}
        setIsOpen={setIsUserOpen}
        userID={userID}
        refreshTable={allRolesRefresh}
        rolesList={rolesList}
      />
    </>
  );
};

export default RoleAndPermissions;
