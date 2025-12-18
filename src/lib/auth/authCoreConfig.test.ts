import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthCoreBaseUrl, getAuthEnvironment } from "./authCoreConfig";

describe("authCoreConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe("getAuthCoreBaseUrl", () => {
		it("returns URL from NEXT_PUBLIC_AUTH_CORE_BASE_URL", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL =
				"https://auth-svc.janovix.workers.dev";
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			const url = getAuthCoreBaseUrl();
			expect(url).toBe("https://auth-svc.janovix.workers.dev");
		});

		it("throws error when URL is missing protocol", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL =
				"auth-svc.janovix.workers.dev";
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			expect(() => getAuthCoreBaseUrl()).toThrow(
				'NEXT_PUBLIC_AUTH_CORE_BASE_URL must include the protocol (https://). Got: "auth-svc.janovix.workers.dev"',
			);
		});

		it("throws error when environment variable is not set", () => {
			delete process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL;
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			expect(() => getAuthCoreBaseUrl()).toThrow(
				"NEXT_PUBLIC_AUTH_CORE_BASE_URL environment variable is not set",
			);
		});
	});

	describe("getAuthEnvironment", () => {
		it("returns prod for .janovix.ai URL", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL =
				"https://auth-svc.janovix.ai";
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			const env = getAuthEnvironment();
			expect(env).toBe("prod");
		});

		it("returns dev for .workers.dev URL", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL =
				"https://auth-svc.janovix.workers.dev";
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			const env = getAuthEnvironment();
			expect(env).toBe("dev");
		});
	});
});
