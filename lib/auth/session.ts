export const SESSION_COOKIE = "sb_session";

export function hasSession(cookieValue: string | undefined): boolean {
  return typeof cookieValue === "string" && cookieValue.length > 0;
}
