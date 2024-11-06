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
  const applicantToken = request.cookies.get("token")?.value;
  const adminToken = request.cookies.get("adminToken")?.value;
  console.log("Middleware: Applicant Token present:", !!applicantToken);
  console.log("Middleware: Admin Token present:", !!adminToken);

  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isRootPath = request.nextUrl.pathname === "/";
  const isDashboardPath = request.nextUrl.pathname.startsWith("/dashboard");
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  if (isApiRoute) {
    console.log("Middleware: API route, passing through");
    return NextResponse.next();
  }

  if (applicantToken) {
    try {
      const isValid = verifyJWT(applicantToken);
      if (isValid) {
        console.log("Middleware: Applicant token verified successfully");

        if (isRootPath) {
          console.log(
            "Middleware: Applicant token found, redirecting to dashboard"
          );
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } else {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("token");
        return response;
      }
    } catch (error) {
      console.error("Middleware: Applicant token verification failed:", error);
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  if (adminToken) {
    try {
      const isValid = verifyJWT(adminToken);
      if (isValid) {
        console.log("Middleware: Admin token verified successfully");

        if (request.nextUrl.pathname === "/admin/login") {
          console.log(
            "Middleware: Admin token found, redirecting to admin dashboard"
          );
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } else {
        const response = NextResponse.redirect(
          new URL("/admin/login", request.url)
        );
        response.cookies.delete("adminToken");
        return response;
      }
    } catch (error) {
      console.error("Middleware: Admin token verification failed:", error);
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.delete("adminToken");
      return response;
    }
  }

  if (!applicantToken && isDashboardPath) {
    console.log("Middleware: No applicant token found, redirecting to home");
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    !adminToken &&
    isAdminPath &&
    request.nextUrl.pathname !== "/admin/login"
  ) {
    console.log("Middleware: No admin token found, redirecting to admin login");
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  console.log("Middleware: Passing request through");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico).*)"],
};
