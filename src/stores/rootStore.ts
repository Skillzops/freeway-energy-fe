import { ProductStore } from "./ProductStore";
import { ContractStore } from "./ContractStore";
import { SaleStore } from "./SaleStore";
import { AgentAssignmentStore } from "./AgentAssignmentStore";

function createRootStore() {
  const rootStore = {
    productStore: ProductStore,
    contractStore: ContractStore,
    saleStore: SaleStore,
    agentAssignmentStore: AgentAssignmentStore,
  };

  return rootStore;
}

const rootStore = createRootStore();
export default rootStore;
