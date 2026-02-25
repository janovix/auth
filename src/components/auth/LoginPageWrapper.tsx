"use client";

import { useEffect, useState } from "react";
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
 *
 * LoginView is always mounted immediately so its buttons are interactive
 * from the first render, eliminating the first-tap miss on mobile where
 * a tap landing during the skeleton-to-content swap was lost.
 * The skeleton renders as an absolute overlay and fades out after 150ms.
 */
export function LoginPageWrapper({
	redirectTo,
	defaultSuccessMessage,
}: LoginPageWrapperProps) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setReady(false);
		const timer = setTimeout(() => setReady(true), 150);
		return () => clearTimeout(timer);
	}, [redirectTo, defaultSuccessMessage]);

	return (
		<div className="relative">
			{/* Real login form — always mounted so buttons are interactive immediately */}
			<div
				style={{
					opacity: ready ? 1 : 0,
					transition: "opacity 0.6s ease-in-out",
				}}
			>
				<LoginView
					redirectTo={redirectTo}
					defaultSuccessMessage={defaultSuccessMessage}
				/>
			</div>

			{/* Skeleton overlay — covers LoginView until ready, then unmounts */}
			{!ready && (
				<div className="absolute inset-0" aria-hidden="true">
					<LoginSkeleton />
				</div>
			)}
		</div>
	);
}
