"use client";

import { useEffect, useRef, useState } from "react";

import AboutNotepad from "@/components/AboutNotepad";
import { cn } from "@/lib/utils";

type DragState = {
  offsetX: number;
  offsetY: number;
} | null;

export default function DraggableAboutNotepad({
  visible,
  onClose,
  onFocus,
  zIndex,
  title = "about.txt",
  paragraphs,
  links,
  closeLabel = "Close note",
  initialPosition = { x: 180, y: 140 },
}: {
  visible: boolean;
  onClose: () => void;
  onFocus?: () => void;
  zIndex?: number;
  title?: string;
  paragraphs?: string[];
  links?: { label: string; href: string }[];
  closeLabel?: string;
  initialPosition?: { x: number; y: number };
}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState<DragState>(null);
  const noteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;

    if (!visible || position) {
      return;
    }

    frame = window.requestAnimationFrame(() => {
      setPosition(initialPosition);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [initialPosition, position, visible]);

  useEffect(() => {
    const clampPosition = () => {
      const note = noteRef.current;

      if (!note || !position) {
        return;
      }

      setPosition((current) => ({
        x: Math.max(16, Math.min(current?.x ?? 16, window.innerWidth - note.offsetWidth - 16)),
        y: Math.max(16, Math.min(current?.y ?? 16, window.innerHeight - note.offsetHeight - 16)),
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
      const note = noteRef.current;

      if (!note) {
        return;
      }

      const nextX = event.clientX - dragging.offsetX;
      const nextY = event.clientY - dragging.offsetY;

      setPosition({
        x: Math.max(16, Math.min(nextX, window.innerWidth - note.offsetWidth - 16)),
        y: Math.max(16, Math.min(nextY, window.innerHeight - note.offsetHeight - 16)),
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
      ref={noteRef}
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

        if (!target.closest("[data-note-drag-handle]") || target.closest("button")) {
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
        <AboutNotepad
          onClose={onClose}
          title={title}
          paragraphs={paragraphs}
          links={links}
          closeLabel={closeLabel}
        />
      </div>
    </div>
  );
}
