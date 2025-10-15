import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import inventorybadge from "@/assets/inventory/inventorybadge.png";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import inventorygradient from "@/assets/inventory/inventorygradient.svg";
import circleAction from "@/assets/settings/addCircle.svg";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
import { DropDown } from "@/Components/DropDownComponent/DropDown";

import { useGetRequest } from "@/utils/useApiCall";

const WarehouseTable = lazy(
  () => import("@/Components/Agents/WareHouses/WarehouseTable")
);


const WareHouses = () => {
  const location = useLocation();
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

  const {
    data: warehouseData,
    isLoading: warehouseLoading,
    mutate: allWarehouseRefresh,
    errorStates: allWarehouseErrorStates,
  } = useGetRequest(
    `/v1/?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
    }`,
    true,
    60000
  );

  const fetchWarehouseStats = useGetRequest(
    "/v1/warehouses/statistics/view",
    true
  );

  const paginationInfo = () => {
    const total = warehouseData?.total;
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
      case "/agent/warehouses/all":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
        break;
    }
  }, [location.pathname]);

  const dropDownList = {
    items: ["Add New Warehouse", "View All Inventory Logs", "Export list"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          setIsOpen(true);
          break;
        case 1:
          setIsOpen(true);
          break;
        default:
      }
    },
    showCustomButton: true,
  };

  const warehousePaths = ["all", "active", "inactive"];

  return (
    <>
      <PageLayout pageName="Warehouses" badge={inventorybadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={inventorygradient}
              iconBgColor="bg-[#FDEEC2]"
              topText="All"
              bottomText="WAREHOUSES"
              value={
                fetchWarehouseStats?.data?.totalWarehouses ||
                warehouseData?.total ||
                0
              }
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <ActionButton
              label="New Warehouse"
              icon={<img src={circleAction} className="w-4 h-4 filter brightness-0 invert" />}
              onClick={() => setIsOpen(true)}
            />
            <DropDown {...dropDownList} />
          </div>
        </section>
        <div className="flex flex-col w-full px-2 py-8 gap-4 lg:flex-row md:p-8">
          <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden">
            <Suspense
              fallback={
                <LoadingSpinner parentClass="absolute top-[50%] w-full" />
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/agent/warehouses/all" replace />}
                />
                {warehousePaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <WarehouseTable
                        warehouseData={warehouseData}
                        isLoading={warehouseLoading}
                        refreshTable={allWarehouseRefresh}
                        error={null}
                        errorData={allWarehouseErrorStates}
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
    </>
  );
};

export default WareHouses;
