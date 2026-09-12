export function escapePostgrestSearchTerm(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/[(),]/g, "\\$&")
    .replace(/[%_]/g, "\\$&")
}