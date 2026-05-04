import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/completar-registro"];
const ACCESS_TOKEN_COOKIE = "accessToken";

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticAsset(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
