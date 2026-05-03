const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  writeCookie(ACCESS_TOKEN_COOKIE, accessToken, 60 * 15);
  writeCookie(REFRESH_TOKEN_COOKIE, refreshToken, 60 * 60 * 24 * 7);
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] || "") : null;
}

export function getAccessTokenCookie() {
  return getCookieValue(ACCESS_TOKEN_COOKIE);
}

export function getRefreshTokenCookie() {
  return getCookieValue(REFRESH_TOKEN_COOKIE);
}