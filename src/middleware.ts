import { auth } from "@/src/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const role = request.auth?.user?.role;
  if (!request.auth || !["ADMIN", "MANAGER"].includes(role ?? "")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*"] };
