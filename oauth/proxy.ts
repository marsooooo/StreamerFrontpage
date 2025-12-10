import { NextResponse, type NextRequest } from "next/server"

const ALLOWED_ORIGINS = [process.env.NEXT_PUBLIC_MAIN_APP_URL, "http://localhost:3000", "http://localhost:3001"].filter(
  Boolean,
) as string[]

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowedOrigin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  }
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin")
  const corsHeaders = getCorsHeaders(origin)

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
  }

  const response = NextResponse.next()
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: "/api/:path*",
}
