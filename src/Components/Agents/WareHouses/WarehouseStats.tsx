import React from "react";
import { useGetRequest } from "@/utils/useApiCall";

interface WarehouseStatsProps {
  statsData?: any;
}

const WarehouseStats: React.FC<WarehouseStatsProps> = ({ statsData }) => {
  // Use passed stats data or fetch independently
  const { data: fetchedStats } = useGetRequest(
    "/v1/warehouses/statistics/view",
    !statsData
  );

  const stats = statsData || fetchedStats?.data;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Warehouse Statistics</h2>
      <ul className="space-y-2">
        <li>Total Warehouses: {stats?.totalWarehouses || 0}</li>
        <li>Active Warehouses: {stats?.activeWarehouses || 0}</li>
        <li>Inactive Warehouses: {stats?.inactiveWarehouses || 0}</li>
      </ul>
    </div>
  );
};

export default WarehouseStats;
