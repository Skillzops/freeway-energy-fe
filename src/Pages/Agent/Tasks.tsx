import { Suspense, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLayout from "./PageLayout";
import { TitlePill } from "@/Components/TitlePillComponent/TitlePill";
import { SideMenu } from "@/Components/SideMenuComponent/SideMenu";
import { useGetRequest } from "@/utils/useApiCall";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import greencustomer from "@/assets/customers/greencustomer.svg";
import TasksTable from "@/Components/Agents/Tasks/TasksTable";
// import TasksTable from "@/Components/Tasks/TasksTable";


const Tasks = () => {
  const location = useLocation();


  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);


  const [tableQueryParams, setTableQueryParams] = useState<Record<string, any> | null>({});


  useEffect(() => {
    setTableQueryParams({});
    switch (location.pathname) {
      case "/tasks/pending":
        setTableQueryParams((p) => ({ ...(p || {}), status: "PENDING" }));
        break;
      case "/tasks/completed":
        setTableQueryParams((p) => ({ ...(p || {}), status: "COMPLETED" }));
        break;
      case "/tasks/rejected":
        setTableQueryParams((p) => ({ ...(p || {}), status: "REJECTED" }));
        break;
      default:
        setTableQueryParams((p) => ({ ...(p || {}) }));
        break;
    }
    setCurrentPage(1);
  }, [location.pathname]);


  const queryString = useMemo(
    () =>
      Object.entries(tableQueryParams || {})
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
        .join("&"),
    [tableQueryParams]
  );


  const {
    data: tasksData,
    isLoading,
    mutate: refresh,
    error,
    // errorStates,
  } = useGetRequest(
    `/v1/agents/tasks?page=${currentPage}&limit=${entriesPerPage}${
      queryString ? `&${queryString}` : ""
    }`,
    true,
    60000
  );

  const allCountReq = useGetRequest(`/v1/agents/tasks?page=1&limit=1`, true, 60000);
  const pendingCountReq = useGetRequest(
    `/v1/agents/tasks?page=1&limit=1&status=PENDING`,
    true,
    60000
  );
  const completedCountReq = useGetRequest(
    `/v1/agents/tasks?page=1&limit=1&status=COMPLETED`,
    true,
    60000
  );
  const rejectedCountReq = useGetRequest(
    `/v1/agents/tasks?page=1&limit=1&status=REJECTED`,
    true,
    60000
  );

  const getTotal = (d: any) =>
    d?.total ?? d?.count ?? d?.meta?.total ?? (Array.isArray(d) ? d.length : 0);

  const allCount = getTotal(allCountReq.data);
  const pendingCount = getTotal(pendingCountReq.data);
  const completedCount = getTotal(completedCountReq.data);
  const rejectedCount = getTotal(rejectedCountReq.data);

  const navigationList = [
    { title: "All", link: "/tasks/all", count: allCount },
    { title: "Pending", link: "/tasks/pending", count: pendingCount },
    { title: "Completed", link: "/tasks/completed", count: completedCount },
    { title: "Rejected", link: "/tasks/rejected", count: rejectedCount },
  ];

  const taskPaths = ["all", "pending", "completed", "rejected"];

  const paginationInfo = () => ({
    total: tasksData?.total ?? tasksData?.count ?? tasksData?.meta?.total,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  });

  return (
    <PageLayout pageName="Tasks" badge={greencustomer}>
      <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
        <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
          <TitlePill
            icon={greencustomer}
            iconBgColor="bg-[#E3FAD6]"
            topText="ALL"
            bottomText="TASKS"
            value={allCount || 0}
          />
        </div>
        <div className="flex w-full items-center justify-end gap-2 min-w-max sm:w-max" />
      </section>

      <div className="flex flex-col w-full px-2 py-8 gap-4 lg:flex-row md:p-8">
        <SideMenu navigationList={navigationList} />
        <section className="relative items-start justify-center flex min-h-[415px] w-full overflow-hidden">
          <Suspense fallback={<LoadingSpinner parentClass="absolute top-[50%] w-full" />}>
            <Routes>
              <Route path="/" element={<Navigate to="/tasks/all" replace />} />
              {taskPaths.map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <TasksTable
                      data={tasksData}
                      isLoading={!!isLoading}
                      error={error}
                      refreshTable={refresh}
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
  );
};

export default Tasks;

