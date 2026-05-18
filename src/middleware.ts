import { withAuth } from "next-auth/middleware";

export const middleware = withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/finance/:path*",
    "/profile/:path*",
    "/sessions/:path*",
    "/venues/:path*",
    "/clubs/:path*",
    "/players/:path*",
  ],
};
