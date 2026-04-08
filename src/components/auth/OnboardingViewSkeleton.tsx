import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Matches onboarding steps: top bar area + centered card with avatar + form fields.
 * Server-safe for route loading.tsx.
 */
export function OnboardingViewSkeleton() {
	return (
		<div className="w-full min-h-[60vh] flex flex-col items-center px-4 py-8">
			<div className="w-full max-w-md flex flex-col items-center gap-6">
				<Skeleton className="h-10 w-32 rounded-md" />
				<Card className="w-full">
					<CardHeader className="space-y-2 text-center pb-2">
						<Skeleton className="h-6 w-48 mx-auto" />
						<Skeleton className="h-4 w-full max-w-xs mx-auto" />
					</CardHeader>
					<CardContent className="space-y-6 pt-2">
						<div className="flex flex-col items-center gap-3">
							<Skeleton className="h-24 w-24 rounded-full" />
							<Skeleton className="h-9 w-36 rounded-md" />
						</div>
						<div className="space-y-4">
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-10 w-full rounded-md" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-10 w-full rounded-md" />
							</div>
							<Skeleton className="h-10 w-full rounded-md" />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
