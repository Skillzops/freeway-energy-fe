import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import PageLayout from "../Pages/PageLayout";
import productbadge from "@/assets/RedIconsSvg/product.svg";
// import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import productgradient from "@/assets/products/productgradient.svg";
import cancelIcon from "@/assets/cancel.svg";
import circleAction from "@/assets/settings/addCircle.svg";
// import ActionButton from "@/Components/ActionButtonComponent/ActionButton";
// import TabComponent from "@/Components/TabComponent/TabComponent";
// import InstallerTable from "@/Components/Installer/InstallerTable";
// import RequestToken from "@/Components/Installer/RequestToken";
// import TaskHistoryTable from "@/Components/Task/TaskHistoryTable";
import { useGetRequest } from "@/utils/useApiCall";
import PageLayout from "../PageLayout";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import ActionButton from "@/Components/Installer/ActionButtonComponent/ActionButton";
import TabComponent from "@/Components/TabComponent/TabComponent";
import TaskHistoryTable from "@/Components/Installer/Task/TaskHistoryTable";
import InstallerTable from "@/Components/Installer/Installer/InstallerTable";
import RequestToken from "@/Components/Installer/Installer/RequestToken";

const Installer = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [tableQueryParams, setTableQueryParams] = useState<Record<
    string,
    any
  > | null>({});
  const location = useLocation();
  const navigate = useNavigate();

  const isTaskHistory = location.pathname.includes("/tasks");

  // Build query string from params
  const queryString = Object.entries(tableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  // Fetch tasks data for Task History tab
  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
    errorStates: tasksErrorStates,
    mutate: refreshTasks,
  } = useGetRequest(
    isTaskHistory
      ? `/v1/agents/tasks?page=${currentPage}&limit=${entriesPerPage}${
          queryString && `&${queryString}`
        }`
      : null,
    isTaskHistory,
    60000
  );

  // Fetch installation history data for Installation History tab( Revisit This endpoint later)
  const {
    data: installationData,
    isLoading: installationLoading,
    error: installationError,
    errorStates: installationErrorStates,
    mutate: refreshInstallations,
  } = useGetRequest(
    !isTaskHistory
      ? `/v1/agents/tasks?sortField=createdAt&page=${currentPage}&limit=${entriesPerPage}${
          queryString && `&${queryString}`
        }`
      : null,
    !isTaskHistory,
    60000
  );

  // Convert navigation list to tabs format
  const tabs = [
    {
      name: "Installation History",
      key: "/installer/installer/history",
      count: installationData?.total || 0,
    },
    {
      name: "Task History",
      key: "/installer/installer/tasks",
      count: tasksData?.total || 0,
    },
  ];

  useEffect(() => {
    setTableQueryParams({});
  }, [location.pathname]);

  // Stats for Task History
  const taskStats = {
    total: tasksData?.total || 0,
    pending: tasksData?.pending || 0,
    cancelled: tasksData?.cancelled || 0,
  };

  // Stats for Installation History
  const installationStats = {
    total: installationData?.total || 0,
    pending: installationData?.pending || 0,
    cancelled: installationData?.cancelled || 0,
  };

  return (
    <>
      <PageLayout
        pageName={isTaskHistory ? "Task History" : "Installation History"}
        badge={productbadge}
      >
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
              icon={productgradient}
              // iconBgColor="bg-[#FDEEC2]"
              topText="Total"
              bottomText={isTaskHistory ? "TASK" : "INSTALLATIONS"}
              value={isTaskHistory ? taskStats.total : installationStats.total}
            />
            <TitlePill
              icon={cancelIcon}
              // iconBgColor="bg-[#FFDBDE]"
              topText="Pending"
              bottomText={isTaskHistory ? "TASK" : "INSTALLATIONS"}
              value={
                isTaskHistory ? taskStats.pending : installationStats.pending
              }
            />
            <TitlePill
              icon={cancelIcon}
              // iconBgColor="bg-[#FFDBDE]"
              topText="Cancelled"
              bottomText={isTaskHistory ? "TASK" : "INSTALLATIONS"}
              value={
                isTaskHistory
                  ? taskStats.cancelled
                  : installationStats.cancelled
              }
            />
          </div>
          {!isTaskHistory && (
            <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
              <ActionButton
                label="Request Token"
                icon={
                  <img
                    src={circleAction}
                    className="w-4 h-4 filter brightness-0 invert"
                  />
                }
                onClick={() => setIsOpen(true)}
              />
            </div>
          )}
        </section>

        <div className="flex flex-col w-full px-2 py-8 gap-4 lg:flex-row md:p-8">
          <div className="flex flex-col w-full max-w-[280px] gap-2">
            <TabComponent
              tabs={tabs}
              onTabSelect={(key) => navigate(key)}
              activeTabName={
                isTaskHistory ? "Task History" : "Installation History"
              }
            />
          </div>

          <div className="flex-1">
            {isTaskHistory ? (
              <TaskHistoryTable
                currentPage={currentPage}
                entriesPerPage={entriesPerPage}
                setCurrentPage={setCurrentPage}
                setEntriesPerPage={setEntriesPerPage}
                setTableQueryParams={setTableQueryParams}
                tableQueryParams={tableQueryParams}
              />
            ) : (
              <InstallerTable
                agentData={installationData || { installations: [] }}
                isLoading={installationLoading}
                error={installationError}
                errorData={installationErrorStates}
                refreshTable={refreshInstallations}
                paginationInfo={() => ({
                  total: installationData?.total || 0,
                  currentPage,
                  entriesPerPage,
                  setCurrentPage,
                  setEntriesPerPage,
                })}
                setTableQueryParams={setTableQueryParams}
              />
            )}
          </div>
        </div>
      </PageLayout>
      <RequestToken
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        refreshTable={async () => {}}
      />
    </>
  );
};

export default Installer;
