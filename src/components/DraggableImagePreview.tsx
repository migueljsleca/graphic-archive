"use client";

import { useEffect, useRef, useState } from "react";

import ImagePreviewWindow from "@/components/ImagePreviewWindow";
import { cn } from "@/lib/utils";

type DragState = {
  offsetX: number;
  offsetY: number;
} | null;

export default function DraggableImagePreview({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState<DragState>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;

    if (!visible || position) {
      return;
    }

    frame = window.requestAnimationFrame(() => {
      setPosition({
        x: 320,
        y: 110,
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [position, visible]);

  useEffect(() => {
    const clampPosition = () => {
      const preview = previewRef.current;

      if (!preview || !position) {
        return;
      }

      setPosition((current) => ({
        x: Math.max(
          16,
          Math.min(current?.x ?? 16, window.innerWidth - preview.offsetWidth - 16),
        ),
        y: Math.max(
          16,
          Math.min(current?.y ?? 16, window.innerHeight - preview.offsetHeight - 16),
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
      const preview = previewRef.current;

      if (!preview) {
        return;
      }

      const nextX = event.clientX - dragging.offsetX;
      const nextY = event.clientY - dragging.offsetY;

      setPosition({
        x: Math.max(16, Math.min(nextX, window.innerWidth - preview.offsetWidth - 16)),
        y: Math.max(16, Math.min(nextY, window.innerHeight - preview.offsetHeight - 16)),
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
      ref={previewRef}
      className={cn("absolute z-20", !visible && "pointer-events-none")}
      onPointerDown={(event) => {
        if (!visible) {
          return;
        }

        const target = event.target;

        if (!(target instanceof Element)) {
          return;
        }

        if (!target.closest("[data-image-drag-handle]") || target.closest("button")) {
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
        left: position ? position.x : "50%",
        top: position ? position.y : "50%",
        transform: position ? undefined : "translate(-50%, -50%)",
      }}
    >
      <div
        className={cn(
          "origin-center transition-[opacity,transform] duration-160 ease-out will-change-[opacity,transform]",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.985]",
        )}
        aria-hidden={!visible}
      >
        <ImagePreviewWindow onClose={onClose} />
      </div>
    </div>
  );
}
