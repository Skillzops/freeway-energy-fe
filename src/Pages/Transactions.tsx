import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import transactionsbadge from "../assets/transactions/transactionsbadge.png";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
// import { DropDown } from "@/Components/DropDownComponent/DropDown";
// import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
// import reversal from "../assets/transactions/reversalactionicon.svg";
import wallet from "../assets/agents/wallet.svg";
import redwallet from "../assets/transactions/redwallet.svg";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import ReverseTransactions from "@/Components/Transactions/ReverseTransactions";
import { generateRandomTransactionEntries } from "@/Components/TableComponent/sampleData";
// import { useGetRequest } from "@/utils/useApiCall";

const TransactionTable = lazy(
  () => import("@/Components/Transactions/TransactionTable")
);

const Transactions = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [_transactionsData, setTransactionsData] = useState<any>(null);
  // const [transactionsFilter, setTransactionsFilter] = useState<string>("");
  const [, setTransactionsFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  //   const {
  //     data: transactionsData,
  //     isLoading: transactionsLoading,
  //     mutate: allTransactionsRefresh,
  //     error: allTransactionsError,
  //     errorStates: allTransactionsErrorStates,
  //   } = useGetRequest(
  //     `/v1/transactions${transactionsFilter && `?status=${transactionsFilter}`}`,
  //     true,
  //     60000
  //   );
  //   const fetchTransactionsStats = useGetRequest("/v1/transactions/stats", true);

  const paginationInfo = () => {
    const total = _transactionsData?.length;
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
        setTransactionsData(generateRandomTransactionEntries(100));
        break;
      case "/transactions/reversed":
        setTransactionsFilter("reversed");
        setTransactionsData(generateRandomTransactionEntries(25));
        break;

      default:
        setTransactionsFilter("");
        setTransactionsData(generateRandomTransactionEntries(100));
    }
  }, [location.pathname]);

  const navigationList = [
    {
      title: "All Transactions",
      link: "/transactions/all",
      count: 100,
    },
    {
      title: "Reversed Transactions",
      link: "/transactions/reversed",
      count: 25,
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

  const transactionPaths = ["all", "reversed"];

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
              value={0}
            />
            <TitlePill
              icon={redwallet}
              iconBgColor="bg-[#FFDBDE]"
              topText="Reversed"
              bottomText="TRANSACTIONS"
              value={0}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
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
                        // transactionData={_transactionsData}
                        transactionData={[]}
                        isLoading={false}
                        refreshTable={() => Promise.resolve()}
                        error={""}
                        errorData={{
                          errorStates: [
                            {
                              endpoint: "",
                              errorExists: false,
                              errorCount: 0,
                              toastShown: false,
                            },
                          ],
                          isNetworkError: false,
                          isPermissionError: false,
                        }}
                        paginationInfo={paginationInfo}
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
        allTransactionsRefresh={() => Promise.resolve()}
      />
    </>
  );
};

export default Transactions;
