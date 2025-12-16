import ClientLayout from "@/components/ClientLayout";
import { getServerSession } from "@/lib/auth/getServerSession";
import { SessionHydrator } from "@/lib/auth/useAuthSession";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Janovix Auth · Better Auth Reference",
	description:
		"UI de autenticación que consume auth-core vía Better Auth: login, registro, cierre de sesión y vista de cuenta basados en cookies HttpOnly.",
};

/**
 * Root layout - fetches session on the server and hydrates it for all pages.
 *
 * By fetching the session here and wrapping with SessionHydrator,
 * ALL pages and components have immediate access to the session data
 * without any loading blink.
 */
export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Fetch session on server - this runs before any page renders
	const session = await getServerSession();

	// DEBUG: Log session fetch on server
	console.log("[LAYOUT] Server session fetched:", {
		hasSession: !!session,
		userId: session?.user?.id,
		userEmail: session?.user?.email,
	});

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SessionHydrator session={session}>
					<ClientLayout>{children}</ClientLayout>
				</SessionHydrator>
			</body>
		</html>
	);
}
