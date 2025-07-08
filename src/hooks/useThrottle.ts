export function useThrottle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let lastFunc: number | null = null;
  let lastRan: number | null = null;

  return function (this: any, ...args: any[]) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }
      lastFunc = window.setTimeout(() => {
        if (Date.now() - (lastRan ?? 0) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - (lastRan ?? 0)));
    }
  } as T;
}
