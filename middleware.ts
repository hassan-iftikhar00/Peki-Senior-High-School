import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

// Basic JWT verification function
function verifyJWT(token: string): boolean {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");

    // Decode the header and payload
    const header = JSON.parse(atob(headerB64));
    const payload = JSON.parse(atob(payloadB64));

    // Check if the token has expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false;
    }

    // In a production environment, you should implement proper signature verification here
    // This basic implementation just checks if all parts of the JWT are present
    return !!(headerB64 && payloadB64 && signatureB64);
  } catch (error) {
    console.error("JWT verification failed:", error);
    return false;
  }
}

export function middleware(request: NextRequest) {
  console.log("Middleware: Handling request for", request.nextUrl.pathname);
  const token = request.cookies.get("token")?.value;
  console.log("Middleware: Token present:", !!token);

  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isRootPath = request.nextUrl.pathname === "/";
  const isDashboardPath = request.nextUrl.pathname.startsWith("/dashboard");

  if (isApiRoute) {
    console.log("Middleware: API route, passing through");
    return NextResponse.next();
  }

  if (token) {
    try {
      const isValid = verifyJWT(token);
      if (isValid) {
        console.log("Middleware: Token verified successfully");

        if (isRootPath) {
          console.log("Middleware: Token found, redirecting to dashboard");
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      console.error("Middleware: Token verification failed:", error);
      // If token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  if (!token && isDashboardPath) {
    console.log("Middleware: No token found, redirecting to home");
    return NextResponse.redirect(new URL("/", request.url));
  }

  console.log("Middleware: Passing request through");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico).*)"],
};
