import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import ClientLayout from "@/components/ClientLayout";
import { getServerSession } from "@/lib/auth/getServerSession";
import { SessionHydrator } from "@/lib/auth/useAuthSession";
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

// Force dynamic rendering since we use cookies and server-side session fetching
export const dynamic = "force-dynamic";

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

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Polyfill for esbuild's __name helper used by next-themes */}
				<script
					dangerouslySetInnerHTML={{
						__html: `if(typeof __name==="undefined"){window.__name=function(e){return e}}`,
					}}
				/>
			</head>
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
