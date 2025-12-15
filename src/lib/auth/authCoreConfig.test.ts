import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
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
		it("returns URL from NEXT_PUBLIC_AUTH_CORE_BASE_URL for client-side", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL =
				"auth-svc.janovix.workers.dev";
			// Mock window to simulate client-side
			global.window = { location: {} } as any;
			const url = getAuthCoreBaseUrl();
			expect(url).toBe("https://auth-svc.janovix.workers.dev");
		});

		it("returns URL from AUTH_CORE_BASE_URL for server-side", () => {
			process.env.AUTH_CORE_BASE_URL = "auth-svc.janovix.ai";
			// Mock window as undefined to simulate server-side
			delete (global as any).window;
			const url = getAuthCoreBaseUrl();
			expect(url).toBe("https://auth-svc.janovix.ai");
		});

		it("handles URL with protocol already included", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL =
				"https://auth-svc.janovix.workers.dev";
			global.window = { location: {} } as any;
			const url = getAuthCoreBaseUrl();
			expect(url).toBe("https://auth-svc.janovix.workers.dev");
		});

		it("throws error when environment variable is not set", () => {
			delete process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL;
			delete process.env.AUTH_CORE_BASE_URL;
			global.window = { location: {} } as any;
			expect(() => getAuthCoreBaseUrl()).toThrow(
				"AUTH_CORE_BASE_URL or NEXT_PUBLIC_AUTH_CORE_BASE_URL environment variable is not set",
			);
		});
	});

	describe("getAuthEnvironment", () => {
		it("returns prod for .janovix.ai URL", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL = "auth-svc.janovix.ai";
			global.window = { location: {} } as any;
			const env = getAuthEnvironment();
			expect(env).toBe("prod");
		});

		it("returns dev for .workers.dev URL", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL =
				"auth-svc.janovix.workers.dev";
			global.window = { location: {} } as any;
			const env = getAuthEnvironment();
			expect(env).toBe("dev");
		});
	});
});
