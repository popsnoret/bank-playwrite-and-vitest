import { describe, it, expect } from "vitest";
import { validateAmount } from "../backend/validateAmount.js";

describe("validateAmount", () => {
  it("godkänner ett positivt belopp", () => {
    expect(validateAmount(100)).toBe(true);
  });

  it("avvisar 0", () => {
    expect(validateAmount(0)).toBe(false);
  });

  it("avvisar negativa belopp", () => {
    expect(validateAmount(-100)).toBe(false);
  });

  it("avvisar NaN", () => {
    expect(validateAmount(NaN)).toBe(false);
  });

  it("avvisar Infinity", () => {
    expect(validateAmount(Infinity)).toBe(false);
  });
});
