/**
 * Organization slug utilities - shared by create and edit organization flows.
 */

export interface SlugValidation {
	valid: boolean;
	error?: string;
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[áàäâã]/g, "a")
		.replace(/[éèëê]/g, "e")
		.replace(/[íìïî]/g, "i")
		.replace(/[óòöôõ]/g, "o")
		.replace(/[úùüû]/g, "u")
		.replace(/[ñ]/g, "n")
		.replace(/[ç]/g, "c")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Validate slug format (length, characters, etc).
 */
export function validateSlug(slug: string): SlugValidation {
	if (!slug) {
		return { valid: false, error: "Slug is required" };
	}
	if (slug.length < 3) {
		return { valid: false, error: "Slug must be at least 3 characters" };
	}
	if (slug.length > 50) {
		return { valid: false, error: "Slug must be 50 characters or less" };
	}
	if (!/^[a-z0-9]/.test(slug)) {
		return { valid: false, error: "Slug must start with a letter or number" };
	}
	if (!/[a-z0-9]$/.test(slug)) {
		return { valid: false, error: "Slug must end with a letter or number" };
	}
	if (!/^[a-z0-9-]+$/.test(slug)) {
		return {
			valid: false,
			error: "Slug can only contain lowercase letters, numbers, and hyphens",
		};
	}
	if (/--/.test(slug)) {
		return { valid: false, error: "Slug cannot contain consecutive hyphens" };
	}
	return { valid: true };
}

/**
 * Sanitize user input to valid slug characters only.
 */
export function sanitizeSlugInput(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
}
