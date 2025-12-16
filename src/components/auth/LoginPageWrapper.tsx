"use client";

import { useEffect, useState } from "react";
import { LoginSkeleton } from "./LoginSkeleton";
import { LoginView } from "./LoginView";
import { LoginAnimationPanel } from "./LoginAnimationPanel";

interface LoginPageWrapperProps {
	redirectTo?: string;
	defaultSuccessMessage?: string;
}

/**
 * Client-side wrapper for login page that:
 * - Shows skeleton while loading
 * - Fades in login content when client is ready
 * - Uses two-column layout (form left, animation right on larger screens)
 */
export function LoginPageWrapper({
	redirectTo,
	defaultSuccessMessage,
}: LoginPageWrapperProps) {
	const [mounted, setMounted] = useState(false);
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		// Mark as mounted
		setMounted(true);

		// Show content after a brief delay to ensure smooth transition
		// This allows the skeleton to render first and background to initialize
		const timer = setTimeout(() => {
			setShowContent(true);
		}, 150);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="flex min-h-screen">
			{/* Left column - Login form */}
			<div className="flex flex-1 flex-col items-center justify-center px-4 py-12 lg:px-8">
				{!mounted || !showContent ? (
					<LoginSkeleton />
				) : (
					<div
						className="w-full max-w-md"
						style={{
							opacity: showContent ? 1 : 0,
							transition: "opacity 0.6s ease-in-out",
						}}
					>
						<LoginView
							redirectTo={redirectTo}
							defaultSuccessMessage={defaultSuccessMessage}
						/>
					</div>
				)}
			</div>

			{/* Right column - Animation panel (hidden on smaller screens) */}
			<LoginAnimationPanel />
		</div>
	);
}
