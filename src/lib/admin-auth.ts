import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export type UserRole = "USER" | "REVIEWER" | "ADMIN";

interface SessionUser {
  id?: string;
  email?: string;
  name?: string;
  role?: UserRole;
}

export async function getSessionWithRole() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return {
    ...session,
    user: session.user as SessionUser,
  };
}

export async function requireAuth() {
  const session = await getSessionWithRole();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  const userRole = session.user.role || "USER";

  if (!allowedRoles.includes(userRole)) {
    redirect("/dashboard");
  }

  return session;
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function requireReviewer() {
  return requireRole(["REVIEWER", "ADMIN"]);
}

export function canReviewSubmissions(role: string | undefined): boolean {
  return role === "REVIEWER" || role === "ADMIN";
}

export function canManageUsers(role: string | undefined): boolean {
  return role === "ADMIN";
}

export function canManageSettings(role: string | undefined): boolean {
  return role === "ADMIN";
}
