/**
 * Skeleton component for login page loading state.
 * Matches the structure of LoginView for smooth transition.
 */
export function LoginSkeleton() {
	return (
		<div className="w-full max-w-md space-y-6">
			{/* Title and description skeleton */}
			<div className="space-y-2">
				<div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
				<div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
			</div>

			{/* Email field skeleton */}
			<div className="space-y-2">
				<div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
				<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
			</div>

			{/* Password field skeleton */}
			<div className="space-y-2">
				<div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
				<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
			</div>

			{/* Remember me skeleton */}
			<div className="flex items-start gap-3 rounded-lg border px-4 py-3">
				<div className="h-5 w-5 animate-pulse rounded-md bg-muted" />
				<div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
			</div>

			{/* Button and links skeleton */}
			<div className="flex flex-col gap-4">
				<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
				<div className="h-4 w-48 animate-pulse rounded-md bg-muted mx-auto" />
				<div className="h-4 w-56 animate-pulse rounded-md bg-muted mx-auto" />
			</div>
		</div>
	);
}
