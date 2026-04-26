import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

/**
 * Hydration-safe hook that returns `true` once the component has mounted
 * on the client. During SSR (and the initial client render before hydration
 * completes) it returns `false`, preventing theme-dependent flicker.
 *
 * Uses `useSyncExternalStore` instead of the `useEffect + useState` pattern
 * to satisfy the `react-hooks/set-state-in-effect` lint rule.
 */
export default function useMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, getTrue, getFalse);
}
