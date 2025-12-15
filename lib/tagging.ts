export function slugifyTagValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function prefixedTag(prefix: string, value: string): string | undefined {
  const slug = slugifyTagValue(value);
  if (!slug) return undefined;
  return `${prefix}-${slug}`;
}

export function mergeTags(...tagLists: Array<ReadonlyArray<string> | undefined>): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const list of tagLists) {
    if (!list) continue;
    for (const tag of list) {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
      merged.push(trimmed);
    }
  }

  return merged;
}
