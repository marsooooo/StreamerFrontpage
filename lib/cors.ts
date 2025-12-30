import { NextResponse } from "next/server"

// Allowed origins - add your production domains here
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.CORS_ALLOWED_ORIGIN,
  process.env.OAUTH_APP_URL,
].filter(Boolean) as string[]

export function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && (allowedOrigins.includes(origin) || allowedOrigins.some((o) => origin.startsWith(o)))

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0] || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  }
}

export function corsResponse(response: NextResponse, origin: string | null) {
  const headers = getCorsHeaders(origin)
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export function corsOptionsResponse(origin: string | null) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  }
}
