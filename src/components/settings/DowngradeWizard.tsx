"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { PrepareDowngradeResponse } from "@/lib/billing";
import {
	archiveOrganizationsForDowngrade,
	changeSubscriptionPlan,
} from "@/lib/billing";

export interface DowngradeWizardProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	targetPlan: "watchlist" | "business" | "pro" | "ultra";
	prep: PrepareDowngradeResponse | null;
	onFinished: () => void;
	onError: (message: string) => void;
}

export function DowngradeWizard({
	open,
	onOpenChange,
	targetPlan,
	prep,
	onFinished,
	onError,
}: DowngradeWizardProps) {
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [submitting, setSubmitting] = useState(false);

	const excess = prep?.excessOrganizationSlots ?? 0;
	const usersCap = prep?.targetLimits.usersPerOrg ?? 0;

	const defaultSelection = useMemo(() => {
		if (!prep?.organizations?.length || excess <= 0) return new Set<string>();
		const active = prep.organizations.filter((o) => o.status === "active");
		const toArchive = active.slice(-excess);
		return new Set(toArchive.map((o) => o.id));
	}, [prep, excess]);

	useEffect(() => {
		if (open && defaultSelection.size > 0) {
			setSelected(new Set(defaultSelection));
		}
		if (!open) {
			setSelected(new Set());
			setSubmitting(false);
		}
	}, [open, defaultSelection]);

	const toggle = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const remainingOrgs = useMemo(() => {
		if (!prep) return [];
		return prep.organizations.filter((o) => !selected.has(o.id));
	}, [prep, selected]);

	const remainingViolations = useMemo(() => {
		if (usersCap <= 0) return [];
		return remainingOrgs.filter((o) => o.memberCount > usersCap);
	}, [remainingOrgs, usersCap]);

	const userCapacityBlocked = remainingViolations.length > 0;

	const onlyUserBlock =
		prep != null &&
		excess <= 0 &&
		prep.organizations.some((o) => o.exceedsUsersPerOrgAfterDowngrade);

	const canSubmit =
		Boolean(prep) &&
		!userCapacityBlocked &&
		(excess > 0 ? selected.size >= excess : !onlyUserBlock);

	const handleSubmit = async () => {
		if (!prep || submitting) return;
		if (!canSubmit) return;
		if (userCapacityBlocked) return;
		if (excess > 0 && selected.size < excess) return;

		setSubmitting(true);
		try {
			if (excess > 0 && selected.size > 0) {
				await archiveOrganizationsForDowngrade([...selected]);
			}
			const { redirectUrl } = await changeSubscriptionPlan(targetPlan);
			onOpenChange(false);
			if (redirectUrl) {
				window.location.href = redirectUrl;
			} else {
				onFinished();
			}
		} catch (e) {
			onError(e instanceof Error ? e.message : "Plan change failed");
		} finally {
			setSubmitting(false);
		}
	};

	if (!prep) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-amber-500" />
						Change plan to {targetPlan}
					</DialogTitle>
					<DialogDescription>
						The {targetPlan} plan allows up to{" "}
						{prep.targetLimits.maxOrganizations === 0
							? "unlimited"
							: prep.targetLimits.maxOrganizations}{" "}
						active organizations
						{usersCap > 0 ? ` and ${usersCap} members per organization` : ""}.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{onlyUserBlock && excess <= 0 && (
						<div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
							<p className="font-medium text-amber-800 dark:text-amber-200">
								Member limit exceeded
							</p>
							<p className="mt-1 text-muted-foreground">
								Reduce members in the organizations below before switching
								plans, or archive organizations you no longer need.
							</p>
							<ul className="mt-2 list-disc pl-5">
								{prep.organizations
									.filter((o) => o.exceedsUsersPerOrgAfterDowngrade)
									.map((o) => (
										<li key={o.id}>
											{o.name} ({o.memberCount} members)
										</li>
									))}
							</ul>
							<Button asChild variant="outline" className="mt-3" size="sm">
								<Link href="/settings/team">Open team settings</Link>
							</Button>
						</div>
					)}

					{excess > 0 && (
						<div className="space-y-2">
							<p className="text-sm font-medium">
								Archive at least {excess} organization
								{excess === 1 ? "" : "s"}
							</p>
							<p className="text-sm text-muted-foreground">
								Archived organizations stay available read-only for retention.
								You can restore them later if your plan allows.
							</p>
							<div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
								{prep.organizations.map((o) => (
									<div
										key={o.id}
										className="flex items-start gap-2 py-1.5 border-b last:border-0"
									>
										<Checkbox
											id={`org-${o.id}`}
											checked={selected.has(o.id)}
											onCheckedChange={() => toggle(o.id)}
										/>
										<div className="grid gap-0.5">
											<Label
												htmlFor={`org-${o.id}`}
												className="font-normal cursor-pointer"
											>
												{o.name}
											</Label>
											<span className="text-xs text-muted-foreground">
												{o.memberCount} members
												{o.exceedsUsersPerOrgAfterDowngrade
													? " · exceeds new seat limit if kept active"
													: ""}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{userCapacityBlocked && (
						<p className="text-sm text-destructive">
							After archiving your selection, these organizations still exceed
							the new per-organization member limit:{" "}
							{remainingViolations.map((o) => o.name).join(", ")}.
						</p>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={submitting}
					>
						Cancel
					</Button>
					<Button
						onClick={() => void handleSubmit()}
						disabled={submitting || !canSubmit}
					>
						{submitting ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Working…
							</>
						) : (
							"Continue"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
