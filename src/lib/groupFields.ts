import type { FormField } from "./documentTypes";

export interface FieldGroup {
  label: string | null;
  fields: FormField[];
}

export function groupFields(fields: FormField[]): FieldGroup[] {
  const groups: FieldGroup[] = [];
  let currentGroup: FormField[] = [];
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
