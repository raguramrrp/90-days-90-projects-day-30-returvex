import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ReturnsPage } from "./pages/ReturnsPage";
import { RootCausesPage } from "./pages/RootCausesPage";
import { PredictionsPage } from "./pages/PredictionsPage";
import { FinancialPage } from "./pages/FinancialPage";
import { ReportsPage } from "./pages/ReportsPage";
import { DataManagementPage } from "./pages/DataManagementPage";
import { SettingsPage } from "./pages/SettingsPage";

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const [period, setPeriod] = useState<string>("30d");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen bg-[#F3F6FA] overflow-hidden">
          {/* Left Navigation Sidebar */}
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Right Main Application Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header
              selectedPeriod={period}
              onPeriodChange={setPeriod}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Scrollable Workspace */}
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route
                  path="/"
                  element={<DashboardPage period={period} searchQuery={searchQuery} />}
                />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/root-causes" element={<RootCausesPage />} />
                <Route path="/predictions" element={<PredictionsPage />} />
                <Route path="/financial" element={<FinancialPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/data-management" element={<DataManagementPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
