"use client";

import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

interface ErrorPageLayoutProps {
	children: ReactNode;
}

/**
 * Shared layout for error pages (404, forbidden, unauthorized, etc.)
 * Includes the Janovix logo and centers the content.
 * Should be used inside pages that are wrapped by AuthLayout (via ClientLayout).
 */
export function ErrorPageLayout({ children }: ErrorPageLayoutProps) {
	return (
		<div className="flex flex-col gap-4 sm:gap-6 w-full">
			<div className="flex justify-center mb-2">
				<Logo variant="logo" />
			</div>
			{children}
		</div>
	);
}
