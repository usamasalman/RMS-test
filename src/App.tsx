/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RiskRegister from "./pages/RiskRegister";
import RiskDetail from "./pages/RiskDetail";
import NewRisk from "./pages/NewRisk";
import ControlLibrary from "./pages/ControlLibrary";
import TreatmentMonitor from "./pages/TreatmentMonitor";
import KRIs from "./pages/KRIs";
import Documents from "./pages/Documents";
import ReportsView from "./pages/ReportsView";
import Admin from "./pages/Admin";
import AuditLog from "./pages/AuditLog";
import AssetRegister from "./pages/AssetRegister";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import UserGuide from "./pages/UserGuide";
import { DataProvider } from "./store/DataContext";
import { AuthProvider, useAuth } from "./store/AuthContext";
import AuthPage from "./pages/Auth";
import { Loader2 } from "lucide-react";
import WelcomeModal from "./components/WelcomeModal";

function ProtectedRoutes() {
  const { isAuthenticated, isLoading, isFirstLogin, dismissWelcome } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading GRC Platform...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <DataProvider>
      <WelcomeModal open={isFirstLogin} onClose={dismissWelcome} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="risks" element={<RiskRegister />} />
          <Route path="risks/new" element={<NewRisk />} />
          <Route path="risks/:id/edit" element={<NewRisk />} />
          <Route path="risks/:id" element={<RiskDetail />} />
          <Route path="controls" element={<ControlLibrary />} />
          <Route path="treatments" element={<TreatmentMonitor />} />
          <Route path="kris" element={<KRIs />} />
          <Route path="documents" element={<Documents />} />
          <Route path="reports" element={<ReportsView />} />
          <Route path="guide" element={<UserGuide />} />
          <Route path="admin" element={<Admin />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="assets" element={<AssetRegister />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
