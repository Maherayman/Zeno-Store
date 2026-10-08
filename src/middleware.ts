import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authConfig from "@/src/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request: NextRequest) => {
  const role = request.auth?.user?.role;
  if (!request.auth || !["ADMIN", "MANAGER"].includes(role ?? "")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*"] };
