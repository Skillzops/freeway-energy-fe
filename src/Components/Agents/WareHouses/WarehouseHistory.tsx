import React from "react";
import { useGetRequest } from "@/utils/useApiCall";
import LoadingSpinner from "../Loaders/LoadingSpinner";

interface WarehouseHistoryProps {
  warehouseId: string;
}

const WarehouseHistory: React.FC<WarehouseHistoryProps> = ({ warehouseId }) => {
  const { data: historyData, isLoading } = useGetRequest(
    `/v1/warehouses/${warehouseId}/history`,
    !!warehouseId
  );

  const history = historyData?.data || [];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Warehouse History</h2>

      {isLoading ? (
        <LoadingSpinner parentClass="py-4" />
      ) : history.length > 0 ? (
        <ul className="space-y-2">
          {history.map((entry: any, index: number) => (
            <li key={index}>
              <strong>
                {new Date(entry.date || entry.createdAt).toLocaleDateString()}:
              </strong>{" "}
              {entry.event || entry.description || entry.action}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">
          No history records found for this warehouse.
        </p>
      )}
    </div>
  );
};

export default WarehouseHistory;
