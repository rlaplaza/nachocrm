import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminUsersPage from "./AdminUsersPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

// Mock Supabase client
const mockFrom = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ 
              data: [{ id: "1", user_id: "u1", full_name: "Test User", email: "test@example.com", is_active: true }], 
              error: null 
            })),
          })),
        };
      }
      if (table === "user_roles") {
        return {
          select: vi.fn(() => Promise.resolve({ 
            data: [{ id: "r1", user_id: "u1", role: "admin" }], 
            error: null 
          })),
        };
      }
      return {};
    });
  });

  it("redirects non-admin users", () => {
    mockUseAuth.mockReturnValue({ role: "salesperson" });
    
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AdminUsersPage />
        </QueryClientProvider>
      </BrowserRouter>
    );
    
    expect(screen.queryByText("Gestión de Usuarios")).toBeNull();
  });

  it("renders user management for admins", async () => {
    mockUseAuth.mockReturnValue({ role: "admin" });
    
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AdminUsersPage />
        </QueryClientProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText("Gestión de Usuarios")).toBeDefined();
    expect(screen.getByPlaceholderText(/buscar/i)).toBeDefined();
  });
});
