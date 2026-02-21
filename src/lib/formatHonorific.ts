/**
 * Appends "Garu" (or "గారు" in Telugu) honorific to a name,
 * avoiding duplication if the name already ends with it.
 */
export function formatHonorific(
  name: string,
  language: "te" | "en" = "en"
): string {
  const trimmed = name.trim();
  if (!trimmed) return "";

  const suffix = language === "te" ? "గారు" : "Garu";
  const lowerName = trimmed.toLowerCase();
  const lowerSuffix = suffix.toLowerCase();

  if (lowerName.endsWith(lowerSuffix) || lowerName.endsWith("garu") || trimmed.endsWith("గారు")) {
    return trimmed;
  }

  return `${trimmed} ${suffix}`;
}
