import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const isHidden = false;
    expect(cn("base", isHidden && "hidden", "visible")).toBe("base visible");
  });

  it("should resolve tailwind conflicts (last wins)", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
  });

  it("should handle undefined and null", () => {
    expect(cn("base", undefined, null, "extra")).toBe("base extra");
  });
});
