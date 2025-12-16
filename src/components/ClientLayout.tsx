"use client";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LoginAnimationPanel } from "@/components/auth/LoginAnimationPanel";
import { Logo } from "@/components/Logo";
import { usePathname } from "next/navigation";

export default function ClientLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	// Show two-column layout for auth routes
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
			{isAuthRoute ? (
				<div className="flex min-h-screen">
					{/* Left column - Content */}
					<div className="flex flex-1 flex-col">
						{/* Logo at top-left */}
						<div className="px-4 pt-6 lg:px-8">
							<Logo variant="logo" />
						</div>
						{/* Content area */}
						<div className="flex flex-1 items-center justify-center px-4 py-12">
							{children}
						</div>
					</div>
					{/* Right column - Animation panel (hidden on smaller screens) */}
					<LoginAnimationPanel />
				</div>
			) : (
				children
			)}
		</ThemeProvider>
	);
}
