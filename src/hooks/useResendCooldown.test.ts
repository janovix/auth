import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useResendCooldown } from "./useResendCooldown";

describe("useResendCooldown", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("starts with no cooldown active", () => {
		const { result } = renderHook(() => useResendCooldown());

		expect(result.current.secondsRemaining).toBe(0);
		expect(result.current.isOnCooldown).toBe(false);
	});

	it("starts cooldown when startCooldown is called with duration", () => {
		const { result } = renderHook(() => useResendCooldown());

		act(() => {
			result.current.startCooldown(60);
		});

		expect(result.current.secondsRemaining).toBe(60);
		expect(result.current.isOnCooldown).toBe(true);
	});

	it("counts down every second", () => {
		const { result } = renderHook(() => useResendCooldown());

		act(() => {
			result.current.startCooldown(60);
		});

		expect(result.current.secondsRemaining).toBe(60);

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		expect(result.current.secondsRemaining).toBe(59);

		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(result.current.secondsRemaining).toBe(54);
	});

	it("stops at 0 and clears cooldown", () => {
		const { result } = renderHook(() => useResendCooldown());

		act(() => {
			result.current.startCooldown(3);
		});

		expect(result.current.secondsRemaining).toBe(3);
		expect(result.current.isOnCooldown).toBe(true);

		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect(result.current.secondsRemaining).toBe(0);
		expect(result.current.isOnCooldown).toBe(false);
	});

	it("resets cooldown when resetCooldown is called", () => {
		const { result } = renderHook(() => useResendCooldown());

		act(() => {
			result.current.startCooldown(60);
		});

		expect(result.current.secondsRemaining).toBe(60);

		act(() => {
			vi.advanceTimersByTime(10000);
		});

		expect(result.current.secondsRemaining).toBe(50);

		act(() => {
			result.current.resetCooldown();
		});

		expect(result.current.secondsRemaining).toBe(0);
		expect(result.current.isOnCooldown).toBe(false);
	});

	it("accepts custom cooldown duration via startCooldown parameter", () => {
		const { result } = renderHook(() => useResendCooldown());

		act(() => {
			result.current.startCooldown(30);
		});

		expect(result.current.secondsRemaining).toBe(30);
	});

	it("restarts cooldown when startCooldown is called again", () => {
		const { result } = renderHook(() => useResendCooldown());

		act(() => {
			result.current.startCooldown(60);
		});

		act(() => {
			vi.advanceTimersByTime(30000);
		});

		expect(result.current.secondsRemaining).toBe(30);

		act(() => {
			result.current.startCooldown(60);
		});

		expect(result.current.secondsRemaining).toBe(60);
	});

	it("accepts different durations for different rate limit scenarios", () => {
		const { result } = renderHook(() => useResendCooldown());

		// First rate limit with 30 seconds
		act(() => {
			result.current.startCooldown(30);
		});

		expect(result.current.secondsRemaining).toBe(30);

		act(() => {
			vi.advanceTimersByTime(31000);
		});

		expect(result.current.secondsRemaining).toBe(0);

		// Second rate limit with 60 seconds
		act(() => {
			result.current.startCooldown(60);
		});

		expect(result.current.secondsRemaining).toBe(60);
	});
});
