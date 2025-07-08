import { useEffect, useState } from "react";
import { useRef } from "react";

//debounce by value

export function useDebounce<T>(val: T, delay: number = 500): T {
  //state
  const [debouncedValue, setDebouncedValue] = useState<T>(val);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(val), delay | 1000);

    return () => clearInterval(timer);
  }, [val, delay]);

  return debouncedValue;
}

//debounce by function

export function useDebounceFn<T extends (...args: any[]) => void>(callback: T, delay: number = 500): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setTimeout(() => callback(...args), 0); // ✅ Prevents React warning
    }, delay);
  };

  return debouncedFn as T;
}
