import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui";

/**
 * Skeleton component for login page loading state.
 * Matches the structure of LoginView for smooth transition.
 */
export function LoginSkeleton() {
	return (
		<div className="w-full space-y-8">
			{/* Logo skeleton */}
			<div className="flex justify-center">
				<div className="h-12 w-32 animate-pulse rounded-md bg-muted" />
			</div>

			<Card className="shadow-xl shadow-black/5">
				<CardHeader className="space-y-4">
					<div className="space-y-2">
						{/* Title skeleton */}
						<div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
						{/* Description skeleton */}
						<div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
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

					<CardFooter className="flex flex-col gap-4 px-0 pb-0">
						{/* Button skeleton */}
						<div className="h-10 w-full animate-pulse rounded-md bg-muted" />

						{/* Links skeleton */}
						<div className="space-y-2">
							<div className="h-4 w-48 animate-pulse rounded-md bg-muted mx-auto" />
							<div className="h-4 w-56 animate-pulse rounded-md bg-muted mx-auto" />
						</div>
					</CardFooter>
				</CardContent>
			</Card>
		</div>
	);
}
