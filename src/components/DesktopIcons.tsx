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
const DEFAULT_VIEWPORT_HEIGHT = 900;
const DEFAULT_VIEWPORT_WIDTH = 1600;
const DEFAULT_ICON_LAYOUT = {
  posters: { xRatio: 0.13, yRatio: 0.43 },
  social: { xRatio: 0.14, yRatio: 0.67 },
  editorial: { xRatio: 0.37, yRatio: 0.67 },
  visualIdentities: { xRatio: 0.48, yRatio: 0.64 },
  paint: { xRatio: 0.58, yRatio: 0.49 },
  about: { xRatio: 0.23, yRatio: 0.54 },
  whereToFindMe: { xRatio: 0.4, yRatio: 0.53 },
  image: { xRatio: 0.285, yRatio: 0.695 },
  throwback: { xRatio: 0.325, yRatio: 0.495 },
};

const resolveIconPosition = (
  viewportWidth: number,
  viewportHeight: number,
  xRatio: number,
  yRatio: number,
) => ({
  x: Math.round(viewportWidth * xRatio),
  y: Math.round(
    Math.min(
      viewportHeight * yRatio,
      viewportHeight - DESKTOP_ICON_HEIGHT - 24,
    ),
  ),
});

const createInitialIcons = (
  viewportWidth = DEFAULT_VIEWPORT_WIDTH,
  viewportHeight = DEFAULT_VIEWPORT_HEIGHT,
): IconEntry[] => {
  const postersPosition = resolveIconPosition(
    viewportWidth,
    viewportHeight,
    DEFAULT_ICON_LAYOUT.posters.xRatio,
    DEFAULT_ICON_LAYOUT.posters.yRatio,
  );
  const socialPosition = resolveIconPosition(
    viewportWidth,
    viewportHeight,
    DEFAULT_ICON_LAYOUT.social.xRatio,
    DEFAULT_ICON_LAYOUT.social.yRatio,
  );
  const aboutPosition = resolveIconPosition(
    viewportWidth,
    viewportHeight,
    DEFAULT_ICON_LAYOUT.about.xRatio,
    DEFAULT_ICON_LAYOUT.about.yRatio,
  );
  const editorialPosition = resolveIconPosition(
    viewportWidth,
    viewportHeight,
    DEFAULT_ICON_LAYOUT.editorial.xRatio,
    DEFAULT_ICON_LAYOUT.editorial.yRatio,
  );
  const paintPosition = resolveIconPosition(
    viewportWidth,
    viewportHeight,
    DEFAULT_ICON_LAYOUT.paint.xRatio,
    DEFAULT_ICON_LAYOUT.paint.yRatio,
  );
  const whereToFindMePosition = resolveIconPosition(
    viewportWidth,
    viewportHeight,
    DEFAULT_ICON_LAYOUT.whereToFindMe.xRatio,
    DEFAULT_ICON_LAYOUT.whereToFindMe.yRatio,
  );
  const imagePosition = resolveIconPosition(
    viewportWidth,
    viewportHeight,
    DEFAULT_ICON_LAYOUT.image.xRatio,
    DEFAULT_ICON_LAYOUT.image.yRatio,
  );
  const visualIdentitiesPosition = resolveIconPosition(
    viewportWidth,
    viewportHeight,
    DEFAULT_ICON_LAYOUT.visualIdentities.xRatio,
    DEFAULT_ICON_LAYOUT.visualIdentities.yRatio,
  );
  const throwbackPosition = resolveIconPosition(
    viewportWidth,
    viewportHeight,
    DEFAULT_ICON_LAYOUT.throwback.xRatio,
    DEFAULT_ICON_LAYOUT.throwback.yRatio,
  );

  return [
    {
      id: "vista-folder",
      label: "posters + misc",
      x: postersPosition.x,
      y: postersPosition.y,
      imageSrc: "/folder.svg",
    },
    {
      id: "social-folder",
      label: "social media graphics",
      x: socialPosition.x,
      y: socialPosition.y,
      imageSrc: "/folder.svg",
    },
    {
      id: "throwback-folder",
      label: "#tbt 2010",
      x: throwbackPosition.x,
      y: throwbackPosition.y,
      imageSrc: "/music.svg",
    },
    {
      id: "editorial-folder",
      label: "editorial",
      x: editorialPosition.x,
      y: editorialPosition.y,
      imageSrc: "/folder.svg",
    },
    {
      id: "visual-identities-folder",
      label: "visual identities",
      x: visualIdentitiesPosition.x,
      y: visualIdentitiesPosition.y,
      imageSrc: "/folder.svg",
    },
    {
      id: "paint-app",
      label: "paint",
      x: paintPosition.x,
      y: paintPosition.y,
      imageSrc: "/paint.svg",
    },
    {
      id: "about-file",
      label: "about.txt",
      x: aboutPosition.x,
      y: aboutPosition.y,
      imageSrc: "/text.svg",
    },
    {
      id: "where-to-find-me-file",
      label: "links",
      x: whereToFindMePosition.x,
      y: whereToFindMePosition.y,
      imageSrc: "/text.svg",
    },
    {
      id: "image-file",
      label: "image-3713.png",
      x: imagePosition.x,
      y: imagePosition.y,
      imageSrc: "/image.svg",
    },
  ];
};

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
} | null;

export default function DesktopIcons({
  onOpenPosters,
  onOpenSocialMedia,
  onOpenEditorial,
  onOpenVisualIdentities,
  onOpenPaint,
  onOpenAbout,
  onOpenWhereToFindMe,
  onOpenImage,
  onOpenThrowback,
}: {
  onOpenPosters?: () => void;
  onOpenSocialMedia?: () => void;
  onOpenEditorial?: () => void;
  onOpenVisualIdentities?: () => void;
  onOpenPaint?: () => void;
  onOpenAbout?: () => void;
  onOpenWhereToFindMe?: () => void;
  onOpenImage?: () => void;
  onOpenThrowback?: () => void;
}) {
  const [icons, setIcons] = useState<IconEntry[]>(() =>
    createInitialIcons(),
  );
  const [dragging, setDragging] = useState<DragState>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragIntentRef = useRef<{ id: string; startX: number; startY: number } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const syncToViewport = () => {
      setIcons(createInitialIcons(window.innerWidth, window.innerHeight));
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

            if (id === "where-to-find-me-file" && !suppressClickRef.current) {
              onOpenWhereToFindMe?.();
            }

            if (id === "throwback-folder" && !suppressClickRef.current) {
              onOpenThrowback?.();
            }

            if (id === "social-folder" && !suppressClickRef.current) {
              onOpenSocialMedia?.();
            }

            if (id === "editorial-folder" && !suppressClickRef.current) {
              onOpenEditorial?.();
            }

            if (id === "visual-identities-folder" && !suppressClickRef.current) {
              onOpenVisualIdentities?.();
            }

            if (id === "paint-app" && !suppressClickRef.current) {
              onOpenPaint?.();
            }

            if (id === "image-file" && !suppressClickRef.current) {
              onOpenImage?.();
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
