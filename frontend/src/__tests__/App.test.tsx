import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { IndiaMap } from "../components/IndiaMap";

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("RETURVEX Frontend Interface Suite", () => {
  it("renders header with RETURVEX branding, live data badge, and search", () => {
    const handlePeriod = vi.fn();
    const handleSearch = vi.fn();
    renderWithProviders(
      <Header
        selectedPeriod="30d"
        onPeriodChange={handlePeriod}
        searchQuery=""
        onSearchChange={handleSearch}
      />
    );

    expect(screen.getByText("RETURVEX")).toBeInTheDocument();
    expect(screen.getByText("Returns Intelligence")).toBeInTheDocument();
    expect(screen.getByText("Live Data")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search anything...")).toBeInTheDocument();
    expect(screen.getByText("Export Report")).toBeInTheDocument();
  });

  it("renders sidebar with all 9 core operational modules and promo card", () => {
    renderWithProviders(<Sidebar collapsed={false} onToggleCollapse={vi.fn()} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Returns")).toBeInTheDocument();
    expect(screen.getByText("Root Causes")).toBeInTheDocument();
    expect(screen.getByText("Prediction")).toBeInTheDocument();
    expect(screen.getByText("Financial")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Data Mgmt")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Reduce Returns")).toBeInTheDocument();
    expect(screen.getByText("Boost Profitability")).toBeInTheDocument();
  });

  it("renders the SVG India map component with state regions", () => {
    const { container } = renderWithProviders(<IndiaMap activeState="Maharashtra" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelectorAll("path").length).toBeGreaterThan(5);
  });
});
