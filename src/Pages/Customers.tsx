import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
import circleAction from "../assets/settings/addCircle.svg";
import customerbadge from "../assets/customers/customerbadge.png";
import cancelled from "../assets/cancelled.svg";
import greencustomer from "../assets/customers/greencustomer.svg";
import gradientcustomer from "../assets/customers/gradientcustomer.svg";
// import { DropDown } from "@/Components/DropDownComponent/DropDown";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import { useGetRequest } from "@/utils/useApiCall";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import CreateNewCustomer from "@/Components/Customer/CreateNewCustomer";

const CustomerTable = lazy(() => import("@/Components/Customer/CustomerTable"));

const Customers = () => {
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
    data: customerData,
    isLoading: customerLoading,
    mutate: allCustomerRefresh,
    error: allCustomerError,
    errorStates: allCustomerErrorStates,
  } = useGetRequest(
    `/v1/customers?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
    }`,
    true,
    60000
  );
  const fetchCustomerStats = useGetRequest("/v1/customers/stats", true);

  const paginationInfo = () => {
    const total = customerData?.total;
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
      case "/customers/all":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
        break;
      case "/customers/active":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          status: "active",
        }));
        break;
      case "/customers/barred":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          status: "barred",
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
      title: "All Customers",
      link: "/customers/all",
      count: fetchCustomerStats?.data?.totalCustomerCount || 0,
    },
    {
      title: "Active Customers",
      link: "/customers/active",
      count: fetchCustomerStats?.data?.activeCustomerCount || 0,
    },
    {
      title: "Barred Customers",
      link: "/customers/barred",
      count: fetchCustomerStats?.data?.barredCustomerCount || 0,
    },
  ];

  // const dropDownList = {
  //   items: ["Export List"],
  //   onClickLink: (index: number) => {
  //     switch (index) {
  //       case 0:
  //         console.log("Exporting list...");
  //         break;
  //       default:
  //         break;
  //     }
  //   },
  //   showCustomButton: true,
  // };

  const customerPaths = ["all", "active", "barred"];

  return (
    <>
      <PageLayout pageName="Customers" badge={customerbadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={greencustomer}
              iconBgColor="bg-[#E3FAD6]"
              topText="All"
              bottomText="CUSTOMERS"
              value={fetchCustomerStats?.data?.totalCustomerCount || 0}
            />
            <TitlePill
              icon={gradientcustomer}
              iconBgColor="bg-[#FDEEC2]"
              topText="New"
              bottomText="LEADS"
              value={fetchCustomerStats?.data?.newCustomerCount || 0}
            />
            <TitlePill
              icon={greencustomer}
              iconBgColor="bg-[#E3FAD6]"
              topText="Active"
              bottomText="CUSTOMERS"
              value={fetchCustomerStats?.data?.activeCustomerCount || 0}
            />
            <TitlePill
              icon={cancelled}
              iconBgColor="bg-[#FFDBDE]"
              topText="Barred"
              bottomText="CUSTOMERS"
              value={fetchCustomerStats?.data?.barredCustomerCount || 0}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <ActionButton
              label="New Customer"
              icon={<img src={circleAction} />}
              onClick={() => {
                setIsOpen(true);
              }}
            />
            {/* <DropDown {...dropDownList} /> */}
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
                  element={<Navigate to="/customers/all" replace />}
                />
                {customerPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <CustomerTable
                        customerData={customerData}
                        isLoading={customerLoading}
                        refreshTable={allCustomerRefresh}
                        error={allCustomerError}
                        errorData={allCustomerErrorStates}
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
      <CreateNewCustomer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        allCustomerRefresh={allCustomerRefresh}
      />
    </>
  );
};

export default Customers;
