import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useCounter from "./useCounter";

describe("useCounter", () => {
  it("initialises with the default value of 0", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("initialises with a custom initial value", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it("increments the count by 1", () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });

  it("decrements the count by 1", () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => result.current.decrement());
    expect(result.current.count).toBe(4);
  });

  it("allows count to go negative", () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.decrement());
    expect(result.current.count).toBe(-1);
  });

  it("resets to the initial value", () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => result.current.increment());
    act(() => result.current.increment());
    act(() => result.current.reset());
    expect(result.current.count).toBe(5);
  });

  it("increments by a specific number", () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.incrementBy(10));
    expect(result.current.count).toBe(10);
  });

  it("handles multiple operations in sequence correctly", () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.increment());
    act(() => result.current.increment());
    act(() => result.current.incrementBy(5));
    act(() => result.current.decrement());
    expect(result.current.count).toBe(6);
  });
});
