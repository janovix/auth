# Authentication Integration Prompt

Copy and use this prompt for AI agents integrating auth in Next.js apps.

---

## PROMPT

```
Integrate Better Auth session management in this Next.js app for Cloudflare Workers.

FIRST: Remove any existing session/auth management (SessionGuard components, auth context providers, protected route wrappers). We use middleware-only protection.

ENVIRONMENT VARIABLES (add to .env.local or build stage in cloudflare dashboard):
NEXT_PUBLIC_AUTH_CORE_BASE_URL=https://auth-svc.example.workers.dev
NEXT_PUBLIC_AUTH_APP_URL=https://auth.example.workers.dev

INSTALL DEPENDENCIES:
pnpm add better-auth@1.4.5 nanostores@^1.1.0 @nanostores/react@^1.0.0

CREATE src/lib/auth/ WITH THESE FILES:

config.ts:
export const getAuthCoreBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL || "https://auth-svc.example.workers.dev";
};
export const getAuthAppUrl = (): string => {
  return process.env.NEXT_PUBLIC_AUTH_APP_URL || "https://auth.example.workers.dev";
};

types.ts:
export type Session = {
  user: { id: string; name: string; email: string; image?: string | null; emailVerified: boolean; createdAt: Date; updatedAt: Date; };
  session: { id: string; userId: string; token: string; expiresAt: Date; createdAt: Date; updatedAt: Date; ipAddress?: string; userAgent?: string; };
} | null;
export type SessionState = { data: Session; error: Error | null; isPending: boolean; };

authClient.ts:
import { createAuthClient } from "better-auth/client";
import { getAuthCoreBaseUrl } from "./config";
export const authClient = createAuthClient({
  baseURL: getAuthCoreBaseUrl(),
  fetchOptions: { credentials: "include" },
});

sessionStore.ts:
import { atom } from "nanostores";
import type { Session, SessionState } from "./types";
export const sessionStore = atom<SessionState>({ data: null, error: null, isPending: true });
export function setSession(session: Session) { sessionStore.set({ data: session, error: null, isPending: false }); }
export function clearSession() { sessionStore.set({ data: null, error: null, isPending: false }); }

useAuthSession.tsx:
"use client";
import { useStore } from "@nanostores/react";
import { useRef } from "react";
import { sessionStore } from "./sessionStore";
import type { Session } from "./types";
export function useAuthSession() {
  const { data, error, isPending } = useStore(sessionStore);
  return { data, error, isPending };
}
export function SessionHydrator({ serverSession, children }: { serverSession: Session; children: React.ReactNode }) {
  const hydrated = useRef(false);
  if (!hydrated.current && typeof window !== "undefined") {
    sessionStore.set({ data: serverSession, error: null, isPending: false });
    hydrated.current = true;
  }
  return <>{children}</>;
}

getServerSession.ts:
import { cookies } from "next/headers";
import { getAuthCoreBaseUrl } from "./config";
import type { Session } from "./types";
export async function getServerSession(): Promise<Session> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${getAuthCoreBaseUrl()}/api/auth/get-session`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.user ? data : null;
  } catch { return null; }
}

actions.ts:
"use client";
import { authClient } from "./authClient";
import { clearSession } from "./sessionStore";
import { getAuthAppUrl } from "./config";
export async function logout(): Promise<void> {
  const authAppUrl = getAuthAppUrl();
  try {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          clearSession();
          window.location.href = `${authAppUrl}/login`;
        },
      },
    });
  } catch {
    clearSession();
    window.location.href = `${authAppUrl}/login`;
  }
}

CREATE src/middleware.ts:
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
const getAuthAppUrl = () => process.env.NEXT_PUBLIC_AUTH_APP_URL || "https://auth.example.workers.dev";
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const returnUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(`${getAuthAppUrl()}/login?redirect_to=${returnUrl}`);
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

UPDATE src/app/layout.tsx:
import { getServerSession } from "@/lib/auth/getServerSession";
import { SessionHydrator } from "@/lib/auth/useAuthSession";
// In the component:
const session = await getServerSession();
// Wrap children:
<SessionHydrator serverSession={session}>{children}</SessionHydrator>

LOGOUT BUTTON PATTERN:
import { logout } from "@/lib/auth/actions";
const handleLogout = async () => { await logout(); };
// Call handleLogout directly on click - no other state updates before it

Export index.ts from src/lib/auth/:
export { authClient } from "./authClient";
export { getAuthCoreBaseUrl, getAuthAppUrl } from "./config";
export { getServerSession } from "./getServerSession";
export { sessionStore, setSession, clearSession } from "./sessionStore";
export { useAuthSession, SessionHydrator } from "./useAuthSession";
export { logout } from "./actions";
export type { Session, SessionState } from "./types";

Add vitest tests for each file.
```

---

## KEY POINTS

- Route protection happens ONLY in middleware at the edge
- Logout uses onSuccess callback to control redirect after signOut completes
- getAuthCoreBaseUrl() = backend API, getAuthAppUrl() = frontend login page
- No React state updates before calling logout()
- Session hydration in root layout prevents UI flicker
