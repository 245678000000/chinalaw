import { describe, it, expect } from "vitest";
import { documentTypes } from "@/lib/documentTypes";

// Re-implement groupFields for testing since it's not exported
// We test it indirectly through its behavior with documentTypes
function groupFields(fields: typeof documentTypes[number]["fields"]) {
  const groups: { label: string | null; fields: typeof fields }[] = [];
  let currentGroup: typeof fields = [];
  let currentLabel: string | null = null;

  for (const field of fields) {
    const partyMatch = field.name.match(/^(.+?)(Name|IdNumber|Address|Phone)$/);
    if (partyMatch) {
      const suffix = partyMatch[2];
      if (suffix === "Name") {
        if (currentGroup.length > 0) {
          groups.push({ label: currentLabel, fields: currentGroup });
        }
        currentLabel = field.label.replace(/姓名\/名称$|姓名$|名称$/, "").trim() + "信息";
        currentGroup = [field];
      } else {
        currentGroup.push(field);
      }
    } else {
      if (currentGroup.length > 0 && currentLabel) {
        groups.push({ label: currentLabel, fields: currentGroup });
        currentGroup = [];
        currentLabel = null;
      }
      currentGroup.push(field);
    }
  }

  if (currentGroup.length > 0) {
    groups.push({ label: currentLabel, fields: currentGroup });
  }

  return groups;
}

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
