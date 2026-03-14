import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { IndexPage } from "./pages/IndexPage";
import { Dashboard } from "./pages/Dashboard";
import { Portfolio } from "./pages/Portfolio";
import { Transactions } from "./pages/Transactions";
import { Analytics } from "./pages/Analytics";
import { DeFi } from "./pages/DeFi";
import { Alerts } from "./pages/Alerts";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: IndexPage },
      { path: "dashboard", Component: Dashboard },
      { path: "portfolio", Component: Portfolio },
      { path: "transactions", Component: Transactions },
      { path: "analytics", Component: Analytics },
      { path: "defi", Component: DeFi },
      { path: "alerts", Component: Alerts },
      { path: "settings", Component: Settings },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
