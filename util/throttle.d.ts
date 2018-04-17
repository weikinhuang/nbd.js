export default function throttle<T>(fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T>;
