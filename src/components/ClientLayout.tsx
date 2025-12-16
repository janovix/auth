"use client";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LoginAnimationPanel } from "@/components/auth/LoginAnimationPanel";
import { Logo } from "@/components/Logo";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

function AuthLayout({ children }: { children: React.ReactNode }) {
	const { theme, systemTheme } = useTheme();
	const resolvedTheme = theme === "system" ? systemTheme : theme;
	const isDark = resolvedTheme === "dark";

	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden">
			{/* Background animation - full screen */}
			<div className="absolute inset-0">
				<LoginAnimationPanel />
			</div>

			{/* Theme-aware backdrop blur overlay */}
			<div
				className="absolute inset-0 backdrop-blur-xl"
				style={{
					backgroundColor: isDark
						? "rgba(0, 0, 0, 0.4)"
						: "rgba(255, 255, 255, 0.4)",
				}}
			/>

			{/* Centered logo with backdrop blur */}
			<div className="absolute top-0 left-0 right-0 flex justify-center pt-6 z-10">
				<div
					className="px-6 py-3 rounded-full backdrop-blur-md border"
					style={{
						backgroundColor: isDark
							? "rgba(0, 0, 0, 0.3)"
							: "rgba(255, 255, 255, 0.3)",
						borderColor: isDark
							? "rgba(255, 255, 255, 0.1)"
							: "rgba(0, 0, 0, 0.1)",
					}}
				>
					<Logo variant="logo" />
				</div>
			</div>

			{/* Main content area with backdrop blur */}
			<div className="relative z-10 w-full max-w-md mx-auto px-4">
				<div
					className="rounded-2xl p-8 backdrop-blur-md border shadow-xl"
					style={{
						backgroundColor: isDark
							? "rgba(0, 0, 0, 0.3)"
							: "rgba(255, 255, 255, 0.3)",
						borderColor: isDark
							? "rgba(255, 255, 255, 0.1)"
							: "rgba(0, 0, 0, 0.1)",
					}}
				>
					{children}
				</div>
			</div>

			{/* Privacy link at bottom with backdrop blur */}
			<div className="absolute bottom-0 left-0 right-0 flex justify-center pb-6 z-10">
				<div
					className="px-6 py-3 rounded-full backdrop-blur-md border"
					style={{
						backgroundColor: isDark
							? "rgba(0, 0, 0, 0.3)"
							: "rgba(255, 255, 255, 0.3)",
						borderColor: isDark
							? "rgba(255, 255, 255, 0.1)"
							: "rgba(0, 0, 0, 0.1)",
					}}
				>
					<Link
						href="/privacy"
						className="text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						Privacy Policy
					</Link>
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
			<div className="fixed bottom-4 right-4 z-50">
				<ThemeSwitcher />
			</div>
			{isAuthRoute ? <AuthLayout>{children}</AuthLayout> : children}
		</ThemeProvider>
	);
}
