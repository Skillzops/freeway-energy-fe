import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import AgentHome from "./Pages/Agent/Home";
import InstallerHome from "./Pages/Installer/Home";


import Sales from "./Pages/Sales";
import AgentSales from "./Pages/Agent/Sales";

// import Transactions from "./Pages/Transactions";
import Customers from "./Pages/Customers";
import AgentCustomers from "./Pages/Agent/Customers";

import Agent from "./Pages/Agent";
import Products from "./Pages/Products";
import AgentProducts from "./Pages/Agent/Products";

import Inventory from "./Pages/Inventory";
import Devices from "./Pages/Devices";
import AgentDevices from "./Pages/Agent/Devices";

import Contracts from "./Pages/Contracts";
import Settings from "./Pages/Settings";
import AgentSettings from "./Pages/Agent/Settings";


import Warehouses from "./Pages/Warehouses";
import WarehouseDetail from "./Pages/WarehouseDetail";
import Transfers from "./Pages/Transfers";
import LoginPage from "./Pages/LoginPage";
import CreatePassword from "./Pages/CreatePassword";
import PageNotFound from "./Pages/PageNotFound";
import "./index.css";
import ProtectedRouteWrapper from "./Context/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "./Pages/ErrorPage";
import { WarehouseProvider } from "./contexts/WarehouseContext";
import Dashboard from "./Pages/Dashboard";
import Reports from "./Pages/Reports";
import Installer from "./Pages/Installer/Installer";
import AgentInstaller from "./Pages/Agent/Installer";

import InstallerCommissions from "./Pages/Installer/AgentCommissions";
import AgentCommissions from "./Pages/Agent/AgentCommissions";

import InstallerSettings from "./Pages/Installer/Settings";
import InstallerDashboard from "./Pages/Installer/Dashboard";
import AgentDashboard from "./Pages/Agent/Dashboard";
import Transactions from "./Pages/Agent/Transactions";
import Tasks from "./Pages/Agent/Tasks";
import Wallets from "./Pages/Agent/Wallet";
import WareHouses from "./Pages/Agent/WareHouse";
import InstallerLoginPage from "./Pages/Installer/LoginPage";
import AgentLoginPage from "./Pages/Agent/LoginPage";

function App() {
  return (
    <>
      <ToastContainer autoClose={2000} />
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorPage error={error} resetErrorBoundary={resetErrorBoundary} />
        )}
      >
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/agent/login" element={<AgentLoginPage />} />
          <Route path="/installer/login" element={<InstallerLoginPage />} />
          <Route
            path="/create-password/:id/:token"
            element={<CreatePassword />}
          />
          <Route
            path="/reset-password/:id/:token"
            element={<CreatePassword />}
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRouteWrapper />}>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sales/*" element={<Sales />} />
            {/* <Route path="/transactions/*" element={<Transactions />} /> */}
            <Route path="/customers/*" element={<Customers />} />
            <Route path="/agents/*" element={<Agent />} />
            <Route path="/products/*" element={<Products />} />
            <Route path="/inventory/*" element={<Inventory />} />
            <Route path="/devices/*" element={<Devices />} />
            <Route path="/contracts/*" element={<Contracts />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/warehouses" element={<WarehouseProvider><Warehouses /></WarehouseProvider>} />
            <Route path="/warehouses/:id" element={<WarehouseProvider><WarehouseDetail /></WarehouseProvider>} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/reports" element={<Reports />} />


            {/* //INSTALLER ROUTE */}
            <Route path="/installer/home" element={<InstallerHome />} />
            <Route path="/installer/dashboard" element={<InstallerDashboard />} />
            <Route path="/installer/installer/*" element={<Installer />} />
            <Route path="/installer/commissions/*" element={<InstallerCommissions />} />
            <Route path="/installer/settings/*" element={<InstallerSettings />} />

            {/* // AGENT ROUTE */}
            <Route path="/agent/home" element={<AgentHome />} />
            {<Route path="/agent/dashboard" element={<AgentDashboard />} />}
            <Route path="/agent/sales/*" element={<AgentSales />} />
            {<Route path="/agent/transactions/*" element={<Transactions />} />}
            <Route path="/agent/customers/*" element={<AgentCustomers />} />
            <Route path="/agent/commissions/*" element={<AgentCommissions />} />
            <Route path="/agent/tasks/*" element={<Tasks />} />

            <Route path="/agent/installers/*" element={<AgentInstaller />} />
            <Route path="/agent/products/*" element={<AgentProducts />} />
            <Route path="/agent/wallets/*" element={<Wallets />} />
            <Route path="/agent/devices/*" element={<AgentDevices />} />
            <Route path="/agent/settings/*" element={<AgentSettings />} />
            <Route path="/agent/warehouses/*" element={<WareHouses />} />
            




            {/* Other protected routes */}
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
}

export default App;
