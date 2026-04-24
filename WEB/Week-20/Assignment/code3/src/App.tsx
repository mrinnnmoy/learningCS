import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Code-splitting — each dashboard page is its own JS chunk, only downloaded on first visit
const OverviewPage = lazy(() => import("./pages/dashboard/OverviewPage"));
const OrdersPage = lazy(() => import("./pages/dashboard/OrdersPage"));
const ProductsPage = lazy(() => import("./pages/dashboard/ProductsPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));

const Fallback = () => (
  <p style={{ padding: "2rem", color: "#64748b" }}>Loading...</p>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<Fallback />}>
                <OverviewPage />
              </Suspense>
            }
          />
          <Route
            path="orders"
            element={
              <Suspense fallback={<Fallback />}>
                <OrdersPage />
              </Suspense>
            }
          />
          <Route
            path="products"
            element={
              <Suspense fallback={<Fallback />}>
                <ProductsPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<Fallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <div style={{ padding: "2rem" }}>
            <h2>404 — Page not found</h2>
          </div>
        }
      />
    </Routes>
  );
}
