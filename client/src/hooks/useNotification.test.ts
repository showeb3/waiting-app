import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotification } from "./useNotification";

describe("useNotification Hook", () => {
  let mockServiceWorkerContainer: any;

  beforeEach(() => {
    // Mock Service Worker
    mockServiceWorkerContainer = {
      controller: {},
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(navigator, "serviceWorker", {
      value: mockServiceWorkerContainer,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty notifications", () => {
    const { result } = renderHook(() => useNotification());

    expect(result.current.notifications).toEqual([]);
  });

  it("should add notification", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        id: "1",
        type: "almost_your_turn",
        titleKey: "notification.title",
        bodyKey: "notification.body",
        duration: 5000,
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]?.type).toBe("almost_your_turn");
  });

  it("should remove notification", () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        id: "1",
        type: "info",
        titleKey: "notification.title",
        bodyKey: "notification.body",
      });
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification("1");
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it("should auto-remove notification after duration", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification({
        id: "1",
        type: "info",
        titleKey: "notification.title",
        bodyKey: "notification.body",
        duration: 1000,
      });
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(0);

    vi.useRealTimers();
  });

  it("should listen for Service Worker messages", () => {
    renderHook(() => useNotification());

    expect(mockServiceWorkerContainer.addEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function)
    );
  });

  it("should handle PUSH_NOTIFICATION message from Service Worker", () => {
    const { result } = renderHook(() => useNotification());

    const messageHandler = mockServiceWorkerContainer.addEventListener.mock.calls[0]?.[1];

    if (messageHandler) {
      act(() => {
        messageHandler({
          data: {
            type: "PUSH_NOTIFICATION",
            payload: {
              title: "Test Title",
              body: "Test Body - 3",
            },
          },
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]?.type).toBe("almost_your_turn");
    }
  });

  it("should clean up event listener on unmount", () => {
    const { unmount } = renderHook(() => useNotification());

    unmount();

    expect(mockServiceWorkerContainer.removeEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function)
    );
  });
});
