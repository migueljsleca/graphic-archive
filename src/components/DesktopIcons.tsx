"use client";

import { type ComponentType, useEffect, useRef, useState } from "react";

type IconEntry = {
  id: string;
  label: string;
  x: number;
  y: number;
  Icon?: ComponentType<{ size: number }>;
  imageSrc?: string;
};

const INITIAL_ICONS: IconEntry[] = [
  {
    id: "vista-folder",
    label: "posters",
    x: 88,
    y: 96,
    imageSrc: "/folder.svg",
  },
  {
    id: "throwback-folder",
    label: "#tbt 2010",
    x: 88,
    y: 208,
    imageSrc: "/folder.svg",
  },
];

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
} | null;

export default function DesktopIcons({
  onOpenThrowback,
}: {
  onOpenThrowback?: () => void;
}) {
  const [icons, setIcons] = useState(INITIAL_ICONS);
  const [dragging, setDragging] = useState<DragState>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragIntentRef = useRef<{ id: string; startX: number; startY: number } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      if (dragIntentRef.current) {
        const deltaX = Math.abs(event.clientX - dragIntentRef.current.startX);
        const deltaY = Math.abs(event.clientY - dragIntentRef.current.startY);

        if (deltaX > 4 || deltaY > 4) {
          suppressClickRef.current = true;
        }
      }

      const bounds = container.getBoundingClientRect();
      const nextX = event.clientX - bounds.left - dragging.offsetX;
      const nextY = event.clientY - bounds.top - dragging.offsetY;

      setIcons((currentIcons) =>
        currentIcons.map((icon) =>
          icon.id === dragging.id
            ? {
                ...icon,
                x: Math.max(12, Math.min(nextX, bounds.width - 140)),
                y: Math.max(12, Math.min(nextY, bounds.height - 90)),
              }
            : icon,
        ),
      );
    };

    const handlePointerUp = () => {
      setDragging(null);
      dragIntentRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging]);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full">
      {icons.map(({ id, label, x, y, Icon, imageSrc }) => (
        <button
          key={id}
          type="button"
          className="absolute z-10 flex w-[140px] touch-none select-none cursor-grab flex-col items-center gap-2 active:cursor-grabbing"
          onPointerDown={(event) => {
            const target = event.currentTarget.getBoundingClientRect();

            event.currentTarget.setPointerCapture(event.pointerId);
            dragIntentRef.current = {
              id,
              startX: event.clientX,
              startY: event.clientY,
            };
            suppressClickRef.current = false;
            setDragging({
              id,
              offsetX: event.clientX - target.left,
              offsetY: event.clientY - target.top,
            });
          }}
          onClick={() => {
            if (id === "throwback-folder" && !suppressClickRef.current) {
              onOpenThrowback?.();
            }

            suppressClickRef.current = false;
          }}
          style={{ left: x, top: y }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              className="pointer-events-none h-12 w-12 object-contain"
              draggable={false}
            />
          ) : Icon ? (
            <span className="pointer-events-none">
              <Icon size={48} />
            </span>
          ) : null}
          <span className="pointer-events-none font-mono text-[15px] leading-none tracking-[0.01em] text-white">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
