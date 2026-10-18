import { describe, it, expect } from "vitest";
import { STORE_PLANS, formatLimit, formatPrice } from "@/lib/plans";

// A mirror of mcloud's packages/merchant/src/plans.ts. If this fails, the copy
// was edited: check the source of truth in mcloud and update both together.
describe("store plans", () => {
  it("matches mcloud's limits and prices", () => {
    expect(
      STORE_PLANS.map((p) => [p.id, p.priceKes, p.products, p.monthlyOrders, p.members]),
    ).toEqual([
      ["free", null, 20, 50, 1],
      ["hobby", 795, 200, 500, 3],
      ["pro", 2795, Infinity, Infinity, 10],
    ]);
  });

  it("lets only paid plans apply to the marketplace", () => {
    for (const p of STORE_PLANS) expect(p.marketplace).toBe(p.priceKes !== null);
  });

  it("formats prices and limits for people", () => {
    expect(formatPrice(STORE_PLANS[0])).toBe("Free");
    expect(formatPrice(STORE_PLANS[2])).toBe("KES 2,795");
    expect(formatLimit(Infinity)).toBe("Unlimited");
    expect(formatLimit(500)).toBe("500");
  });
});
