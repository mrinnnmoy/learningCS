import { useState } from "react";

interface UseCounterResult {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  incrementBy: (n: number) => void;
}

export default function useCounter(initialValue = 0): UseCounterResult {
  const [count, setCount] = useState<number>(initialValue);

  const increment = (): void => setCount((c) => c + 1);
  const decrement = (): void => setCount((c) => c - 1);
  const reset = (): void => setCount(initialValue);
  const incrementBy = (n: number): void => setCount((c) => c + n);

  return { count, increment, decrement, reset, incrementBy };
}
