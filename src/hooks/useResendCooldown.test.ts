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
		const { result } = renderHook(() => useResendCooldown(60));

		expect(result.current.secondsRemaining).toBe(0);
		expect(result.current.isOnCooldown).toBe(false);
	});

	it("starts cooldown when startCooldown is called", () => {
		const { result } = renderHook(() => useResendCooldown(60));

		act(() => {
			result.current.startCooldown();
		});

		expect(result.current.secondsRemaining).toBe(60);
		expect(result.current.isOnCooldown).toBe(true);
	});

	it("counts down every second", () => {
		const { result } = renderHook(() => useResendCooldown(60));

		act(() => {
			result.current.startCooldown();
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
		const { result } = renderHook(() => useResendCooldown(3));

		act(() => {
			result.current.startCooldown();
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
		const { result } = renderHook(() => useResendCooldown(60));

		act(() => {
			result.current.startCooldown();
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

	it("uses custom cooldown duration", () => {
		const { result } = renderHook(() => useResendCooldown(30));

		act(() => {
			result.current.startCooldown();
		});

		expect(result.current.secondsRemaining).toBe(30);
	});

	it("restarts cooldown when startCooldown is called again", () => {
		const { result } = renderHook(() => useResendCooldown(60));

		act(() => {
			result.current.startCooldown();
		});

		act(() => {
			vi.advanceTimersByTime(30000);
		});

		expect(result.current.secondsRemaining).toBe(30);

		act(() => {
			result.current.startCooldown();
		});

		expect(result.current.secondsRemaining).toBe(60);
	});
});
