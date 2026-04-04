import { Skeleton } from "@/components/ui/skeleton";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";

/**
 * Matches ProductsView: SettingsPageHeader + 2-column product cards.
 * Server-safe for route loading.tsx and client loading states.
 */
export function ProductsViewSkeleton() {
	return (
		<div className="space-y-8">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Skeleton className="h-10 w-10 rounded-lg" />
					<div>
						<Skeleton className="h-8 w-48 mb-1" />
						<Skeleton className="h-5 w-72 max-w-full" />
					</div>
				</div>
			</div>
			<div className="grid gap-6 sm:grid-cols-2">
				{[1, 2].map((i) => (
					<Card key={i} className="h-full">
						<CardHeader>
							<Skeleton className="h-10 w-10 rounded-lg mb-2" />
							<Skeleton className="h-6 w-40 mb-2" />
							<Skeleton className="h-4 w-full max-w-sm" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-4 w-3/4" />
						</CardContent>
						<CardFooter className="mt-auto flex flex-col gap-2 sm:flex-row sm:justify-end">
							<Skeleton className="h-10 w-full sm:w-36" />
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
