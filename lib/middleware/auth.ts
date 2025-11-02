import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

// Routes that require admin role
const adminRoutes = ["/dashboard/admin"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/auth/login", "/auth/register"];

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookie
  const sessionToken = request.cookies.get("session_id")?.value;

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if it's an admin route
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if it's an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If no session and trying to access protected route, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If session exists, validate it via API call
  if (sessionToken) {
    try {
      // Make internal API call to validate session
      // Use localhost for internal calls to avoid SSL issues with Railway proxy
      // Railway uses PORT env var (default 8080), local dev uses 3000
      const port = process.env.PORT || '3000';
      const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://localhost:${port}/api/auth/me`
        : `${request.nextUrl.origin}/api/auth/me`;

      const response = await fetch(apiUrl, {
        headers: {
          Cookie: `session_id=${sessionToken}`,
        },
      });

      // If session is invalid or expired, clear cookie and redirect to login
      if (!response.ok) {
        const redirectResponse = isProtectedRoute
          ? NextResponse.redirect(new URL("/auth/login", request.url))
          : NextResponse.next();

        redirectResponse.cookies.delete("session_id");
        return redirectResponse;
      }

      const { user } = await response.json();

      // If authenticated and trying to access auth routes, redirect to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // If accessing admin route but not admin, redirect to dashboard
      if (isAdminRoute && user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Valid session, continue
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);

      // On error, clear session and redirect to login if accessing protected route
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL("/auth/login", request.url));
        response.cookies.delete("session_id");
        return response;
      }
    }
  }

  // If authenticated user on auth route (but no session - shouldn't happen)
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}