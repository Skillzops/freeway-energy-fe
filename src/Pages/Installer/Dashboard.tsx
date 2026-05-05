import { useState } from "react";
import { observer } from "mobx-react-lite";
import PageLayout from "./PageLayout";
import dashboardbadge from "@/assets/RedIconsSvg/Dashboard.svg";
import { useGetRequest } from "@/utils/useApiCall";
import TaskDetailsModal from "@/Components/Installer/Task/TaskDetailsModal";
import StatisticsCard from "@/Components/Installer/Dashboard/StatisticsCard";
import { FiClipboard as _FiClipboard, FiTool as _FiTool, FiCpu as _FiCpu } from "react-icons/fi";
import productgreen from "@/assets/products/productgreen.svg";
import inventorygradient from "@/assets/inventory/inventorygradient.svg";
import totalicon from "@/assets/totalicon.svg";


const InstallerDashboard = observer(() => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [_tableQueryParams, setTableQueryParams] = useState<Record<string, any> | null>({});

  // Fetch dashboard stats first
  const fetchDashboardStats = useGetRequest("/v1/installer/dashboard", true);

  // Use newTasks from dashboard API instead of separate API call
  const newTasks = fetchDashboardStats?.data?.newTasks || [];

  // Transform the data structure to match what TaskDetailsModal expects
  const tasksData = {
    data: newTasks.map((task: any) => ({
      id: task.id,
      dateAssigned: task.createdAt,
      taskValidity: task.scheduledDate || task.createdAt,
      requestingAgent: `${task.requestingAgent?.user?.firstname} ${task.requestingAgent?.user?.lastname}`,
      pickupLocation: task.pickupLocation || 'To be determined',
      productType: task.sale?.saleItems?.[0]?.product?.name?.split(' ') || ['Product'],
      deviceId: task.sale?.saleItems?.[0]?.devices?.[0]?.serialNumber || 'N/A',
      tokenStatus: task.sale?.saleItems?.[0]?.devices?.[0]?.isTokenable ? 'Active' : 'Inactive',
      status: task.status.toLowerCase(),
      customerName: `${task.customer?.firstname} ${task.customer?.lastname}`,
      customerEmail: task.customer?.email,
      customerPhone: task.customer?.phone,
      productName: task.sale?.saleItems?.[0]?.product?.name,
      productId: task.sale?.saleItems?.[0]?.product?.id
    })),
    total: newTasks.length
  };



  // Pagination info for the table
  const paginationInfo = () => {
    const total = tasksData?.total || 0;
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage
    };
  };

  // Statistics data - Updated to match API response structure
  const statisticsData = [
  {
    title: "Total Task",
    subtitle: "Statistics",
    value: fetchDashboardStats?.data?.taskStatistics?.total || 0,
    icon: <img src={totalicon} alt="Tasks" className="w-full h-full" />,
    iconBgColor: "bg-purpleBlue",
    gradientFrom: "from-blue-50",
    gradientTo: "to-purple-50"
  },
  {
    title: "Total Count For",
    subtitle: "Installations",
    value: fetchDashboardStats?.data?.overview?.totalInstallations || 0,
    icon: <img src={productgreen} alt="Installations" className="w-full h-full" />,
    iconBgColor: "bg-successThree",
    gradientFrom: "from-green-50",
    gradientTo: "to-emerald-50"
  },
  {
    title: "Total Installed",
    subtitle: "Devices",
    value: fetchDashboardStats?.data?.overview?.totalDevices || 0,
    icon: <img src={inventorygradient} alt="Devices" className="w-full h-full" />,
    iconBgColor: "bg-paleYellow",
    gradientFrom: "from-orange-50",
    gradientTo: "to-yellow-50"
  }];


  return (
    <PageLayout pageName="Dashboard" badge={dashboardbadge}>
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left Side - Statistics Cards */}
        <div className="flex flex-col gap-4 lg:w-2/3">
          {statisticsData.map((stat, index) =>
          <StatisticsCard
            key={index}
            title={stat.title}
            subtitle={stat.subtitle}
            value={stat.value}
            icon={stat.icon}
            iconBgColor={stat.iconBgColor}
            gradientFrom={stat.gradientFrom}
            gradientTo={stat.gradientTo} />

          )}
        </div>

        {/* Right Side - Tasks Table */}
        <div className="lg:w-1/3">
          <TaskDetailsModal
            tasksData={tasksData}
            isLoading={fetchDashboardStats.isLoading}
            refreshTable={fetchDashboardStats.mutate}
            error={fetchDashboardStats.error}
            errorData={fetchDashboardStats.errorStates}
            useMockData={false}
            paginationInfo={paginationInfo}
            setTableQueryParams={setTableQueryParams} />

        </div>
      </div>
    </PageLayout>);

});

export default InstallerDashboard;
