import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Sales from "./Pages/Sales";
// import Transactions from "./Pages/Transactions";
import Customers from "./Pages/Customers";
import Agent from "./Pages/Agent";
import Products from "./Pages/Products";
import Inventory from "./Pages/Inventory";
import Devices from "./Pages/Devices";
import Contracts from "./Pages/Contracts";
import Settings from "./Pages/Settings";
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

function App() {
  return (
    <WarehouseProvider>
      <ToastContainer autoClose={2000} />
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorPage error={error} resetErrorBoundary={resetErrorBoundary} />
        )}
      >
        <Routes>
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
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/warehouses/:id" element={<WarehouseDetail />} />
            <Route path="/transfers" element={<Transfers />} />
            {/* Other protected routes */}
          </Route>

          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/create-password/:id/:token"
            element={<CreatePassword />}
          />
          <Route
            path="/reset-password/:id/:token"
            element={<CreatePassword />}
          />

          {/* Fallback Route */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </ErrorBoundary>
    </WarehouseProvider>
  );
}

export default App;
