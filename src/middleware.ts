import { withAuth } from "next-auth/middleware";

// Protege todo lo que esté bajo /dashboard: si no hay sesión, redirige a /login.
export default withAuth({
  pages: {
    signIn: "/login"
  }
});

export const config = {
  matcher: ["/dashboard/:path*"]
};
