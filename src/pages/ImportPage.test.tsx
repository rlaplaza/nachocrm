import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ImportPage from "./ImportPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Papa from "papaparse";
import * as supabaseClient from "@/integrations/supabase/client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

// Mock PapaParse
vi.mock("papaparse", () => ({
  default: {
    parse: vi.fn((file, config) => {
      config.complete({
        data: [
          { name: "Company A", email: "a@example.com" },
          { name: "Company B", email: "b@example.com" },
        ],
        meta: { fields: ["name", "email"] },
      });
    }),
  },
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("ImportPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Import Data title", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ImportPage />
      </QueryClientProvider>
    );
    
    expect(screen.getByText("Import Data")).toBeDefined();
  });

  it("handles CSV file upload and shows preview", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ImportPage />
      </QueryClientProvider>
    );

    const file = new File(["name,email\nCompany A,a@example.com"], "test.csv", { type: "text/csv" });
    const input = screen.getByLabelText(/select file/i);
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(Papa.parse).toHaveBeenCalled();
      expect(screen.getByText("Company A")).toBeDefined();
      expect(screen.getByText("a@example.com")).toBeDefined();
    });
  });

  it("submits the data to Supabase when Import is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ImportPage />
      </QueryClientProvider>
    );

    // Upload file first
    const file = new File(["name,email\nCompany A,a@example.com"], "test.csv", { type: "text/csv" });
    const input = screen.getByLabelText(/select file/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Company A")).toBeDefined();
    });

    const importButton = screen.getByRole("button", { name: /import/i });
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(supabaseClient.supabase.from).toHaveBeenCalledWith("companies");
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Success",
        description: expect.stringMatching(/successfully imported/i),
      }));
    });
  });
});
