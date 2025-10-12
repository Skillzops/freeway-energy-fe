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
import CreateNewDevice from "@/Components/Devices/CreateNewDevice";
// import GenerateTokens from "@/Components/Tokens/GenerateTokens";
import { Modal } from "@/Components/ModalComponent/Modal";
import GenerateTokens from "@/Components/Agents/Tokens/GenerateTokens";

const DevicesTable = lazy(() => import("@/Components/Agents/Devices/DevicesTable"));
const TokensTable = lazy(() => import("@/Components/Agents/Tokens/TokensTable"));

const Devices = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isTokensOpen, setIsTokensOpen] = useState<boolean>(false);
  const [isTokensHistoryOpen, setIsTokensHistoryOpen] =
    useState<boolean>(false);
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

  // Tokens history state
  const [tokensCurrentPage, setTokensCurrentPage] = useState<number>(1);
  const [tokensEntriesPerPage, setTokensEntriesPerPage] = useState<number>(20);
  const [tokensTableQueryParams, setTokensTableQueryParams] = useState<Record<
    string,
    any
  > | null>({});

  const queryString = Object.entries(tableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const tokensQueryString = Object.entries(tokensTableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const {
    data: deviceData,
    isLoading: deviceLoading,
    mutate: allDeviceRefresh,
    errorStates: allDevicesErrorStates,
  } = useGetRequest(
    `/v1/agents/devices?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
    }`,
    true,
    60000
  );

  const {
    data: tokensData,
    isLoading: tokensLoading,
    mutate: allTokensRefresh,
    errorStates: allTokensErrorStates,
  } = useGetRequest(
    `/v1/tokens?page=${tokensCurrentPage}&limit=${tokensEntriesPerPage}${
      tokensQueryString && `&${tokensQueryString}`
    }`,
    true,
    60000
  );

  const paginationInfo = () => {
    const total = deviceData?.total;
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage,
    };
  };

  const tokensPaginationInfo = () => {
    const total = tokensData?.total || 0;
    return {
      total,
      currentPage: tokensCurrentPage,
      entriesPerPage: tokensEntriesPerPage,
      setCurrentPage: setTokensCurrentPage,
      setEntriesPerPage: setTokensEntriesPerPage,
    };
  };

  // ✅ Side menu links now match the routes below
  const navigationList = [
    {
      title: "All Devices",
      link: "/agent/devices/all",
      count: deviceData?.total || 0,
    },
    {
      title: "To be Installed",
      link: "/agent/devices/to-be-installed",
      count: deviceData?.total || 0,
    },
    {
      title: "Installed Devices",
      link: "/agent/devices/installed",
      count: deviceData?.total || 0,
    },
  ];

  // ✅ Map route -> installationStatus filter
  useEffect(() => {
    setTableQueryParams({});
    switch (location.pathname) {
      case "/agent/devices/installed":
        setTableQueryParams(() => ({ installationStatus: "installed" }));
        break;
      case "/agent/devices/to-be-installed":
        // choose the status your BE expects for "to be installed":
        setTableQueryParams(() => ({
          installationStatus: "ready_for_installation",
        }));
        break;
      // If you also want to support not_installed directly, add a menu and a case:
      // case "/devices/not-installed":
      //   setTableQueryParams(() => ({ installationStatus: "not_installed" }));
      //   break;
      default:
        // '/devices/all' -> no installationStatus filter
        setTableQueryParams((prev) => ({ ...(prev || {}) }));
    }
    // Optionally reset page when switching tabs
    setCurrentPage(1);
  }, [location.pathname]);

  // ✅ Add the new routes here
  const devicesPaths = ["all", "installed", "to-be-installed"];

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
              value={deviceData?.total || 0}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <DropDown
              {...{
                items: [
                  "Generate Tokens (Batch)",
                ],
                onClickLink: (index: number) => {
                  if (index === 0) {
                    setTokensFormType("batchUpload");
                    setIsTokensOpen(true);
                  }
                },
                showCustomButton: true,
              }}
            />
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

      <Modal
        isOpen={isTokensHistoryOpen}
        onClose={() => setIsTokensHistoryOpen(false)}
        size="large"
      >
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90vw] h-[80vh] max-w-6xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Tokens History
              </h2>
              <button
                onClick={() => setIsTokensHistoryOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 h-full overflow-auto">
              <Suspense fallback={<div>Loading tokens...</div>}>
                <TokensTable
                  tokensData={tokensData}
                  errorData={allTokensErrorStates}
                  isLoading={tokensLoading}
                  refreshTable={allTokensRefresh}
                  paginationInfo={tokensPaginationInfo}
                  setTableQueryParams={setTokensTableQueryParams}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Devices;
