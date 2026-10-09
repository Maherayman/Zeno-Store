import { NextRequest } from "next/server";
import { middleware as adminMiddleware } from "@/src/middleware";

export async function middleware(request: NextRequest) {
  return adminMiddleware(request);
}

export const config = {
  matcher: ["/admin/:path*"]
};
