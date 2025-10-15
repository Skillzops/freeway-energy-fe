import { Routes, Route } from "react-router-dom";
import { SideMenu } from "@/Components/Installer/SideMenuComponent/SideMenu";
import Profile from "@/Components/Settings/Profile";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import { Suspense, lazy } from "react";
import settingsbadge from "@/assets/settings/settingsbadge.png";
import PageLayout from "./PageLayout";

const ChangePassword = lazy(
  () => import("@/Components/Settings/ChangePassword")
);

const InstallerSettings = () => {
  const navigationList = [
    {
      title: "Profile",
      link: "/installer/settings/profile",
      count: null,
    },
    {
      title: "Change Password",
      link: "/installer/settings/change-password",
      count: null,
    },
  ];


  return (
    <>
      <PageLayout pageName="Settings" badge={settingsbadge}>
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
                <Route path="change-password" element={<ChangePassword />} />
              </Routes>
            </Suspense>
          </section>
        </div>
      </PageLayout>
    </>
  );
};

export default InstallerSettings;
