/** Which header surfaces show the assistant. Checkout keeps the existing bar. */
export function beyondMasterHeaderVisibility(checkout: boolean) {
  return {
    launcher: !checkout,
    panel: !checkout,
  };
}
