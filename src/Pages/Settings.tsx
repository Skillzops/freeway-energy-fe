import { Routes, Route, useLocation } from "react-router-dom";
import { SideMenu } from "../Components/SideMenuComponent/SideMenu";
import Profile from "../Components/Settings/Profile";
import LoadingSpinner from "../Components/Loaders/LoadingSpinner";
import { Suspense, lazy, useState } from "react";
import { TitlePill } from "../Components/TitlePillComponent/TitlePill";
import settings from "../assets/settings/settings.svg";
import ActionButton from "../Components/ActionButtonComponent/ActionButton";
import circleAction from "../assets/settings/addCircle.svg";
import { DropDown } from "../Components/DropDownComponent/DropDown";
import settingsbadge from "../assets/settings/settingsbadge.png";
import { useGetRequest } from "../utils/useApiCall";
import PageLayout from "./PageLayout";
import CreateNewUserModal from "@/Components/Settings/CreateNewUserModal";

const RoleAndPermissions = lazy(
  () => import("../Components/Settings/RoleAndPermissions")
);
const ChangePassword = lazy(
  () => import("../Components/Settings/ChangePassword")
);
const Users = lazy(() => import("../Components/Settings/Users"));

const Settings = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [tableQueryParams, setTableQueryParams] = useState<Record<
    string,
    any
  > | null>({});

  const queryString = Object.entries(tableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const fetchAllRoles = useGetRequest("/v1/roles", true, 60000);
  const fetchAllUsers = useGetRequest(
    `/v1/users?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
    }`,
    true,
    60000
  );

  const paginationInfo = () => {
    const total = fetchAllUsers?.data?.total;
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage,
    };
  };

  const userlocation = useLocation();
  const navigationList = [
    {
      title: "Profile",
      link: "/settings/profile",
      count: null,
    },
    {
      title: "Role and Permissions",
      link: "/settings/role-permissions",
      count: null,
    },
    {
      title: "Change Password",
      link: "/settings/change-password",
      count: null,
    },
    {
      title: "Users",
      link: "/settings/users",
      count: fetchAllUsers?.data?.total || 0,
    },
  ];

  const dropDownList = {
    items: ["Add new user"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          setIsOpen(true);
          break;
        default:
          break;
      }
    },
    showCustomButton: true,
  };

  const rolesList = fetchAllRoles.data?.map((item: any) => ({
    label: item.role,
    value: item.id,
  }));

  return (
    <>
      <PageLayout pageName="Settings" badge={settingsbadge}>
        {userlocation.pathname === "/settings/users" ? (
          <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
            <TitlePill
              icon={settings}
              iconBgColor="bg-[#FDEEC2]"
              topText="All"
              bottomText="USERS"
              value={fetchAllUsers?.data?.total || 0}
            />
            <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-start">
              <ActionButton
                label="New User"
                icon={<img src={circleAction} />}
                onClick={() => setIsOpen(true)}
              />
              <DropDown {...dropDownList} />
            </div>
          </section>
        ) : null}
        <div className="flex flex-col w-full px-2 py-8 gap-4 lg:flex-row md:p-8">
          <SideMenu navigationList={navigationList} />
          <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden">
            <Suspense
              fallback={
                <LoadingSpinner parentClass="absolute top-[50%] w-full" />
              }
            >
              <Routes>
                <Route index element={<Profile />} />
                <Route path="profile" element={<Profile />} />
                <Route
                  path="role-permissions"
                  element={
                    <RoleAndPermissions
                      allRoles={fetchAllRoles.data}
                      allRolesLoading={fetchAllRoles.isLoading}
                      allRolesError={fetchAllRoles.error}
                      allRolesRefresh={fetchAllRoles.mutate}
                      allRolesErrorStates={fetchAllRoles.errorStates}
                      rolesList={rolesList}
                    />
                  }
                />
                <Route path="change-password" element={<ChangePassword />} />
                <Route
                  path="users"
                  element={
                    <Users
                      rolesList={rolesList}
                      data={fetchAllUsers.data}
                      isLoading={fetchAllUsers.isLoading}
                      refreshTable={fetchAllUsers.mutate}
                      error={fetchAllUsers.error}
                      errorData={fetchAllUsers.errorStates}
                      paginationInfo={paginationInfo}
                      setTableQueryParams={setTableQueryParams}
                    />
                  }
                />
              </Routes>
            </Suspense>
          </section>
        </div>
      </PageLayout>
      <CreateNewUserModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        rolesList={rolesList}
        allUsersRefresh={fetchAllUsers.mutate}
        allRolesError={fetchAllRoles.error}
        allRolesErrorStates={fetchAllRoles.errorStates}
      />
    </>
  );
};

export default Settings;
