import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import inventorybadge from "../assets/inventory/inventorybadge.png";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import avatar from "../assets/agents/avatar.svg";
import wallet from "../assets/agents/wallet.svg";
import cancelled from "../assets/cancelled.svg";
import circleAction from "../assets/settings/addCircle.svg";
import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
// import { DropDown } from "@/Components/DropDownComponent/DropDown";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import CreateNewAgents from "@/Components/Agents/CreateNewAgents";
import { useGetRequest } from "@/utils/useApiCall";
import { NairaSymbol } from "@/Components/CardComponents/CardComponent";

const AgentsTable = lazy(() => import("@/Components/Agents/AgentsTable"));

const Agent = () => {
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
    data: agentData,
    isLoading: agentLoading,
    mutate: allAgentRefresh,
    error: allAgentError,
    errorStates: allAgentErrorStates,
  } = useGetRequest(
    `/v1/agents?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
    }`,
    true,
    60000
  );
  const fetchAgentStats = useGetRequest("/v1/agents/statistics/view", true);
  
  // Fetch counts for each category
  const fetchSalesAgents = useGetRequest("/v1/agents?category=SALES&limit=1", true);
  const fetchInstallationAgents = useGetRequest("/v1/agents?category=INSTALLER&limit=1", true);
  const fetchBusinessAgents = useGetRequest("/v1/agents?category=BUSINESS&limit=1", true);
  const fetchBarredAgents = useGetRequest("/v1/agents?status=barred&limit=1", true);

  const paginationInfo = () => {
    const total = agentData?.total;
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
      case "/agents/all":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
        }));
        break;
      case "/agents/sales":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          category: "SALES",
        }));
        break;
      case "/agents/installation":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          category: "INSTALLER",
        }));
        break;
      case "/agents/business":
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          category: "BUSINESS",
        }));
        break;
      case "/agents/barred":
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
      title: "All Agents",
      link: "/agents/all",
      count: fetchAgentStats?.data?.total || 0,
    },
    {
      title: "Sales Agents",
      link: "/agents/sales",
      count: fetchSalesAgents?.data?.total || 0,
    },
    {
      title: "Installer Agents",
      link: "/agents/installation",
      count: fetchInstallationAgents?.data?.total || 0,
    },
    {
      title: "Business Agents",
      link: "/agents/business",
      count: fetchBusinessAgents?.data?.total || 0,
    },
    {
      title: "Barred Agents",
      link: "/agents/barred",
      count: fetchBarredAgents?.data?.total || 0,
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

  // const agentsPaths = ["all", "active", "barred"];
  const agentsPaths = ["all", "sales", "installation", "business", "barred"];

  return (
    <>
      <PageLayout pageName="Agents" badge={inventorybadge}>
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={wallet}
              iconBgColor="bg-[#E3FAD6]"
              topText="Revenue From"
              bottomText="Agents"
              leftIcon={<NairaSymbol />}
              value={0}
            />
            <TitlePill
              icon={avatar}
              iconBgColor="bg-[#FDEEC2]"
              topText="Total"
              bottomText="Agents"
              value={fetchAgentStats?.data?.total || 0}
            />
            <TitlePill
              icon={avatar}
              iconBgColor="bg-[#FDEEC2]"
              topText="Sales Done by"
              bottomText="Agents"
              value={0}
            />
            <TitlePill
              icon={cancelled}
              iconBgColor="bg-[#FFDBDE]"
              topText="Barred"
              bottomText="Agents"
              value={fetchAgentStats?.data?.barred || 0}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <ActionButton
              label="New Agents"
              icon={<img src={circleAction} />}
              onClick={() => setIsOpen(true)}
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
                  element={<Navigate to="/agents/all" replace />}
                />
                {agentsPaths.map((path) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <AgentsTable
                        agentData={agentData}
                        isLoading={agentLoading}
                        refreshTable={allAgentRefresh}
                        error={allAgentError}
                        errorData={allAgentErrorStates}
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
      <CreateNewAgents
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        refreshTable={allAgentRefresh}
      />
    </>
  );
};

export default Agent;
