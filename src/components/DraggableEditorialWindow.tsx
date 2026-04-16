"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import EditorialWindow from "@/components/EditorialWindow";
import { cn } from "@/lib/utils";

type DragState = {
  offsetX: number;
  offsetY: number;
} | null;

type ResizeEdge =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-right"
  | "bottom-left";

type ResizeState = {
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  startWidth: number;
  startHeight: number;
  edge: ResizeEdge;
} | null;

type WindowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const MIN_WIDTH = 480;
const MIN_HEIGHT = 340;
const MAXIMIZED_VIEWPORT_RATIO = 0.98;
const INITIAL_VIEWPORT_WIDTH_RATIO = 0.72;
const INITIAL_VIEWPORT_HEIGHT_RATIO = 0.78;

const RESIZE_HANDLES: Array<{
  edge: ResizeEdge;
  className: string;
  cursor: CSSProperties["cursor"];
}> = [
  {
    edge: "top",
    className:
      "top-0 left-[8px] right-[8px] h-2 -translate-y-1/2 cursor-ns-resize",
    cursor: "ns-resize",
  },
  {
    edge: "right",
    className:
      "top-[8px] right-0 bottom-[8px] w-2 translate-x-1/2 cursor-ew-resize",
    cursor: "ew-resize",
  },
  {
    edge: "bottom",
    className:
      "right-[8px] bottom-0 left-[8px] h-2 translate-y-1/2 cursor-ns-resize",
    cursor: "ns-resize",
  },
  {
    edge: "left",
    className:
      "top-[8px] bottom-[8px] left-0 w-2 -translate-x-1/2 cursor-ew-resize",
    cursor: "ew-resize",
  },
  {
    edge: "top-left",
    className: "top-0 left-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
    cursor: "nwse-resize",
  },
  {
    edge: "top-right",
    className: "top-0 right-0 h-4 w-4 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
    cursor: "nesw-resize",
  },
  {
    edge: "bottom-right",
    className: "right-0 bottom-0 h-4 w-4 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
    cursor: "nwse-resize",
  },
  {
    edge: "bottom-left",
    className: "bottom-0 left-0 h-4 w-4 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
    cursor: "nesw-resize",
  },
];

