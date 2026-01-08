"use client";

import { usePathname } from "next/navigation";

import { GlobalAuroraBackground } from "@/components/aurora";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AuroraProvider } from "@/contexts/aurora-context";

function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuroraProvider>
			<div className="flex h-svh w-full flex-col overflow-hidden relative">
				{/* Aurora background - always shown on auth pages */}
				<GlobalAuroraBackground />

				{/* Theme picker - bottom right */}
				<div className="fixed bottom-4 right-4 z-50">
					<ThemeSwitcher />
				</div>

				{/* Main content area - scrollable, centered */}
				<div className="flex-1 w-full flex flex-col items-center justify-center px-4 md:px-10 py-8 relative z-10 overflow-y-auto min-h-0">
					<div className="flex w-full max-w-sm flex-col gap-4 lg:gap-6 animate-form-fade-in">
						{children}
					</div>
				</div>
			</div>
		</AuroraProvider>
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
		pathname.startsWith("/recover") ||
		pathname.startsWith("/verify");

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
