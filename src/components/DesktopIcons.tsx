"use client";

import { type ComponentType, useEffect, useRef, useState } from "react";
import {
  AcidxPress,
  ThreeThousandIcons3,
  ThreeThousandIcons7,
  WindowsMusic,
  WindowsVistaFolder,
} from "react-old-icons";

type IconEntry = {
  id: string;
  label: string;
  x: number;
  y: number;
  Icon: ComponentType<{ size: number }>;
};

const INITIAL_ICONS: IconEntry[] = [
  {
    id: "vista-folder",
    label: "WindowsVistaFolder",
    x: 88,
    y: 96,
    Icon: WindowsVistaFolder,
  },
  {
    id: "windows-music",
    label: "WindowsMusic",
    x: 256,
    y: 96,
    Icon: WindowsMusic,
  },
  {
    id: "icons-3",
    label: "ThreeThousandIcons3",
    x: 432,
    y: 96,
    Icon: ThreeThousandIcons3,
  },
  {
    id: "icons-7",
    label: "ThreeThousandIcons7",
    x: 88,
    y: 224,
    Icon: ThreeThousandIcons7,
  },
  {
    id: "acidx-press",
    label: "AcidxPress",
    x: 256,
    y: 224,
    Icon: AcidxPress,
  },
];

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
} | null;

export default function DesktopIcons() {
  const [icons, setIcons] = useState(INITIAL_ICONS);
  const [dragging, setDragging] = useState<DragState>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const container = containerRef.current;

      if (!container) {
        return;
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
      {icons.map(({ id, label, x, y, Icon }) => (
        <button
          key={id}
          type="button"
          className="absolute z-10 flex w-[140px] touch-none select-none cursor-grab flex-col items-center gap-2 active:cursor-grabbing"
          onPointerDown={(event) => {
            const target = event.currentTarget.getBoundingClientRect();

            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging({
              id,
              offsetX: event.clientX - target.left,
              offsetY: event.clientY - target.top,
            });
          }}
          style={{ left: x, top: y }}
        >
          <span className="pointer-events-none">
            <Icon size={48} />
          </span>
          <span className="pointer-events-none font-mono text-[15px] leading-none tracking-[0.01em] text-white">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
