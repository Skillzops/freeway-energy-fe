import { createContext } from "react";
import type { Warehouse } from "../data/warehouseData";

export interface WarehouseContextType {
  warehouses: Warehouse[];
  isLoading: boolean;
  error: any;
  mutate: () => void;
  addWarehouse: (warehouse: Omit<Warehouse, "id">) => Promise<void>;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  toggleWarehouseStatus: (id: string) => Promise<void>;
}

export const WarehouseContext = createContext<WarehouseContextType | undefined>(
  undefined
);
