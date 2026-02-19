"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/authClient";
import { validateSlug } from "./slug-utils";

const SLUG_CHECK_DEBOUNCE_MS = 400;

export interface UseSlugAvailabilityOptions {
	/** Current slug value to check */
	slug: string;
	/** When editing: if slug equals this (current org slug), treat as available without API call */
	excludeWhenSlugEquals?: string;
	/** Message to show when slug is taken */
	slugTakenMessage?: string;
}

export interface UseSlugAvailabilityResult {
	/** Format validation error or "taken" from API */
	slugError: string | null;
	/** true = available, false = taken, null = not checked / checking */
	slugAvailable: boolean | null;
	isCheckingSlug: boolean;
	/** Whether the slug has passed format validation */
	isFormatValid: boolean;
}

export function useSlugAvailability({
	slug,
	excludeWhenSlugEquals,
	slugTakenMessage = "This slug is already taken. Please choose another.",
}: UseSlugAvailabilityOptions): UseSlugAvailabilityResult {
	const [slugError, setSlugError] = useState<string | null>(null);
	const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
	const [isCheckingSlug, setIsCheckingSlug] = useState(false);

	const slugRef = useRef(slug);
	slugRef.current = slug;

	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const formatValid = Boolean(slug && validateSlug(slug).valid);
	const isCurrentOrgSlug =
		Boolean(excludeWhenSlugEquals) &&
		slug.trim() === excludeWhenSlugEquals?.trim();

	useEffect(() => {
		if (slug) {
			const validation = validateSlug(slug);
			const formatError = validation.valid ? null : validation.error || null;
			setSlugError(formatError);
			if (formatError) {
				setSlugAvailable(null);
			}
		} else {
			setSlugError(null);
			setSlugAvailable(null);
		}
	}, [slug]);

	useEffect(() => {
		if (!formatValid) {
			setSlugAvailable(null);
			setIsCheckingSlug(false);
			return;
		}

		// Edit mode: slug unchanged from current org – treat as available
		if (isCurrentOrgSlug) {
			setSlugError(null);
			setSlugAvailable(true);
			setIsCheckingSlug(false);
			return;
		}

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		timeoutRef.current = setTimeout(async () => {
			timeoutRef.current = null;
			const slugToCheck = slug.trim();
			setIsCheckingSlug(true);
			setSlugAvailable(null);

			try {
				const result = await authClient.organization.checkSlug({
					slug: slugToCheck,
				});

				if (slugToCheck !== slugRef.current.trim()) return;

				if (result.error) {
					setSlugError(slugTakenMessage);
					setSlugAvailable(false);
				} else {
					setSlugError(null);
					setSlugAvailable(true);
				}
			} catch {
				if (slugToCheck !== slugRef.current.trim()) return;
				setSlugAvailable(null);
			} finally {
				if (slugToCheck === slugRef.current.trim()) {
					setIsCheckingSlug(false);
				}
			}
		}, SLUG_CHECK_DEBOUNCE_MS);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [slug, formatValid, isCurrentOrgSlug, slugTakenMessage]);

	return {
		slugError,
		slugAvailable,
		isCheckingSlug,
		isFormatValid: formatValid,
	};
}
