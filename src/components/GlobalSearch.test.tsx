import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalSearch } from "./GlobalSearch";

const app = vi.hoisted(() => ({
  searchListings: vi.fn(),
  selectListing: vi.fn(),
  navigateListings: vi.fn(),
}));

vi.mock("../context/AppContext", () => ({
  useApp: () => ({ lang: "ar", ...app }),
}));

const emptyPage = {
  content: [],
  page: 0,
  size: 8,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

describe("GlobalSearch request control", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    app.searchListings.mockReset().mockResolvedValue(emptyPage);
    app.selectListing.mockReset();
    app.navigateListings.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("debounces rapid typing into one ranked API request", async () => {
    render(<GlobalSearch />);
    fireEvent.click(screen.getByRole("button", { name: "البحث في العروض" }));
    const input = screen.getByPlaceholderText(/ابحث في العروض/);

    fireEvent.change(input, { target: { value: "ح" } });
    fireEvent.change(input, { target: { value: "حد" } });
    fireEvent.change(input, { target: { value: "حدي" } });
    fireEvent.change(input, { target: { value: "حديقة" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(app.searchListings).toHaveBeenCalledTimes(1);
    expect(app.searchListings).toHaveBeenCalledWith(
      { q: "حديقة", size: 8, sort: "relevance,desc" },
      expect.any(AbortSignal),
    );
  });

  it("aborts the previous request when the query changes", async () => {
    render(<GlobalSearch />);
    fireEvent.click(screen.getByRole("button", { name: "البحث في العروض" }));
    const input = screen.getByPlaceholderText(/ابحث في العروض/);

    fireEvent.change(input, { target: { value: "villa" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    const firstSignal = app.searchListings.mock.calls[0][1] as AbortSignal;
    expect(firstSignal.aborted).toBe(false);

    fireEvent.change(input, { target: { value: "villa cairo" } });
    expect(firstSignal.aborted).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(app.searchListings).toHaveBeenCalledTimes(2);
    const secondSignal = app.searchListings.mock.calls[1][1] as AbortSignal;
    expect(secondSignal.aborted).toBe(false);
  });
});
