/* eslint-disable */
// export { auth as middleware } from "@/auth";

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  return NextResponse.next();
}
