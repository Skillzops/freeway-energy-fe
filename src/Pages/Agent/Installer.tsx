import { Suspense, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import inventorybadge from "@/assets/inventory/inventorybadge.png";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import avatar from "@/assets/agents/avatar.svg";
// import circleAction from "@/assets/settings/addCircle.svg";
// import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";

import { useGetRequest } from "@/utils/useApiCall";
import useTokens from "@/hooks/useTokens";
import CreateNewInstallers from "@/Components/Agents/CreateNewInstallers";
import InstallersTable from "@/Components/Agents/InstallersTable";
// import InstallersTable from "@/Components/Installers/InstallersTable";
// import CreateNewInstallers from "@/Components/Installers/CreateNewInstallers";

const AgentInstaller = () => {
  const location = useLocation();
  const { id: agentId } = useTokens();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [tableQueryParams, setTableQueryParams] = useState<Record<
    string,
    any
  > | null>({});

  const queryString = useMemo(
    () =>
      Object.entries(tableQueryParams || {})
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&"),
    [tableQueryParams]
  );

  // Your latest endpoints (as you pasted)
  const {
    data: installerData,
    isLoading: installerLoading,
    mutate: allInstallerRefresh,
    error: allInstallerError,
    errorStates: allInstallerErrorStates,
  } = useGetRequest(
    `/v1/agents/installers?page=${currentPage}&agentId=${agentId}&limit=${entriesPerPage}${
      queryString ? `&${queryString}` : ""
    }`,
    true,
    60000
  );

  // const fetchInstallerStats = useGetRequest(
  //   "/v1/agents/installers/statistics/view",
  //   true
  // );



  console.log(installerData, 'installerData__')

  const paginationInfo = () => {
    const total = installerData?.total;
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage,
    };
  };

  useEffect(() => {
    setTableQueryParams({});
    switch (location.pathname) {
      case "/agent/installers/all":
      default:
        setTableQueryParams((prevParams) => ({ ...(prevParams || {}) }));
    }
  }, [location.pathname]);

  const navigationList = [
    {
      title: "All Installers",
      link: "/agent/installers/all",
      count: installerData?.total  || 0,
    },
  ];

  const installersPaths = ["all"];

  return (
    <>
      <PageLayout pageName="Installers" badge={inventorybadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={avatar}
              iconBgColor="bg-[#FDEEC2]"
              topText="Total"
              bottomText="Installers"
              value={
                installerData?.total  || 0
              }
            />
          </div>
          {/* <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <ActionButton
              label="New Installers"
              icon={<img src={circleAction} />}
              onClick={() => setIsOpen(true)}
            />
          </div> */}
        </section>

        <div className="flex flex-col w-full px-2 py-8 gap-4 lg:flex-row md:p-8">
          <SideMenu navigationList={navigationList} />
          <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden">
            <Suspense
              fallback={
                <LoadingSpinner parentClass="absolute top[50%] w-full" />
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/agent/installers/all" replace />}
                />
                {installersPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <InstallersTable
                        installerData={installerData}
                        isLoading={installerLoading}
                        refreshTable={allInstallerRefresh}
                        error={allInstallerError}
                        errorData={allInstallerErrorStates}
                        paginationInfo={paginationInfo}
                        setTableQueryParams={setTableQueryParams}
                      />
                    }
                  />
                ))}
              </Routes>
            </Suspense>
          </section>
        </div>
      </PageLayout>

      <CreateNewInstallers
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        refreshTable={allInstallerRefresh}
      />
    </>
  );
};

export default AgentInstaller;
