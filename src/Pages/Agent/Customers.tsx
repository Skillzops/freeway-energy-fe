import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
// import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
// import circleAction from "@/assets/settings/addCircle.svg";
import customerbadge from "@/assets/customers/customerbadge.png";
import greencustomer from "@/assets/customers/greencustomer.svg";
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
    `/v1/agents/customers?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
    }`,
    true,
    60000
  );
  const fetchCustomerStats = useGetRequest("/v1/agents/customer/stats", true);

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
      case "/customers/your":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
        break;
      case "/customers/defaulting":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          status: "active",
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
      title: "Your Customers",
      link: "/customers/your",
      count: customerData?.total || 0,
    },
  ];


  const customerPaths = ["your", "defaulting"];

  console.log(customerData, 'fecustomerDatatchCustomerStats__')

  return (
    <>
      <PageLayout pageName="Customers" badge={customerbadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={greencustomer}
              iconBgColor="bg-[#E3FAD6]"
              topText="YOUR"
              bottomText="CUSTOMERS"
              value={customerData?.total || 0}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
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
