export const BILLING_ENTITLEMENTS_UPDATED_EVENT =
	"billing-entitlements-updated";

export function dispatchBillingEntitlementsUpdated(): void {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(BILLING_ENTITLEMENTS_UPDATED_EVENT));
}
