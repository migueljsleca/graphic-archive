"use client";

import { useEffect, useRef, useState } from "react";

import RetroPlayerStyle from "@/components/RetroPlayerStyle";

type DragState = {
  offsetX: number;
  offsetY: number;
} | null;

export default function DraggablePlayer() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState<DragState>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateInitialPosition = () => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      setPosition({
        x: Math.max(24, window.innerWidth - player.offsetWidth - 40),
        y: 40,
      });
      setReady(true);
    };

    updateInitialPosition();
    window.addEventListener("resize", updateInitialPosition);

    return () => {
      window.removeEventListener("resize", updateInitialPosition);
    };
  }, []);

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
        x: Math.max(16, Math.min(nextX, window.innerWidth - player.offsetWidth - 16)),
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
      className={ready ? "absolute z-20" : "absolute z-20 opacity-0"}
      onPointerDown={(event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
          return;
        }

        if (!target.closest("[data-player-drag-handle]") || target.closest("button")) {
          return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();

        setDragging({
          offsetX: event.clientX - bounds.left,
          offsetY: event.clientY - bounds.top,
        });
      }}
      style={{ left: position.x, top: position.y }}
    >
      <RetroPlayerStyle />
    </div>
  );
}
