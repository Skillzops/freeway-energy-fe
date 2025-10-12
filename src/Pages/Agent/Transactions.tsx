import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import transactionsbadge from "@/assets/transactions/transactionsbadge.png";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import wallet from "@/assets/agents/wallet.svg";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import ReverseTransactions from "@/Components/Transactions/ReverseTransactions";
import { useGetRequest } from "@/utils/useApiCall";

const TransactionTable = lazy(
  () => import("@/Components/Transactions/TransactionTable")
);

const Transactions = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [_transactionsFilter, setTransactionsFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    mutate: allTransactionsRefresh,
    error: allTransactionsError,
    errorStates: allTransactionsErrorStates,
  } = useGetRequest(
    `/v1/wallet/transactions?page=${currentPage}&limit=${entriesPerPage}${_transactionsFilter ? `&status=${_transactionsFilter}` : ""}`,
    true,
    60000
  );

  // Get all transactions without pagination to calculate pending count
  const {
    data: allTransactionsData,
  } = useGetRequest(
    `/v1/wallet/transactions`,
    true,
    60000
  );


  console.log(transactionsData?.transactions,'transactionsData__')
  console.log(allTransactionsData, 'allTransactionsData__')

  const paginationInfo = () => {
    const total = transactionsData?.meta?.total ?? 0;
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
      case "/transactions/all":
        setTransactionsFilter("");
        break;
      default:
        setTransactionsFilter("");
    }
  }, [location.pathname]);

  const navigationList = [
    {
      title: "All Transactions",
      link: "/transactions/all",
      count: transactionsData?.total ?? 0,
    },
  ];

  const transactionPaths = ["all"];

  return (
    <>
      <PageLayout pageName="Transactions" badge={transactionsbadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={wallet}
              iconBgColor="bg-[#E3FAD6]"
              topText="All"
              bottomText="TRANSACTIONS"
              value={transactionsData?.total ?? 0}
            />
            <TitlePill
              icon={wallet}
              iconBgColor="bg-[#FFF3CD]"
              topText="Pending"
              bottomText="TRANSACTIONS"
              value={
                // Filter all transactions to count only pending ones
                allTransactionsData?.transactions?.filter(
                  (transaction: any) =>
                    transaction?.status?.toLowerCase() === "pending"
                ).length ?? 0
              }
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            {/* Uncomment below if you want action buttons */}
            {/* <ActionButton
              label="Process Reversal"
              icon={<img src={reversal} />}
              onClick={() => {
                setIsOpen(true);
              }}
            /> */}
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
                  element={<Navigate to="/transactions/all" replace />}
                />
                {transactionPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <TransactionTable
                        transactionData={transactionsData || []}
                        isLoading={transactionsLoading}
                        refreshTable={allTransactionsRefresh}
                        error={allTransactionsError}
                        errorData={allTransactionsErrorStates}
                        currentPage={currentPage}
                        entriesPerPage={entriesPerPage}
                        setCurrentPage={setCurrentPage}
                        setEntriesPerPage={setEntriesPerPage}
                      />
                    }
                  />
                ))}
              </Routes>
            </Suspense>
          </section>
        </div>
      </PageLayout>

      <ReverseTransactions
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        allTransactionsRefresh={allTransactionsRefresh}
      />
    </>
  );
};

export default Transactions;
