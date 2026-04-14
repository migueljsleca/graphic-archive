"use client";

import { useEffect, useRef, useState } from "react";

import RetroPlayerStyle from "@/components/RetroPlayerStyle";
import { cn } from "@/lib/utils";

type DragState = {
  offsetX: number;
  offsetY: number;
} | null;

export default function DraggablePlayer({
  openVersion,
  visible,
  onClose,
}: {
  openVersion: number;
  visible: boolean;
  onClose: () => void;
}) {
  const [position, setPosition] = useState<{ right: number; y: number } | null>(null);
  const [dragging, setDragging] = useState<DragState>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let resetFrame = 0;
    let lockFrame = 0;

    if (!visible) {
      return;
    }

    resetFrame = window.requestAnimationFrame(() => {
      setPosition(null);

      lockFrame = window.requestAnimationFrame(() => {
        const player = playerRef.current;

        if (!player) {
          return;
        }

        const bounds = player.getBoundingClientRect();
        setPosition({
          right: Math.round(window.innerWidth - bounds.right),
          y: Math.round(bounds.top),
        });
      });
    });

    return () => {
      window.cancelAnimationFrame(resetFrame);
      window.cancelAnimationFrame(lockFrame);
    };
  }, [openVersion, visible]);

  useEffect(() => {
    const clampPosition = () => {
      const player = playerRef.current;

      if (!player || !position) {
        return;
      }

      setPosition((current) => ({
        right: Math.max(
          16,
          Math.min(current?.right ?? 16, window.innerWidth - player.offsetWidth - 16),
        ),
        y: Math.max(
          16,
          Math.min(current?.y ?? 16, window.innerHeight - player.offsetHeight - 16),
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
      const player = playerRef.current;

      if (!player) {
        return;
      }

      const nextX = event.clientX - dragging.offsetX;
      const nextY = event.clientY - dragging.offsetY;

      setPosition({
        right: Math.max(
          16,
          Math.min(
            window.innerWidth - nextX - player.offsetWidth,
            window.innerWidth - player.offsetWidth - 16,
          ),
        ),
        y: Math.max(16, Math.min(nextY, window.innerHeight - player.offsetHeight - 16)),
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
      ref={playerRef}
      className={cn("absolute z-20", !visible && "pointer-events-none")}
      onPointerDown={(event) => {
        if (!visible) {
          return;
        }

        const target = event.target;

        if (!(target instanceof Element)) {
          return;
        }

        if (!target.closest("[data-player-drag-handle]") || target.closest("button")) {
          return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();

        if (!position) {
          setPosition({
            right: Math.round(window.innerWidth - bounds.right),
            y: Math.round(bounds.top),
          });
        }

        setDragging({
          offsetX: event.clientX - bounds.left,
          offsetY: event.clientY - bounds.top,
        });
      }}
      style={{
        right: position ? position.right : "50%",
        top: position ? position.y : "50%",
        transform: position ? undefined : "translate(-50%, -50%)",
      }}
    >
      <div
        className={cn(
          "origin-top-right transition-[opacity,transform] duration-160 ease-out will-change-[opacity,transform]",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.985]",
        )}
        aria-hidden={!visible}
      >
        <RetroPlayerStyle
          isVisible={visible}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
