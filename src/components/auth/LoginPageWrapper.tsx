"use client";

import { useEffect, useState } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { LoginSkeleton } from "./LoginSkeleton";
import { LoginView } from "./LoginView";

interface LoginPageWrapperProps {
	redirectTo?: string;
	defaultSuccessMessage?: string;
}

/**
 * Client-side wrapper for login page that:
 * - Shows skeleton while loading
 * - Fades in login content when client is ready
 * - Includes animated background
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
		<div className="relative min-h-screen">
			{/* Animated background - only renders client-side */}
			<AnimatedBackground />

			{/* Content layer with proper z-index */}
			<div className="relative z-10">
				{!mounted || !showContent ? (
					<LoginSkeleton />
				) : (
					<div
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
		</div>
	);
}
