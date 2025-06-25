import { GoDotFill } from "react-icons/go";
import roletwo from "../../assets/table/roletwo.svg";
import { formatDateTime } from "@/utils/helpers";
import React from "react";

const usersColumnList = ["USER", "DATE ASSIGNED", "ACTIONS"];
const userColumnWidth = ["w-[50%]", "w-[35%]", "w-[15%]"];

const UsersAssigned = ({
  fetchSingleRoleData,
  setUserID,
  setIsOpen,
  setIsUserOpen,
}: {
  fetchSingleRoleData: any;
  setUserID: React.Dispatch<React.SetStateAction<string>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUserOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="flex flex-col w-full p-2.5 gap-2 rounded-[20px] border-[0.6px] border-strokeGreyThree">
      {fetchSingleRoleData?.data?.users?.length > 0 ? (
        <>
          <div className="flex items-center justify-between w-full">
            {usersColumnList.map((column, index) => (
              <span
                key={index}
                className={`flex items-center ${
                  index === 2 ? "justify-center" : "justify-start"
                } gap-1 ${
                  userColumnWidth[index]
                } text-xs font-light text-textDarkGrey`}
              >
                <GoDotFill color="#E0E0E0" />
                {column}
              </span>
            ))}
          </div>
          {fetchSingleRoleData?.data?.users?.map((user: any) => (
            <div key={user.id} className="flex items-center w-full">
              <div className={`flex items-center gap-1 ${userColumnWidth[0]}`}>
                <img src={roletwo} alt="icon" />
                <span className="bg-[#EFF2FF] px-2 py-1 text-xs text-textBlack font-semibold rounded-full capitalize">
                  {user.firstname} {user.lastname}
                </span>
              </div>
              <div className={`${userColumnWidth[1]}`}>
                <div className="flex items-center justify-center gap-1 bg-[#F6F8FA] px-2 py-1 w-max border-[0.4px] border-strokeGreyTwo rounded-full">
                  <p className="text-xs text-textDarkGrey font-semibold">
                    {formatDateTime("date", user?.createdAt)}
                  </p>
                  <GoDotFill color="#E2E4EB" />
                  <p className="text-xs text-textDarkGrey">
                    {formatDateTime("time", user?.createdAt)}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center justify-center ${userColumnWidth[2]}`}
              >
                <span
                  className="flex w-max items-center justify-center px-2 pt-[1px] text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-[32px] shadow-innerCustom cursor-pointer"
                  onClick={() => {
                    setUserID(user.id);
                    setIsOpen(false);
                    setIsUserOpen(true);
                  }}
                >
                  View
                </span>
              </div>
            </div>
          ))}
        </>
      ) : (
        <p className="text-xs text-textDarkGrey uppercase">No users assigned</p>
      )}
    </div>
  );
};

export default UsersAssigned;
