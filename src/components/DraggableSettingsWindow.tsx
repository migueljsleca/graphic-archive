"use client";

import { useEffect, useRef, useState } from "react";

import SettingsWindow from "@/components/SettingsWindow";
import { cn } from "@/lib/utils";

type TitleControls = {
  weight: number;
  slant: number;
  elementShape: number;
  style: "double" | "single";
};

type SettingsMode = "cursor" | "manual";

type DragState = {
  offsetX: number;
  offsetY: number;
} | null;

export default function DraggableSettingsWindow({
  visible,
  onClose,
  onFocus,
  zIndex,
  controls,
  onControlsChange,
  mode,
  onModeChange,
}: {
  visible: boolean;
  onClose: () => void;
  onFocus?: () => void;
  zIndex?: number;
  controls: TitleControls;
  onControlsChange: (nextControls: TitleControls) => void;
  mode: SettingsMode;
  onModeChange: (nextMode: SettingsMode) => void;
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
      const panel = windowRef.current;
      const panelWidth = panel?.offsetWidth ?? 332;

      setPosition({
        x: Math.max(16, window.innerWidth - panelWidth - 56),
        y: 64,
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [position, visible]);

  useEffect(() => {
    const clampPosition = () => {
      const panel = windowRef.current;

      if (!panel || !position) {
        return;
      }

      setPosition((current) => ({
        x: Math.max(16, Math.min(current?.x ?? 16, window.innerWidth - panel.offsetWidth - 16)),
        y: Math.max(16, Math.min(current?.y ?? 16, window.innerHeight - panel.offsetHeight - 16)),
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
      const panel = windowRef.current;

      if (!panel) {
        return;
      }

      const nextX = event.clientX - dragging.offsetX;
      const nextY = event.clientY - dragging.offsetY;

      setPosition({
        x: Math.max(16, Math.min(nextX, window.innerWidth - panel.offsetWidth - 16)),
        y: Math.max(16, Math.min(nextY, window.innerHeight - panel.offsetHeight - 16)),
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

        if (!target.closest("[data-settings-drag-handle]") || target.closest("button")) {
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
        <SettingsWindow
          onClose={onClose}
          controls={controls}
          onControlsChange={onControlsChange}
          mode={mode}
          onModeChange={onModeChange}
        />
      </div>
    </div>
  );
}
