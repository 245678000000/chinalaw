import { describe, it, expect } from "vitest";
import { groupFields } from "@/lib/groupFields";
import { documentTypes } from "@/lib/documentTypes";

describe("groupFields", () => {
  it("should group party fields (Name/IdNumber/Address/Phone) together", () => {
    const civilComplaint = documentTypes.find((d) => d.id === "civil-complaint")!;
    const groups = groupFields(civilComplaint.fields);

    expect(groups.length).toBeGreaterThan(1);
    expect(groups[0].label).toContain("原告");
    expect(groups[0].label).toContain("信息");
    expect(groups[1].label).toContain("被告");
    expect(groups[1].label).toContain("信息");
  });

  it("should preserve all fields without loss", () => {
    for (const doc of documentTypes) {
      const groups = groupFields(doc.fields);
      const totalGroupedFields = groups.reduce((sum, g) => sum + g.fields.length, 0);
      expect(totalGroupedFields).toBe(doc.fields.length);
    }
  });

  it("should handle documents with no party fields", () => {
    const evidenceList = documentTypes.find((d) => d.id === "evidence-list")!;
    const groups = groupFields(evidenceList.fields);
    expect(groups.length).toBeGreaterThan(0);
    const totalFields = groups.reduce((sum, g) => sum + g.fields.length, 0);
    expect(totalFields).toBe(evidenceList.fields.length);
  });

  it("non-party fields should have null label group", () => {
    const civilComplaint = documentTypes.find((d) => d.id === "civil-complaint")!;
    const groups = groupFields(civilComplaint.fields);
    const lastGroup = groups[groups.length - 1];
    expect(lastGroup.label).toBeNull();
    expect(lastGroup.fields.some((f) => f.name === "claims")).toBe(true);
  });
});
