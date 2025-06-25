import { lazy, Suspense, useEffect, useState } from "react";
import PageLayout from "./PageLayout";
import { DropDown } from "@/Components/DropDownComponent/DropDown";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import gradientcontract from "../assets/contracts/gradientcontract.svg";
import contractsbadge from "../assets/contracts/contractsbadge.png";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import { useGetRequest } from "@/utils/useApiCall";

const ContractsTable = lazy(
  () => import("@/Components/Contracts/ContractsTable")
);

const Contracts = () => {
  const location = useLocation();
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
    data: contractsData,
    isLoading: contractsLoading,
    mutate: allContractsRefresh,
    error: allContractsError,
    errorStates: allContractsErrorStates,
  } = useGetRequest(
    `/v1/contract?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
    }`,
    true,
    60000
  );

  const paginationInfo = () => {
    const total = contractsData?.total;
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage,
    };
  };

  useEffect(() => {
    switch (location.pathname) {
      case "/contracts/all":
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

  const navigationList = [
    {
      title: "All Contracts",
      link: "/contracts/all",
      count: contractsData?.total || 0,
    },
  ];

  const dropDownList = {
    items: ["Add New Template"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          console.log("Adding template...");
          break;
        default:
          break;
      }
    },
    showCustomButton: true,
  };

  const contractsPaths = ["all"];

  return (
    <>
      <PageLayout pageName="Contracts" badge={contractsbadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={gradientcontract}
              iconBgColor="bg-[#FDEEC2]"
              topText="All"
              bottomText="CONTRACTS"
              value={contractsData?.total}
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
                  element={<Navigate to="/contracts/all" replace />}
                />
                {contractsPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <ContractsTable
                        contractsData={contractsData}
                        isLoading={contractsLoading}
                        refreshTable={allContractsRefresh}
                        error={allContractsError}
                        errorData={allContractsErrorStates}
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

export default Contracts;