export default function DraggableEditorialWindow({
  visible,
  onClose,
  onFocus,
  zIndex,
}: {
  visible: boolean;
  onClose: () => void;
  onFocus?: () => void;
  zIndex?: number;
}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [dragging, setDragging] = useState<DragState>(null);
  const [resizing, setResizing] = useState<ResizeState>(null);
  const [maximized, setMaximized] = useState(false);
  const [restoredBounds, setRestoredBounds] = useState<WindowBounds | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);

  const getMaximizedBounds = () => {
    const width = window.innerWidth * MAXIMIZED_VIEWPORT_RATIO;
    const height = window.innerHeight * MAXIMIZED_VIEWPORT_RATIO;

    return {
      x: (window.innerWidth - width) / 2,
      y: (window.innerHeight - height) / 2,
      width,
      height,
    };
  };

  useEffect(() => {
    let frame = 0;

    if (!visible || (position && size)) {
      return;
    }

    frame = window.requestAnimationFrame(() => {
      if (!position) {
        setPosition({
          x: window.innerWidth * 0.18,
          y: window.innerHeight * 0.12,
        });
      }

      if (!size) {
        setSize({
          width: window.innerWidth * INITIAL_VIEWPORT_WIDTH_RATIO,
          height: window.innerHeight * INITIAL_VIEWPORT_HEIGHT_RATIO,
        });
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [position, size, visible]);

  useEffect(() => {
    const clampPosition = () => {
      const element = windowRef.current;

      if (!element || !position) {
        return;
      }

      if (maximized) {
        const bounds = getMaximizedBounds();
        setPosition({ x: bounds.x, y: bounds.y });
        setSize({
          width: bounds.width,
          height: bounds.height,
        });
        return;
      }

      setSize((current) => {
        if (!current) {
          return current;
        }

        return {
          width: Math.min(current.width, window.innerWidth),
          height: Math.min(current.height, window.innerHeight),
        };
      });

      setPosition((current) => {
        const currentSize = size ?? {
          width: element.offsetWidth,
          height: element.offsetHeight,
        };

        return {
          x: Math.max(0, Math.min(current?.x ?? 0, window.innerWidth - currentSize.width)),
          y: Math.max(0, Math.min(current?.y ?? 0, window.innerHeight - currentSize.height)),
        };
      });
    };

    window.addEventListener("resize", clampPosition);

    return () => {
      window.removeEventListener("resize", clampPosition);
    };
  }, [maximized, position, size]);

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const element = windowRef.current;

      if (!element) {
        return;
      }

      const nextX = event.clientX - dragging.offsetX;
      const nextY = event.clientY - dragging.offsetY;
      const width = size?.width ?? element.offsetWidth;
      const height = size?.height ?? element.offsetHeight;

      setPosition({
        x: Math.max(0, Math.min(nextX, window.innerWidth - width)),
        y: Math.max(0, Math.min(nextY, window.innerHeight - height)),
      });
    };

    const handlePointerUp = () => {
      setDragging(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging, size]);

  useEffect(() => {
    if (!resizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const deltaX = event.clientX - resizing.startX;
      const deltaY = event.clientY - resizing.startY;
      let nextX = resizing.startLeft;
      let nextY = resizing.startTop;
      let nextWidth = resizing.startWidth;
      let nextHeight = resizing.startHeight;

      if (resizing.edge.includes("right")) {
        nextWidth = Math.min(
          Math.max(MIN_WIDTH, resizing.startWidth + deltaX),
          window.innerWidth - resizing.startLeft,
        );
      }

      if (resizing.edge.includes("left")) {
        const proposedLeft = Math.min(
          Math.max(0, resizing.startLeft + deltaX),
          resizing.startLeft + resizing.startWidth - MIN_WIDTH,
        );
        nextX = proposedLeft;
        nextWidth = resizing.startWidth - (proposedLeft - resizing.startLeft);
      }

      if (resizing.edge.includes("bottom")) {
        nextHeight = Math.min(
          Math.max(MIN_HEIGHT, resizing.startHeight + deltaY),
          window.innerHeight - resizing.startTop,
        );
      }

      if (resizing.edge.includes("top")) {
        const proposedTop = Math.min(
          Math.max(0, resizing.startTop + deltaY),
          resizing.startTop + resizing.startHeight - MIN_HEIGHT,
        );
        nextY = proposedTop;
        nextHeight = resizing.startHeight - (proposedTop - resizing.startTop);
      }

      setPosition({ x: nextX, y: nextY });
      setSize({ width: nextWidth, height: nextHeight });
    };

    const handlePointerUp = () => {
      setResizing(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizing]);

  const handleToggleMaximize = () => {
    const currentPosition = position;
    const currentSize = size;

    if (!currentPosition || !currentSize) {
      return;
    }

    if (maximized) {
      const nextBounds = restoredBounds ?? {
        x: window.innerWidth * 0.18,
        y: window.innerHeight * 0.12,
        width: window.innerWidth * INITIAL_VIEWPORT_WIDTH_RATIO,
        height: window.innerHeight * INITIAL_VIEWPORT_HEIGHT_RATIO,
      };

      setPosition({ x: nextBounds.x, y: nextBounds.y });
      setSize({ width: nextBounds.width, height: nextBounds.height });
      setMaximized(false);
      return;
    }

    setRestoredBounds({
      x: currentPosition.x,
      y: currentPosition.y,
      width: currentSize.width,
      height: currentSize.height,
    });
    const bounds = getMaximizedBounds();
    setPosition({ x: bounds.x, y: bounds.y });
    setSize({ width: bounds.width, height: bounds.height });
    setMaximized(true);
  };

  return (
    <div
      ref={windowRef}
      className={cn("absolute", !visible && "pointer-events-none")}
      onPointerDownCapture={() => {
        if (visible) {
          onFocus?.();
        }
      }}
      onPointerDown={(event) => {
        if (!visible || maximized) {
          return;
        }

        const target = event.target;

        if (!(target instanceof Element)) {
          return;
        }

        if (
          !target.closest("[data-editorial-drag-handle]") ||
          target.closest("[data-editorial-control]")
        ) {
          return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();

        if (!position) {
          setPosition({ x: bounds.left, y: bounds.top });
        }

        setDragging({
          offsetX: event.clientX - bounds.left,
          offsetY: event.clientY - bounds.top,
        });
      }}
      style={{
        left: position ? position.x : 0,
        top: position ? position.y : 0,
        width: size ? size.width : "72vw",
        height: size ? size.height : "78vh",
        zIndex,
      }}
    >
      <div
        className={cn(
          "h-full w-full origin-center transition-[opacity,transform] duration-160 ease-out will-change-[opacity,transform]",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.985]",
        )}
        aria-hidden={!visible}
      >
        <EditorialWindow
          maximized={maximized}
          onToggleMaximize={handleToggleMaximize}
          onClose={onClose}
        />
      </div>
      {!maximized ? (
        <>
          {RESIZE_HANDLES.map((handle) => (
            <button
              key={handle.edge}
              type="button"
              aria-label={`Resize editorial window from ${handle.edge}`}
              className={cn("absolute z-20 bg-transparent p-0", handle.className)}
              style={{ cursor: handle.cursor }}
              onPointerDown={(event) => {
                event.stopPropagation();

                if (!size || !position) {
                  return;
                }

                setResizing({
                  edge: handle.edge,
                  startX: event.clientX,
                  startY: event.clientY,
                  startLeft: position.x,
                  startTop: position.y,
                  startWidth: size.width,
                  startHeight: size.height,
                });
              }}
            />
          ))}
        </>
      ) : null}
    </div>
  );
}
