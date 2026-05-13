import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SettingsPage from "./SettingsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user-id" } }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("SettingsPage", () => {
  it("renders the Settings title and tabs", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsPage />
      </QueryClientProvider>
    );
    
    expect(screen.getByText("Settings")).toBeDefined();
    expect(screen.getByRole("tab", { name: /general/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /lead sources/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /tags/i })).toBeDefined();
  });

  it("renders the appearance setting in General tab", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsPage />
      </QueryClientProvider>
    );
    
    expect(screen.getByText("Appearance")).toBeDefined();
    expect(screen.getByText("Switch between light and dark themes")).toBeDefined();
  });
});
