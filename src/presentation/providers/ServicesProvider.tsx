import React, { createContext, useContext, useMemo } from "react";
import { Services, createServices } from "@/infrastructure/container";

const ServicesContext = createContext<Services | null>(null);

interface ServicesProviderProps {
  children: React.ReactNode;
  /** Inject a custom Services container (e.g. in tests or Storybook). */
  services?: Services;
}

/**
 * Makes the application's ports available to the UI via React context. This is
 * the dependency-injection boundary: components never import concrete adapters.
 */
export function ServicesProvider({ children, services }: ServicesProviderProps) {
  const value = useMemo(() => services ?? createServices(), [services]);
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider.");
  }
  return context;
}
