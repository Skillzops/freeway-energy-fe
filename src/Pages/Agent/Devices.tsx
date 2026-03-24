import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import inventorybadge from "@/assets/inventory/inventorybadge.png";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import inventorygradient from "@/assets/inventory/inventorygradient.svg";
import { DropDown } from "@/Components/DropDownComponent/DropDown";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import { useGetRequest } from "@/utils/useApiCall";
import CreateNewDevice from "@/Components/Agents/Devices/CreateNewDevice";
import GenerateTokens from "@/Components/Agents/Tokens/GenerateTokens";

const DevicesTable = lazy(() => import("@/Components/Agents/Devices/DevicesTable"));

const Devices = () => {
  const getTotalCount = (payload: any): number => {
    if (typeof payload?.total === "number") return payload.total;
    if (typeof payload?.pagination?.total === "number") {
      return payload.pagination.total;
    }
    if (typeof payload?.data?.total === "number") return payload.data.total;
    if (typeof payload?.data?.pagination?.total === "number") {
      return payload.data.pagination.total;
    }

    const devices = payload?.devices ?? payload?.data?.devices;
    return Array.isArray(devices) ? devices.length : 0;
  };

  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isTokensOpen, setIsTokensOpen] = useState<boolean>(false);
  const [formType, setFormType] = useState<"singleUpload" | "batchUpload">(
    "singleUpload"
  );
  const [tokensFormType, setTokensFormType] = useState<
    "singleUpload" | "batchUpload"
  >("singleUpload");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [tableQueryParams, setTableQueryParams] = useState<Record<
    string,
    any
  > | null>({});

  const queryString = Object.entries(tableQueryParams || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const {
    data: deviceData,
    isLoading: deviceLoading,
    mutate: allDeviceRefresh,
    errorStates: allDevicesErrorStates,
  } = useGetRequest(
    `/v1/devices/assignments/my-devices?page=${currentPage}&limit=${entriesPerPage}${
      queryString ? `&${queryString}` : ""
    }`,
    true,
    60000
  );

  const { data: allDevicesCountData } = useGetRequest(
    "/v1/devices/assignments/my-devices?page=1&limit=1",
    true,
    60000
  );

  const { data: toBeInstalledCountData } = useGetRequest(
    "/v1/devices/assignments/my-devices?page=1&limit=1&installationStatus=not_installed",
    true,
    60000
  );

  const { data: installedCountData } = useGetRequest(
    "/v1/devices/assignments/my-devices?page=1&limit=1&installationStatus=installed",
    true,
    60000
  );

  const paginationInfo = () => {
    const total = getTotalCount(deviceData);
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage,
    };
  };

  const allDevicesTotal = getTotalCount(allDevicesCountData || deviceData);
  const toBeInstalledTotal = getTotalCount(toBeInstalledCountData);
  const installedTotal = getTotalCount(installedCountData);

  const navigationList = [
    {
      title: "All Devices",
      link: "/agent/devices/all",
      count: allDevicesTotal,
    },
    {
      title: "To be Installed",
      link: "/agent/devices/to-be-installed",
      count: toBeInstalledTotal,
    },
    {
      title: "Installed Devices",
      link: "/agent/devices/installed",
      count: installedTotal,
    },
  ];

  useEffect(() => {
    switch (location.pathname) {
      case "/agent/devices/installed":
        setTableQueryParams({ installationStatus: "installed" });
        break;
      case "/agent/devices/to-be-installed":
        setTableQueryParams({ installationStatus: "not_installed" });
        break;
      default:
        setTableQueryParams({});
        break;
    }
    setCurrentPage(1);
  }, [location.pathname]);

  const devicesPaths = ["all", "installed", "to-be-installed"];

  const dropDownList = {
    items: ["Generate Tokens (Batch)"],
    onClickLink: (index: number) => {
      if (index === 0) {
        setTokensFormType("batchUpload");
        setIsTokensOpen(true);
      }
    },
    showCustomButton: true,
  };

  return (
    <>
      <PageLayout pageName="Devices" badge={inventorybadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={inventorygradient}
              iconBgColor="bg-[#FDEEC2]"
              topText="All"
              bottomText="DEVICES"
              value={allDevicesTotal}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <DropDown {...dropDownList} />
          </div>
        </section>

        <div className="flex flex-col w-full px-2 py-8 gap-4 lg:flex-row md:p-8">
          <SideMenu navigationList={navigationList} />
          <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden">
            <Suspense
              fallback={
                <LoadingSpinner parentClass="absolute top-[50%] w-full" />
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/agent/devices/all" replace />}
                />
                {devicesPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <DevicesTable
                        devicesData={deviceData}
                        isLoading={deviceLoading}
                        refreshTable={allDeviceRefresh}
                        errorData={allDevicesErrorStates}
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

      <CreateNewDevice
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        allDevicesRefresh={allDeviceRefresh}
        formType={formType}
      />

      <GenerateTokens
        isOpen={isTokensOpen}
        setIsOpen={setIsTokensOpen}
        allDevicesRefresh={allDeviceRefresh}
        formType={tokensFormType}
      />
    </>
  );
};

export default Devices;
