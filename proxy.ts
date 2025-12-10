import { NextResponse, type NextRequest } from "next/server"
import { getCorsHeaders } from "@/lib/cors"

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin")

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    })
  }

  // Add CORS headers to all API responses
  const response = NextResponse.next()
  const corsHeaders = getCorsHeaders(origin)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: "/api/:path*",
}
