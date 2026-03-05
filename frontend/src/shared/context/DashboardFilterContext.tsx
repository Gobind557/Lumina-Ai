import { createContext, useContext, useState, type ReactNode } from "react";

type WeekOffset = 0 | 1 | 2;

interface DashboardFilterContextValue {
  weekOffset: WeekOffset;
  setWeekOffset: (offset: WeekOffset) => void;
}

const DashboardFilterContext = createContext<DashboardFilterContextValue | null>(
  null,
);

export function DashboardFilterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [weekOffset, setWeekOffset] = useState<WeekOffset>(0);

  return (
    <DashboardFilterContext.Provider value={{ weekOffset, setWeekOffset }}>
      {children}
    </DashboardFilterContext.Provider>
  );
}

export function useDashboardFilters(): DashboardFilterContextValue {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) {
    throw new Error(
      "useDashboardFilters must be used within a DashboardFilterProvider",
    );
  }
  return ctx;
}

