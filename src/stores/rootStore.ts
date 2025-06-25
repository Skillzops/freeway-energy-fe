import { ProductStore } from "./ProductStore";
import { ContractStore } from "./ContractStore";
import { SaleStore } from "./SaleStore";

function createRootStore() {
  const rootStore = {
    productStore: ProductStore,
    contractStore: ContractStore,
    saleStore: SaleStore,
  };

  return rootStore;
}

const rootStore = createRootStore();
export default rootStore;
