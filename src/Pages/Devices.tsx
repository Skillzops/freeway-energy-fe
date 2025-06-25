import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import inventorybadge from "../assets/inventory/inventorybadge.png";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import inventorygradient from "../assets/inventory/inventorygradient.svg";
import circleAction from "../assets/settings/addCircle.svg";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
import { DropDown } from "@/Components/DropDownComponent/DropDown";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import { useGetRequest } from "@/utils/useApiCall";
import CreateNewDevice from "@/Components/Devices/CreateNewDevice";

const DevicesTable = lazy(() => import("@/Components/Devices/DevicesTable"));

const Devices = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formType, setFormType] = useState<"singleUpload" | "batchUpload">(
    "singleUpload"
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [tableQueryParams, setTableQueryParams] = useState<Record<
    string,
    any
  > | null>({});

  const queryString = Object.entries(tableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const {
    data: deviceData,
    isLoading: deviceLoading,
    mutate: allDeviceRefresh,
    errorStates: allDevicesErrorStates,
  } = useGetRequest(
    `/v1/device?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
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

  const navigationList = [
    {
      title: "All Devices",
      link: "/devices/all",
      count: deviceData?.total || 0,
    },
  ];

  useEffect(() => {
    setTableQueryParams({});
    switch (location.pathname) {
      case "/devices/all":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
        break;
      default:
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
    }
  }, [location.pathname]);

  const dropDownList = {
    items: ["Create New Devices (Batch)"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          setFormType("batchUpload");
          setIsOpen(true);
          break;
        case 1:
          console.log("Exporting list...");
          break;
        default:
          break;
      }
    },
    showCustomButton: true,
  };

  const devicesPaths = ["all"];

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
            <ActionButton
              label="New Device"
              icon={<img src={circleAction} />}
              onClick={() => {
                setFormType("singleUpload");
                setIsOpen(true);
              }}
            />
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
                  element={<Navigate to="/devices/all" replace />}
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
    </>
  );
};

export default Devices;
