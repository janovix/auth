"use client";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LoginAnimationPanel } from "@/components/auth/LoginAnimationPanel";
import { Logo } from "@/components/Logo";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function AuthLayout({ children }: { children: React.ReactNode }) {
	const { theme, systemTheme } = useTheme();
	const resolvedTheme = theme === "system" ? systemTheme : theme;
	const isDark = resolvedTheme === "dark";
	const [hasEnoughHeight, setHasEnoughHeight] = useState(false);

	// Check if viewport has enough height to accommodate tall cards (like signup)
	useEffect(() => {
		const checkHeight = () => {
			// Minimum height needed: ~800px to comfortably show signup card without scrolling
			// lg breakpoint is 1024px width, so we check both width >= 1024px AND height >= 800px
			const isWideEnough = window.innerWidth >= 1024; // lg breakpoint
			const isTallEnough = window.innerHeight >= 800; // Minimum height for tall cards
			setHasEnoughHeight(isWideEnough && isTallEnough);
		};

		// Check on mount
		checkHeight();

		// Check on resize
		window.addEventListener("resize", checkHeight);
		return () => window.removeEventListener("resize", checkHeight);
	}, []);

	const showBackground = hasEnoughHeight;

	return (
		<div className="bg-muted flex h-svh w-full flex-col overflow-hidden relative">
			{/* Background animation - Only shown when viewport is wide AND tall enough */}
			{showBackground && (
				<div className="fixed top-0 bottom-0 left-0 right-0 w-full h-full overflow-hidden z-0">
					{/* Theme-aware background */}
					<div className="absolute left-0 top-0 w-full h-full bg-background" />

					{/* Background animation */}
					<div className="absolute left-0 top-0 w-full h-full">
						<LoginAnimationPanel />
					</div>

					{/* Black curtain overlay */}
					<div
						className="absolute left-0 top-0 w-full h-full"
						style={{
							backgroundColor: "rgba(0, 0, 0, 0.3)",
						}}
					/>
				</div>
			)}

			{/* Logo in top left - only visible when background is shown */}
			{showBackground && (
				<div className="fixed top-4 left-4 z-50">
					<Logo variant="logo" forceTheme="dark" />
				</div>
			)}

			{/* Theme picker - bottom right for background-enabled views */}
			{showBackground && (
				<div className="fixed bottom-4 right-4 z-50">
					<ThemeSwitcher />
				</div>
			)}

			{/* No-background layout: top bar with logo and theme picker */}
			{!showBackground && (
				<div className="flex items-center justify-between w-full px-4 pt-4 pb-2 relative z-10 shrink-0">
					<Logo variant="logo" />
					<ThemeSwitcher />
				</div>
			)}

			{/* Main content area - scrollable */}
			<div className={`flex-1 w-full flex flex-col items-center px-4 md:px-10 pt-4 pb-4 relative z-10 overflow-y-auto min-h-0 ${showBackground ? "justify-center lg:pt-6 lg:pb-6" : "justify-start"}`}>
				<div className="flex w-full max-w-sm flex-col gap-4 lg:gap-6">
					{/* Login form */}
					{children}
				</div>
			</div>
		</div>
	);
}

export default function ClientLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	// Show centered layout with backdrop blur for auth routes
	const isAuthRoute =
		pathname === "/" ||
		pathname.startsWith("/login") ||
		pathname.startsWith("/signup") ||
		pathname.startsWith("/recover");

	return (
		<ThemeProvider>
			{isAuthRoute ? (
				<AuthLayout>{children}</AuthLayout>
			) : (
				<>
					<div className="fixed bottom-4 right-4 z-50">
						<ThemeSwitcher />
					</div>
					{children}
				</>
			)}
		</ThemeProvider>
	);
}
