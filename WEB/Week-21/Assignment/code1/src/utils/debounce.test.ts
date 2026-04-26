import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not call the function before the delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();

    expect(fn).not.toHaveBeenCalled();
  });

  it("calls the function after the delay has passed", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resets the timer if called again before the delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    vi.advanceTimersByTime(200); // not enough time
    debounced(); // reset the timer
    vi.advanceTimersByTime(200); // not enough from the second call
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100); // now 300ms has passed since the second call
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("calls the function once even if called many times rapidly", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    debounced();
    debounced();
    debounced();

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("passes the correct arguments to the debounced function", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("hello", 42);
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledWith("hello", 42);
  });
});
