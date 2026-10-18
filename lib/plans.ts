/**
 * Store plans, as the MCloud store app sells them. A copy of the limits and
 * prices in mcloud's packages/merchant/src/plans.ts (PLAN_LIMITS,
 * PLAN_PRICE_KES), which is the source of truth: change a number there first,
 * then here. lib/plans.test.ts pins the copy so a drift is a deliberate edit.
 *
 * `marketplace` is policy, not a plan feature in that file: only paid stores
 * may apply to be listed on Reach, and listing is by approval.
 */

export type StorePlan = {
  id: "free" | "hobby" | "pro";
  name: string;
  /** KES per month. Null for the free plan, which is not purchasable. */
  priceKes: number | null;
  /** Infinity for no limit. */
  products: number;
  monthlyOrders: number;
  members: number;
  customDomain: boolean;
  removeBranding: boolean;
  prioritySupport: boolean;
  /** May apply to the Reach marketplace. */
  marketplace: boolean;
};

export const STORE_PLANS: StorePlan[] = [
  {
    id: "free",
    name: "Free",
    priceKes: null,
    products: 20,
    monthlyOrders: 50,
    members: 1,
    customDomain: false,
    removeBranding: false,
    prioritySupport: false,
    marketplace: false,
  },
  {
    id: "hobby",
    name: "Hobby",
    priceKes: 795,
    products: 200,
    monthlyOrders: 500,
    members: 3,
    customDomain: true,
    removeBranding: false,
    prioritySupport: false,
    marketplace: true,
  },
  {
    id: "pro",
    name: "Pro",
    priceKes: 2795,
    products: Infinity,
    monthlyOrders: Infinity,
    members: 10,
    customDomain: true,
    removeBranding: true,
    prioritySupport: true,
    marketplace: true,
  },
];

/** "KES 795", or "Free". */
export function formatPrice(plan: StorePlan) {
  return plan.priceKes === null ? "Free" : `KES ${plan.priceKes.toLocaleString("en-KE")}`;
}

/** "200", or "Unlimited". */
export function formatLimit(n: number) {
  return Number.isFinite(n) ? n.toLocaleString("en-KE") : "Unlimited";
}
