import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";

/**
 * Skeleton component for login page loading state.
 * Matches the structure of LoginView for smooth transition.
 */
export function LoginSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="text-center">
					{/* Title skeleton */}
					<CardTitle className="text-xl">
						<div className="h-6 w-48 animate-pulse rounded-md bg-muted mx-auto" />
					</CardTitle>
					{/* Description skeleton */}
					<CardDescription>
						<div className="h-4 w-64 animate-pulse rounded-md bg-muted mx-auto" />
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						{/* Email field skeleton */}
						<Field>
							<FieldLabel>
								<div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
							</FieldLabel>
							<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
						</Field>

						{/* Password field skeleton */}
						<Field>
							<div className="flex items-center">
								<FieldLabel>
									<div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
								</FieldLabel>
								<div className="ml-auto h-4 w-36 animate-pulse rounded-md bg-muted" />
							</div>
							<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
						</Field>

						{/* Remember me checkbox skeleton */}
						<Field>
							<div className="flex items-start gap-3 rounded-lg border px-4 py-3">
								<div className="h-5 w-5 animate-pulse rounded-md bg-muted" />
								<div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
							</div>
						</Field>

						{/* Button and signup link skeleton */}
						<Field>
							<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
							<FieldDescription className="text-center">
								<span className="inline-block h-4 w-56 animate-pulse rounded-md bg-muted" />
							</FieldDescription>
						</Field>
					</FieldGroup>

					{/* Separator */}
					<hr className="my-6 border-t" />

					{/* Terms and privacy skeleton */}
					<FieldDescription className="px-6 text-center">
						<span className="inline-block h-4 w-80 animate-pulse rounded-md bg-muted" />
					</FieldDescription>
				</CardContent>
			</Card>
		</div>
	);
}
