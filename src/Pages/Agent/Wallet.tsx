// src/Pages/Wallets.tsx

import { lazy, Suspense, useState } from "react";
import PageLayout from "./PageLayout";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
import wallet from "@/assets/agents/wallet.svg";
import walletLogo from "@/assets/wallet/walletLogo.png";
import greencustomer from "@/assets/customers/greencustomer.svg";
import redcustomerbag from "@/assets/customers/redcustomerbag.svg";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import { useGetRequest } from "@/utils/useApiCall";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import { DropDown } from "@/Components/DropDownComponent/DropDown";
import SecondaryModal from "@/Components/ModalSecondary/SecondaryModal";
import TopUpWalletForm from "@/Components/Agents/DashBoardCard/TopWalletForm";
// import TopUpWalletForm from "@/Components/DashBoardCard/TopWalletForm";

const WalletTable = lazy(() => import("@/Components/Agents/Wallet/WalletTable"));

/** Normalizer for /api/v1/wallet/stats */
function normalizeWalletStats(input: any) {
  const src =  input ?? {};
  return {
    walletBalance: Number(src.balance) || 0,
    totalCredit: Number(src.totalCredits) || 0,
    totalDebit: Number(src.totalDebits) || 0,
    transactionCount: Number(src.transactionCount) || 0,
    pendingTopUps: Number(src.pendingTopUps) || 0,
    lastTransactionDate: src.lastTransactionDate || null,
  };
}

const Wallets = () => {
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [tableQueryParams, setTableQueryParams] = useState<Record<string, any> | null>({});

  const queryString = Object.entries(tableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  // Fetch wallets list
  const {
    data: walletData,
    isLoading,
    mutate: refreshWallets,
    error,
    errorStates,
  } = useGetRequest(
    `/v1/wallet/transactions?page=${currentPage}&limit=${entriesPerPage}`,
    true,
    60000
  );

  // Fetch wallet stats from new endpoint
  const walletStatsResp = useGetRequest(`/v1/wallet/stats`, true, 60000);
  const stats = normalizeWalletStats(walletStatsResp?.data);

  console.log(walletStatsResp?.data, 'slsskss', stats)

  const getPaginationInfo = () => ({
    total: walletData?.total || 0,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  });

  const navigationList = [
    {
      title: "Wallets",
      link: "/agent/wallets/all",
      count: stats.transactionCount, // show transaction count from stats
    },
  ];

  const dropDownList = {
    items: ["Purchase Credit", "Top Up Wallet", "View Transaction History"],
    onClickLink: () => {},
    showCustomButton: true,
  };

  return (
    <>
      <PageLayout pageName="Wallets" badge={walletLogo}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={wallet}
              iconBgColor="bg-[#D6EEFA]"
              topText="Wallet"
              bottomText="BALANCE"
              value={stats.walletBalance}
            />
            <TitlePill
              icon={greencustomer}
              iconBgColor="bg-[#E3FAD6]"
              topText="Total"
              bottomText="CREDITS"
              value={stats.totalCredit}
            />
            <TitlePill
              icon={redcustomerbag}
              iconBgColor="bg-[#FFDBDE]"
              topText="Total"
              bottomText="DEBITS"
              value={stats.totalDebit}
            />
            {/* Optional extra pills if you want */}
            {/* <TitlePill
              icon={wallet}
              iconBgColor="bg-[#F6E7FF]"
              topText="Pending"
              bottomText="TOP-UPS"
              value={stats.pendingTopUps}
            /> */}
          </div>

          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <ActionButton
              label="Top Up"
              icon={<span className="text-xs font-primary">₦</span>}
              onClick={() => setIsTopUpModalOpen(true)}
            />
            <div className="h-[32px] flex items-center justify-center">
              <DropDown {...dropDownList} />
            </div>
          </div>
        </section>

        <div className="flex flex-col w-full px-2 py-8 gap-4 lg:flex-row md:p-8">
          <SideMenu navigationList={navigationList} />
          <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden">
            <Suspense fallback={<LoadingSpinner parentClass="absolute top-[50%] w-full" />}>
              <WalletTable
                walletData={walletData}
                isLoading={isLoading}
                refreshTable={refreshWallets}
                error={error}
                errorData={errorStates}
                paginationInfo={getPaginationInfo}
                setTableQueryParams={setTableQueryParams}
              />
            </Suspense>
          </section>
        </div>
      </PageLayout>

      <SecondaryModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        width="w-98"
        height="min-h-[300px]"
        headerIcon={<img src={wallet} alt="Wallet" className="w-10 h-10" />}
      >
        <TopUpWalletForm
          handleClose={() => setIsTopUpModalOpen(false)}
          refreshTable={refreshWallets}
        />
      </SecondaryModal>
    </>
  );
};

export default Wallets;
