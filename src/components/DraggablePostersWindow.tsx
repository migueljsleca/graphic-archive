"use client";

import { useEffect, useRef, useState } from "react";

import PostersWindow from "@/components/PostersWindow";
import { cn } from "@/lib/utils";

type DragState = {
  offsetX: number;
  offsetY: number;
} | null;

export default function DraggablePostersWindow({
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
  const [dragging, setDragging] = useState<DragState>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;

    if (!visible || position) {
      return;
    }

    frame = window.requestAnimationFrame(() => {
      setPosition({
        x: window.innerWidth * 0.05,
        y: window.innerHeight * 0.05,
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [position, visible]);

  useEffect(() => {
    const clampPosition = () => {
      const element = windowRef.current;

      if (!element || !position) {
        return;
      }

      setPosition((current) => ({
        x: Math.max(
          8,
          Math.min(current?.x ?? 8, window.innerWidth - element.offsetWidth - 8),
        ),
        y: Math.max(
          8,
          Math.min(current?.y ?? 8, window.innerHeight - element.offsetHeight - 8),
        ),
      }));
    };

    window.addEventListener("resize", clampPosition);

    return () => {
      window.removeEventListener("resize", clampPosition);
    };
  }, [position]);

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

      setPosition({
        x: Math.max(8, Math.min(nextX, window.innerWidth - element.offsetWidth - 8)),
        y: Math.max(8, Math.min(nextY, window.innerHeight - element.offsetHeight - 8)),
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
  }, [dragging]);

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
        if (!visible) {
          return;
        }

        const target = event.target;

        if (!(target instanceof Element)) {
          return;
        }

        if (!target.closest("[data-posters-drag-handle]") || target.closest("button")) {
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
        left: position ? position.x : "5vw",
        top: position ? position.y : "5vh",
        zIndex,
      }}
    >
      <div
        className={cn(
          "origin-center transition-[opacity,transform] duration-160 ease-out will-change-[opacity,transform]",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.985]",
        )}
        aria-hidden={!visible}
      >
        <PostersWindow onClose={onClose} />
      </div>
    </div>
  );
}
