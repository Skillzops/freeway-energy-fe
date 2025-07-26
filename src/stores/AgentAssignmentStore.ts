import { types, Instance } from "mobx-state-tree";

const AssignedItemModel = types.model({
  id: types.string,
  name: types.string,
  email: types.optional(types.string, ""),
  location: types.optional(types.string, ""),
  price: types.optional(types.string, ""),
});

const AgentAssignmentModel = types.model({
  agentId: types.string,
  customers: types.array(AssignedItemModel),
  products: types.array(AssignedItemModel),
  installers: types.array(AssignedItemModel),
});

const agentAssignmentStore = types
  .model({
    assignments: types.array(AgentAssignmentModel),
  })
  .actions((self) => ({
    // Initialize or get agent assignment
    getOrCreateAgentAssignment(agentId: string) {
      let assignment = self.assignments.find(a => a.agentId === agentId);
      if (!assignment) {
        assignment = AgentAssignmentModel.create({
          agentId,
          customers: [],
          products: [],
          installers: [],
        });
        self.assignments.push(assignment);
      }
      return assignment;
    },

    // Add customers to agent
    addCustomers(agentId: string, customers: any[]) {
      const assignment = this.getOrCreateAgentAssignment(agentId);
      customers.forEach(customer => {
        const existingIndex = assignment.customers.findIndex(c => c.id === customer.id);
        if (existingIndex === -1) {
          assignment.customers.push({
            id: customer.id,
            name: `${customer.firstname} ${customer.lastname}`,
            email: customer.email || "",
          });
        }
      });
    },

    // Remove customers from agent
    removeCustomers(agentId: string, customerIds: string[]) {
      const assignment = self.assignments.find(a => a.agentId === agentId);
      if (assignment) {
        assignment.customers.replace(
          assignment.customers.filter(c => !customerIds.includes(c.id))
        );
      }
    },

    // Add products to agent
    addProducts(agentId: string, products: any[]) {
      const assignment = this.getOrCreateAgentAssignment(agentId);
      products.forEach(product => {
        const existingIndex = assignment.products.findIndex(p => p.id === product.id);
        if (existingIndex === -1) {
          assignment.products.push({
            id: product.id,
            name: product.name,
            price: product.priceRange?.minimumInventoryBatchPrice?.toLocaleString() || "₦0",
          });
        }
      });
    },

    // Remove products from agent
    removeProducts(agentId: string, productIds: string[]) {
      const assignment = self.assignments.find(a => a.agentId === agentId);
      if (assignment) {
        assignment.products.replace(
          assignment.products.filter(p => !productIds.includes(p.id))
        );
      }
    },

    // Add installers to agent
    addInstallers(agentId: string, installers: any[]) {
      const assignment = this.getOrCreateAgentAssignment(agentId);
      installers.forEach(installer => {
        const existingIndex = assignment.installers.findIndex(i => i.id === installer.id);
        if (existingIndex === -1) {
          assignment.installers.push({
            id: installer.id,
            name: `${installer.firstname} ${installer.lastname}`,
            location: installer.location,
          });
        }
      });
    },

    // Remove installers from agent
    removeInstallers(agentId: string, installerIds: string[]) {
      const assignment = self.assignments.find(a => a.agentId === agentId);
      if (assignment) {
        assignment.installers.replace(
          assignment.installers.filter(i => !installerIds.includes(i.id))
        );
      }
    },

    // Get agent assignment
    getAgentAssignment(agentId: string) {
      return self.assignments.find(a => a.agentId === agentId);
    },

    // Clear all assignments for an agent
    clearAgentAssignments(agentId: string) {
      const index = self.assignments.findIndex(a => a.agentId === agentId);
      if (index !== -1) {
        self.assignments.splice(index, 1);
      }
    },

    // Check if all items are assigned for an agent
    isAllAssigned(agentId: string) {
      const assignment = self.assignments.find(a => a.agentId === agentId);
      if (!assignment) return false;
      return assignment.customers.length > 0 && 
             assignment.products.length > 0 && 
             assignment.installers.length > 0;
    },
  }));

export const AgentAssignmentStore = agentAssignmentStore.create({
  assignments: [],
});

export type AgentAssignmentStoreType = Instance<typeof agentAssignmentStore>; 