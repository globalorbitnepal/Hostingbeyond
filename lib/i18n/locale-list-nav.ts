/**
 * Pure keyboard/focus navigation for the country & language listbox.
 *
 * Kept out of the component so the accessibility contract is unit-testable
 * without a browser. Indices always land inside `[0, count)` and a move on an
 * empty list is a no-op.
 */

export type ListMoveKey = "ArrowDown" | "ArrowUp" | "Home" | "End";

function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(0, Math.trunc(index)), count - 1);
}

/** Next active index for a key, or `null` when the key is not a move key. */
export function nextActiveIndex(
  key: string,
  currentIndex: number,
  count: number,
): number | null {
  if (count <= 0) return null;
  const current = clampIndex(currentIndex, count);
  switch (key) {
    case "ArrowDown":
      return (current + 1) % count;
    case "ArrowUp":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

export function isListMoveKey(key: string): key is ListMoveKey {
  return (
    key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End"
  );
}

/**
 * Index to activate after the query changes. A changed query replaces the
 * result set, so the cursor returns to the top — but it must never point past
 * the end of a shorter list.
 */
export function indexAfterQueryChange(
  previousCount: number,
  nextCount: number,
  currentIndex: number,
): number {
  if (nextCount <= 0) return 0;
  if (previousCount === nextCount) return clampIndex(currentIndex, nextCount);
  return 0;
}
