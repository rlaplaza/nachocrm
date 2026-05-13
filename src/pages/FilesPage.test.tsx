import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FilesPage from "./FilesPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
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

describe("FilesPage", () => {
  it("renders the Files title and Upload File button", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FilesPage />
      </QueryClientProvider>
    );
    
    expect(screen.getByText("Files")).toBeDefined();
    expect(screen.getByRole("button", { name: /upload file/i })).toBeDefined();
  });
});
