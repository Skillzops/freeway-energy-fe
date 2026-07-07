import {
  DashboardIcon,
  SalesIcon,
  CustomersIcon,
  AgentsIcon,
  ProductsIcon,
  InventoryIcon,
  ContractsIcon,
  InstallerIcon,
  TransactionsIcon,
  WalletIcon,
  SettingsIcon,
  WarehouseIcon,
  AnalyticsIcon,
  InvoiceIcon,
  ReceiptIcon,
  ReportsIcon,
  TaskIcon,
  DevicesIcon,
  CommissionIcon,
} from "./Icons";

export type NavItem = {
  title: string;
  icon: typeof DashboardIcon;
  link: string;
};

/** Admin hamburger menu — grouped sections (order within each group matters). */
export const adminNavGroups: NavItem[][] = [
  [{ title: "Dashboard", icon: DashboardIcon, link: "/dashboard" }],
  [
    { title: "Customers", icon: CustomersIcon, link: "/customers" },
    { title: "Agents", icon: AgentsIcon, link: "/agents" },
    { title: "Sales", icon: SalesIcon, link: "/sales" },
    { title: "Tasks", icon: TaskIcon, link: "/tasks" },
  ],
  [
    { title: "Devices", icon: DevicesIcon, link: "/devices" },
    { title: "Products", icon: ProductsIcon, link: "/products" },
    { title: "Inventory", icon: InventoryIcon, link: "/inventory" },
    { title: "Warehouses", icon: WarehouseIcon, link: "/warehouses" },
  ],
  [
    { title: "Contracts", icon: ContractsIcon, link: "/contracts" },
    { title: "Invoices", icon: InvoiceIcon, link: "/invoices" },
    { title: "Receipts", icon: ReceiptIcon, link: "/receipts" },
  ],
  [
    { title: "Analytics", icon: AnalyticsIcon, link: "/analytics" },
    { title: "Reports", icon: ReportsIcon, link: "/reports" },
    { title: "Settings", icon: SettingsIcon, link: "/settings" },
  ],
];

/** Flat list derived from grouped admin nav (for legacy consumers). */
export const navData: NavItem[] = adminNavGroups.flat();

export const AgentNavData = [
  {
    title: "Dashboard",
    icon: DashboardIcon,
    link: "/agent/dashboard",
  },
  {
    title: "Customers",
    icon: CustomersIcon,
    link: "/agent/customers",
  },
  {
    title: "Sales",
    icon: SalesIcon,
    link: "/agent/sales",
  },
  {
    title: "Tasks",
    icon: TaskIcon,
    link: "/agent/tasks",
  },
  {
    title: "Devices",
    icon: DevicesIcon,
    link: "/agent/devices",
  },
  {
    title: "Products",
    icon: ProductsIcon,
    link: "/agent/products",
  },
  {
    title: "Wallet",
    icon: WalletIcon,
    link: "/agent/wallets",
  },
  {
    title: "Transactions",
    icon: TransactionsIcon,
    link: "/agent/transactions",
  },
  {
    title: "Commission",
    icon: CommissionIcon,
    link: "/agent/commissions",
  },
  {
    title: "Installers",
    icon: InstallerIcon,
    link: "/agent/installers",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    link: "/agent/settings",
  },
];

export const InstallerNavData = [
  {
    title: "Dashboard",
    icon: DashboardIcon,
    link: "/installer/dashboard",
  },
  {
    title: "Installer",
    icon: InstallerIcon,
    link: "/installer/installer",
  },
  {
    title: "Commission",
    icon: CommissionIcon,
    link: "/installer/commissions",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    link: "/installer/settings",
  },
];
