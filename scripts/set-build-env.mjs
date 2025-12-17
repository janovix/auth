#!/usr/bin/env node
/**
 * Reads environment variables from wrangler.jsonc and sets them for the build process.
 * This ensures Next.js has access to these variables during static generation.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

try {
	// Read wrangler.jsonc
	const wranglerPath = join(rootDir, "wrangler.jsonc");
	const wranglerContent = readFileSync(wranglerPath, "utf-8");

	// Extract vars section using regex (simple approach for JSONC)
	// Remove comments and parse JSON
	const jsonContent = wranglerContent
		.split("\n")
		.map((line) => {
			// Remove single-line comments
			const commentIndex = line.indexOf("//");
			if (commentIndex !== -1) {
				return line.substring(0, commentIndex);
			}
			return line;
		})
		.join("\n");

	const config = JSON.parse(jsonContent);

	// Set environment variables from wrangler.jsonc vars
	if (config.vars) {
		for (const [key, value] of Object.entries(config.vars)) {
			// Only set if not already set (allows override)
			if (!process.env[key]) {
				process.env[key] = String(value);
			}
		}
	}
} catch (error) {
	// If wrangler.jsonc doesn't exist or can't be parsed, continue
	// The build will fail later if required vars are missing
	console.warn(
		"Warning: Could not read wrangler.jsonc for build env vars:",
		error.message,
	);
}
