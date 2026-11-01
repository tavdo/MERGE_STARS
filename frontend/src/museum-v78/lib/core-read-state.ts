// Presentation of existing CORE read failures only; no identity, commercial
// authority, price, geometry or verification is created by these states.
export const coreReadCodes = ["CORE_UNAVAILABLE", "CORE_DEPENDENCY_REQUIRED", "CORE_TIMEOUT", "CORE_SESSION_REQUIRED", "CORE_PERMISSION_DENIED", "CORE_ENTITY_NOT_FOUND", "CORE_RATE_LIMITED", "CORE_CONTRACT_INVALID", "CORE_RESPONSE_TOO_LARGE", "CORE_REDIRECT_REJECTED", "INVALID_CORE_SLUG"] as const;
export type CoreReadCode = typeof coreReadCodes[number];
export function coreReadCode(value: unknown): CoreReadCode {
  return typeof value === "string" && (coreReadCodes as readonly string[]).includes(value) ? value as CoreReadCode : "CORE_UNAVAILABLE";
}
export const coreReadMessages: Record<CoreReadCode, string> = {
  CORE_UNAVAILABLE: "CORE-ის მონაცემები ახლა მიუწვდომელია.",
  CORE_DEPENDENCY_REQUIRED: "ეს ფუნქცია MERGE CORE-ის ავტორიზებულ დაკავშირებას ელოდება.",
  CORE_TIMEOUT: "CORE-ის პასუხის მოლოდინის დრო ამოიწურა.",
  CORE_SESSION_REQUIRED: "მონაცემების წაკითხვა MERGE CORE-ის მოქმედ სესიას მოითხოვს.",
  CORE_PERMISSION_DENIED: "MERGE CORE-მა ამ მონაცემებზე წვდომა არ დაუშვა.",
  CORE_ENTITY_NOT_FOUND: "CORE-ში მოთხოვნილი ჩანაწერი ვერ მოიძებნა.",
  CORE_RATE_LIMITED: "CORE-ის მოთხოვნების ლიმიტი ამოიწურა. მოგვიანებით სცადე.",
  CORE_CONTRACT_INVALID: "CORE-ის პასუხი მოქმედ ინტეგრაციის კონტრაქტს არ შეესაბამება.",
  CORE_RESPONSE_TOO_LARGE: "CORE-ის პასუხის მოცულობა დაშვებულ ზღვარს აღემატება.",
  CORE_REDIRECT_REJECTED: "CORE-ის პასუხი სხვა მისამართზე გადამისამართებას მოითხოვს; მოთხოვნა შეჩერებულია.",
  INVALID_CORE_SLUG: "CORE-ის კოლექციის მისამართი არასწორია.",
};
