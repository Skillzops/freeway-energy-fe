import { useState } from "react";
import { observer } from "mobx-react-lite";
import PageLayout from "./PageLayout";
import dashboardbadge from "@/assets/RedIcons/Dashboard.png";
import { useGetRequest } from "@/utils/useApiCall";
import TaskDetailsModal from "@/Components/Installer/Task/TaskDetailsModal";
import StatisticsCard from "@/Components/Installer/Dashboard/StatisticsCard";
import { FiClipboard, FiTool, FiCpu } from "react-icons/fi";

const InstallerDashboard = observer(() => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [tableQueryParams, setTableQueryParams] = useState<Record<string, any> | null>({});

  const queryString = Object.entries(tableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const fetchDashboardStats = useGetRequest("/v1/installer/dashboard", true);

  const newTasks = fetchDashboardStats?.data?.newTasks || [];

  const tasksData = {
    data: newTasks.map((task: any) => ({
      id: task.id,
      dateAssigned: task.createdAt,
      taskValidity: task.scheduledDate || task.createdAt,
      requestingAgent: `${task.requestingAgent?.user?.firstname} ${task.requestingAgent?.user?.lastname}`,
      pickupLocation: task.pickupLocation || "To be determined",
      productType: task.sale?.saleItems?.[0]?.product?.name?.split(" ") || ["Product"],
      deviceId: task.sale?.saleItems?.[0]?.devices?.[0]?.serialNumber || "N/A",
      tokenStatus: task.sale?.saleItems?.[0]?.devices?.[0]?.isTokenable ? "Active" : "Inactive",
      status: (task.status || "").toLowerCase(),
      customerName: `${task.customer?.firstname} ${task.customer?.lastname}`,
      customerEmail: task.customer?.email,
      customerPhone: task.customer?.phone,
      productName: task.sale?.saleItems?.[0]?.product?.name,
      productId: task.sale?.saleItems?.[0]?.product?.id,
    })),
    total: newTasks.length,
  };

  const paginationInfo = () => {
    const total = tasksData?.total || 0;
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage,
    };
  };

  const statisticsData = [
    {
      title: "Total Task",
      subtitle: "Statistics",
      value: fetchDashboardStats?.data?.taskStatistics?.total || 0,
      icon: (
        <div className="w-full h-full flex items-center justify-center text-indigo-600">
          <FiClipboard className="w-6 h-6" aria-hidden />
        </div>
      ),
      iconBgColor: "bg-indigo-50",
      gradientFrom: "from-indigo-50",
      gradientTo: "to-purple-50",
    },
    {
      title: "Total Count For",
      subtitle: "Installations",
      value: fetchDashboardStats?.data?.overview?.totalInstallations || 0,
      icon: (
        <div className="w-full h-full flex items-center justify-center text-emerald-600">
          <FiTool className="w-6 h-6" aria-hidden />
        </div>
      ),
      iconBgColor: "bg-emerald-50",
      gradientFrom: "from-emerald-50",
      gradientTo: "to-green-50",
    },
    {
      title: "Total Installed",
      subtitle: "Devices",
      value: fetchDashboardStats?.data?.overview?.totalDevices || 0,
      icon: (
        <div className="w-full h-full flex items-center justify-center text-amber-600">
          <FiCpu className="w-6 h-6" aria-hidden />
        </div>
      ),
      iconBgColor: "bg-amber-50",
      gradientFrom: "from-amber-50",
      gradientTo: "to-yellow-50",
    },
  ];

  return (
    <PageLayout pageName="Dashboard" badge={dashboardbadge}>
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        <div className="flex flex-col gap-4 lg:w-2/3">
          {statisticsData.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition-shadow duration-300"
            >
              <StatisticsCard
                title={stat.title}
                subtitle={stat.subtitle}
                value={stat.value}
                icon={stat.icon}
                iconBgColor={stat.iconBgColor}
                gradientFrom={stat.gradientFrom}
                gradientTo={stat.gradientTo}
              />
            </div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <TaskDetailsModal
            tasksData={tasksData}
            isLoading={fetchDashboardStats.isLoading}
            refreshTable={fetchDashboardStats.mutate}
            error={fetchDashboardStats.error}
            errorData={fetchDashboardStats.errorStates}
            useMockData={false}
            paginationInfo={paginationInfo}
            setTableQueryParams={setTableQueryParams}
          />
        </div>
      </div>
    </PageLayout>
  );
});

export default InstallerDashboard;

