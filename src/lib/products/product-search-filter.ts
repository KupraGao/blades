/**
 * Values without ILIKE wildcards or PostgREST reserved characters.
 * Those keep the existing unquoted filter, including ordinary Admin searches.
 */
function isRawProductSearch(value: string): boolean {
  return /^[^\s\\%_*",.():]+$/.test(value);
}

/**
 * Quote a contains-pattern so `%`, `_`, `*`, commas, and parentheses stay
 * inside one PostgREST `.or()` value instead of changing the filter syntax.
 */
function quoteContainsIlike(value: string): string {
  const likeLiteral = value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/\*/g, "\\*");
  const postgrestLiteral = likeLiteral
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');

  return `"%${postgrestLiteral}%"`;
}

export function productSearchOrFilter(search: string): string | null {
  if (isRawProductSearch(search)) {
    return `title.ilike.%${search}%,knife_type.ilike.%${search}%,blade_steel.ilike.%${search}%,handle_material.ilike.%${search}%,country.ilike.%${search}%`;
  }

  const normalized = search.replace(/\0/g, "");
  if (!normalized) return null;

  const pattern = quoteContainsIlike(normalized);
  return `title.ilike.${pattern},knife_type.ilike.${pattern},blade_steel.ilike.${pattern},handle_material.ilike.${pattern},country.ilike.${pattern}`;
}
