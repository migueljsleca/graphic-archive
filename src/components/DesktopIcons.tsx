"use client";

import { type ComponentType, useEffect, useRef, useState } from "react";
import Image from "next/image";

type IconEntry = {
  id: string;
  label: string;
  x: number;
  y: number;
  Icon?: ComponentType<{ size: number }>;
  imageSrc?: string;
};

const DESKTOP_ICON_HEIGHT = 90;
const DESKTOP_ICON_GAP = 22;
const DEFAULT_VIEWPORT_HEIGHT = 900;
const DESKTOP_LEFT_COLUMN_X = 88;
const DESKTOP_RIGHT_COLUMN_X = 216;

const getBottomGridY = (viewportHeight: number, row: number) => {
  const gridHeight = DESKTOP_ICON_HEIGHT * 2 + DESKTOP_ICON_GAP;
  const gridStart = Math.max(96, viewportHeight - gridHeight - 40);

  return gridStart + row * (DESKTOP_ICON_HEIGHT + DESKTOP_ICON_GAP);
};

const createInitialIcons = (
  viewportHeight = DEFAULT_VIEWPORT_HEIGHT,
): IconEntry[] => [
  {
    id: "vista-folder",
    label: "posters",
    x: DESKTOP_LEFT_COLUMN_X,
    y: getBottomGridY(viewportHeight, 0),
    imageSrc: "/folder.svg",
  },
  {
    id: "throwback-folder",
    label: "#tbt 2010",
    x: DESKTOP_LEFT_COLUMN_X,
    y: getBottomGridY(viewportHeight, 1),
    imageSrc: "/music.svg",
  },
  {
    id: "about-file",
    label: "about.txt",
    x: DESKTOP_RIGHT_COLUMN_X,
    y: getBottomGridY(viewportHeight, 0),
    imageSrc: "/text.svg",
  },
  {
    id: "image-file",
    label: "image-3713.png",
    x: DESKTOP_RIGHT_COLUMN_X,
    y: getBottomGridY(viewportHeight, 1),
    imageSrc: "/image.svg",
  },
];

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
} | null;

export default function DesktopIcons({
  onOpenPosters,
  onOpenAbout,
  onOpenImage,
  onOpenThrowback,
}: {
  onOpenPosters?: () => void;
  onOpenAbout?: () => void;
  onOpenImage?: () => void;
  onOpenThrowback?: () => void;
}) {
  const [icons, setIcons] = useState<IconEntry[]>(() => createInitialIcons());
  const [dragging, setDragging] = useState<DragState>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragIntentRef = useRef<{ id: string; startX: number; startY: number } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const syncToViewport = () => {
      setIcons(createInitialIcons(window.innerHeight));
    };

    const frame = window.requestAnimationFrame(syncToViewport);
    window.addEventListener("resize", syncToViewport);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncToViewport);
    };
  }, []);

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
            if (id === "vista-folder" && !suppressClickRef.current) {
              onOpenPosters?.();
            }

            if (id === "about-file" && !suppressClickRef.current) {
              onOpenAbout?.();
            }

            if (id === "image-file" && !suppressClickRef.current) {
              onOpenImage?.();
            }

            if (id === "throwback-folder" && !suppressClickRef.current) {
              onOpenThrowback?.();
            }

            suppressClickRef.current = false;
          }}
          style={{ left: x, top: y }}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              width={48}
              height={48}
              className="pointer-events-none h-[54px] w-[54px] object-contain"
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
