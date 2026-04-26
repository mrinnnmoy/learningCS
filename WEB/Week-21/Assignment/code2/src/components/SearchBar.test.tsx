import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import SearchBar from "./SearchBar";

function SearchBarWrapper({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  return <SearchBar value={value} onChange={setValue} onSearch={onSearch} />;
}

describe("SearchBar", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders a search input", () => {
    render(<SearchBarWrapper onSearch={() => {}} />);
    expect(
      screen.getByRole("searchbox", { name: "Search" }),
    ).toBeInTheDocument();
  });

  it("does not call onSearch immediately when the user types", () => {
    const onSearch = vi.fn();

    render(<SearchBarWrapper onSearch={onSearch} />);
    const input = screen.getByRole("searchbox", { name: "Search" });

    fireEvent.change(input, { target: { value: "lap" } });

    // No time advanced — timer hasn't fired yet
    expect(onSearch).not.toHaveBeenCalledWith("lap");
  });

  it("calls onSearch with the current value after 300ms", () => {
    const onSearch = vi.fn();

    render(<SearchBarWrapper onSearch={onSearch} />);
    const input = screen.getByRole("searchbox", { name: "Search" });

    fireEvent.change(input, { target: { value: "laptop" } });
    vi.advanceTimersByTime(300);

    expect(onSearch).toHaveBeenLastCalledWith("laptop");
  });

  it("resets the debounce timer when the user types again quickly", () => {
    const onSearch = vi.fn();

    render(<SearchBarWrapper onSearch={onSearch} />);
    const input = screen.getByRole("searchbox", { name: "Search" });

    fireEvent.change(input, { target: { value: "a" } });
    vi.advanceTimersByTime(200); // not enough

    fireEvent.change(input, { target: { value: "ab" } }); // resets timer
    vi.advanceTimersByTime(200); // still not enough from the second change
    expect(onSearch).not.toHaveBeenCalledWith("ab");

    vi.advanceTimersByTime(100); // now 300ms since the second change
    expect(onSearch).toHaveBeenLastCalledWith("ab");
  });
});
