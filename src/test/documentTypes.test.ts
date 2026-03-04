import { describe, it, expect } from "vitest";
import { documentTypes, categories, type DocumentType } from "@/lib/documentTypes";

describe("documentTypes", () => {
  it("should have at least 30 document types", () => {
    expect(documentTypes.length).toBeGreaterThanOrEqual(30);
  });

  it("should have unique ids for all document types", () => {
    const ids = documentTypes.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every document type should reference a valid category", () => {
    const validCategories = categories.map((c) => c.id);
    for (const doc of documentTypes) {
      expect(validCategories).toContain(doc.category);
    }
  });

  it("every document type should have at least one required field", () => {
    for (const doc of documentTypes) {
      const requiredFields = doc.fields.filter((f) => f.required);
      expect(requiredFields.length).toBeGreaterThan(0);
    }
  });

  it("select fields should have options defined", () => {
    for (const doc of documentTypes) {
      const selectFields = doc.fields.filter((f) => f.type === "select");
      for (const field of selectFields) {
        expect(field.options).toBeDefined();
        expect(field.options!.length).toBeGreaterThan(0);
      }
    }
  });

  it("every document type should have name, description, and icon", () => {
    for (const doc of documentTypes) {
      expect(doc.name).toBeTruthy();
      expect(doc.description).toBeTruthy();
      expect(doc.icon).toBeDefined();
    }
  });

  it("field names should be unique within each document type", () => {
    for (const doc of documentTypes) {
      const names = doc.fields.map((f) => f.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    }
  });
});

describe("categories", () => {
  it("should have 4 categories", () => {
    expect(categories).toHaveLength(4);
  });

  it("should have litigation, contract, family, and corporate", () => {
    const ids = categories.map((c) => c.id);
    expect(ids).toContain("litigation");
    expect(ids).toContain("contract");
    expect(ids).toContain("family");
    expect(ids).toContain("corporate");
  });

  it("every category should have a label and description", () => {
    for (const cat of categories) {
      expect(cat.label).toBeTruthy();
      expect(cat.description).toBeTruthy();
    }
  });

  it("every category should have at least one document", () => {
    for (const cat of categories) {
      const docs = documentTypes.filter((d) => d.category === cat.id);
      expect(docs.length).toBeGreaterThan(0);
    }
  });
});
