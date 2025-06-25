import { Meta, StoryFn } from "@storybook/react";
import TabComponent from "./TabComponent";
import { TabComponentProps } from "./TabComponent";
import { MemoryRouter } from "react-router-dom";

const tabNames = [
  { name: "Product Details", key: "productDetails" },
  { name: "Stats", key: "stats" },
  { name: "Inventory Details", key: "inventoryDetails" },
  { name: "Customers", key: "customers" },
];

// Sample data fetched from endpoint
const fetchedData = {
  productDetails: [
    {
      id: 1,
      name: "Product A",
      description: "High-quality widget",
      price: "$10.99",
    },
    {
      id: 2,
      name: "Product B",
      description: "Affordable gadget",
      price: "$5.49",
    },
  ],
  stats: [
    { metric: "Views", value: 340 },
    { metric: "Sales", value: 120 },
    { metric: "Returns", value: 10 },
  ],
  inventoryDetails: [
    { item: "Product A", stock: 150, location: "Warehouse 1" },
    { item: "Product B", stock: 200, location: "Warehouse 2" },
    { item: "Product C", stock: 50, location: "Warehouse 3" },
  ],
  customers: [
    {
      id: 101,
      name: "Uche",
      email: "uche@example.com",
      purchaseHistory: ["Product A", "Product B"],
    },
  ],
};

export default {
  title: "Components/Tab",
  component: TabComponent,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

const Template: StoryFn<TabComponentProps> = (args) => {
  return <TabComponent {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  tabs: tabNames.map(({ name, key }) => ({
    name,
    key,
    count: fetchedData[key as keyof typeof fetchedData].length,
  })),
  onTabSelect: (key: string) => console.log("Selected tab:", key),
};
