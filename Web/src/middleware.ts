import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Route Protection
 * 
 * This middleware runs on EVERY request to protected routes.
 * It checks for the presence of a valid refresh token cookie.
 * 
 * Protected Routes: All routes except /login and public assets
 * Public Routes: /login, /_next/*, /api/*, /favicon.ico, /images/*
 * 
 * Flow:
 * 1. Check if route requires authentication
 * 2. Check for refresh token cookie
 * 3. If missing/invalid, redirect to /login
 * 4. If valid, allow request to proceed
 */

/**
 * Define public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

/**
 * Define public path patterns (regex)
 */
const PUBLIC_PATH_PATTERNS = [
  /^\/_next\/.*/, // Next.js assets
  /^\/api\/.*/, // API routes (handled by backend)
  /^\/favicon\.ico$/, // Favicon
  /^\/images\/.*/, // Static images
  /^\/icons\/.*/, // Static icons
  /^\/fonts\/.*/, // Static fonts
];

/**
 * Check if a path is public (doesn't require authentication)
 */
function isPublicPath(pathname: string): boolean {
  // Check exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Check pattern matches
  return PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * Middleware function - runs on every request
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for refresh token cookie
  const refreshToken = request.cookies.get('refreshToken');

  // No refresh token = redirect to login
  if (!refreshToken) {
    const loginUrl = new URL('/login', request.url);
    // Add redirect parameter to return user after login
    loginUrl.searchParams.set('redirect', pathname);
    
    console.log(`[Middleware] No auth token, redirecting to /login from ${pathname}`);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists - verify it's not empty
  if (!refreshToken.value || refreshToken.value.trim() === '') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    console.log(`[Middleware] Empty auth token, redirecting to /login from ${pathname}`);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists and is not empty - allow request
  // Note: We don't validate the token here (too expensive)
  // Token validation happens on API calls via JwtAuthGuard
  return NextResponse.next();
}

/**
 * Matcher configuration - which routes this middleware applies to
 * 
 * This middleware runs on all routes EXCEPT:
 * - /_next/* (Next.js internals)
 * - /api/* (API routes - handled separately)
 * - Static files (*.ico, *.png, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, icons)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|icons|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
