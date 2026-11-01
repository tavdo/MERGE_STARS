export type MuseumBoundaryCapability = "generate" | "pulse" | "likes";
export type MuseumBoundaryState = "loading" | "unavailable" | "session-required" | "permission-denied" | "invalid" | "error";

// Consume only the existing fail-closed CORE boundary contract. An unexpected
// 200 never enables generation, creates a task, or supplies fabricated counts.
// A real task/Pulse projection needs its authoritative contract before release.
export function museumBoundaryState(capability: MuseumBoundaryCapability, status: number, body: unknown): MuseumBoundaryState {
  if (status === 401) return "session-required";
  if (status === 403) return "permission-denied";
  if (status === 503 && body && typeof body === "object" && !Array.isArray(body)) {
    const value = body as Record<string, unknown>;
    if (value.capability === capability && value.available === false && value.source_of_truth === "MERGE_CORE" && value.status === "DEPENDENCY_REQUIRED" && value.error === "CORE_DEPENDENCY_REQUIRED") return "unavailable";
  }
  return status >= 500 || status === 429 ? "error" : "invalid";
}
