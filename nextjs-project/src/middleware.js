import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Routes that require specific roles
    if (path.startsWith("/add-bike") && 
        !["dealer", "merchandiser", "admin"].includes(token?.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard", "/add-bike", "/my-orders", "/cart", "/checkout"],
};
