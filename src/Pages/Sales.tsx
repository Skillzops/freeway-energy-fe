import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import PageLayout from "./PageLayout";
import transactionsbadge from "../assets/transactions/transactionsbadge.png";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
// import { DropDown } from "@/Components/DropDownComponent/DropDown";
import circleAction from "../assets/settings/addCircle.svg";
import gradientsales from "../assets/sales/gradientsales.svg";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import CreateNewSale from "@/Components/Sales/CreateNewSale";
import { useGetRequest, useApiCall } from "@/utils/useApiCall";
import { observer } from "mobx-react-lite";
import { SaleStore } from "@/stores/SaleStore";

const SalesTable = lazy(() => import("@/Components/Sales/SalesTable"));

const Sales = observer(() => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { apiCall } = useApiCall();
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
    data: salesData,
    isLoading: salesLoading,
    mutate: allSalesRefresh,
    error: allSalesError,
    errorStates: allSalesErrorStates,
  } = useGetRequest(
    `/v1/sales?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
    }`,
    true,
    60000
  );

  const paginationInfo = () => {
    const total = salesData?.total;
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
      case "/sales/all":
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

  useEffect(() => {
    SaleStore.purgeStore();
  }, []);

  const navigationList = [
    {
      title: "All Sales",
      link: "/sales/all",
      count: salesData?.total || 0,
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

  const salesPaths = ["all"];

  const tx_ref_param = searchParams.get("tx_ref")?.toString();
  const transaction_id = searchParams.get("transaction_id")?.toString();

  const verifyPayment = useCallback(async () => {
    try {
      apiCall({
        endpoint: "/v1/payment/verify/callback",
        method: "get",
        params: {
          tx_ref: tx_ref_param,
          transaction_id: transaction_id,
        },
        showToast: false,
      });
      console.log("VERIFIED SUCCESSFULLY");
    } catch (error) {
      console.error("Failed to verify payment:", error);
    }
  }, [apiCall, transaction_id, tx_ref_param]);

  useEffect(() => {
    if (tx_ref_param && transaction_id) verifyPayment();
  }, [tx_ref_param, transaction_id, verifyPayment]);

  return (
    <>
      <PageLayout pageName="Sales" badge={transactionsbadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={gradientsales}
              iconBgColor="bg-[#FDEEC2]"
              topText="All"
              bottomText="SALES"
              value={salesData?.total}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <ActionButton
              label="New Sale"
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
                  element={<Navigate to="/sales/all" replace />}
                />
                {salesPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <SalesTable
                        salesData={salesData}
                        isLoading={salesLoading}
                        refreshTable={allSalesRefresh}
                        error={allSalesError}
                        errorData={allSalesErrorStates}
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
      <CreateNewSale
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        allSalesRefresh={allSalesRefresh}
      />
    </>
  );
});

export default Sales;
