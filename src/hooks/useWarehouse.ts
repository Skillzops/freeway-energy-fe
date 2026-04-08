import { useContext } from "react";
import { WarehouseContext } from "../contexts/WarehouseContextValue";

export default function useWarehouse() {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error("useWarehouse must be used within a WarehouseProvider");
  }
  return context;
}
