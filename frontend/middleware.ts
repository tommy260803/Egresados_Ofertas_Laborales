import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login", "/register"];
const ACCESS_TOKEN_COOKIE = "accessToken";

function isStaticAsset(pathname: string) {
  return pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.includes(".");
}

function getDashboardPath(rol?: string) {
  if (rol === "administrador") return "/admin/dashboard";
  if (rol === "empresa") return "/empresa/dashboard";
  if (rol === "egresado") return "/egresado/dashboard";
  return "/";
}

async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "";
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticAsset(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!token) {
    return isPublic ? NextResponse.next() : NextResponse.redirect(new URL("/", req.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = isPublic ? NextResponse.next() : NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete("refreshToken");
    return response;
  }

  // Permitir acceso a login/register incluso con token válido (para re-autenticación)
  // if ((pathname === "/login" || pathname === "/register") && payload.rol) {
  //   return NextResponse.redirect(new URL(getDashboardPath(String(payload.rol)), req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};