import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const protectedPaths = ["/dashboard", "/exam", "/leaderboard", "/profile"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdmin = pathname.startsWith("/admin");

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAdmin && (!isLoggedIn || role !== "ADMIN")) {
    const redirectTo = isLoggedIn ? "/dashboard" : "/";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/exam/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
