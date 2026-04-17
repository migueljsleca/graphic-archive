"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { Card } from "@/components/retroui";
import { Slider } from "@/components/retroui/Slider";
import { cn } from "@/lib/utils";
import styles from "@/components/PostersWindow.module.css";

type PosterAsset = {
  name: string;
  src: string;
  width: number;
  height: number;
};

type ScrollMetrics = {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
};

const MIN_THUMB_HEIGHT = 48;
const SCROLLBAR_WIDTH = 20;
const SCROLL_BUTTON_HEIGHT = 20;
const SOFT_NEUTRAL_FILL = "#e7e7e7";
const COLUMN_OPTIONS = [5, 4, 3, 2] as const;
const DEFAULT_COLUMN_COUNT = 3;

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 256 256"
      className="size-5 fill-current"
    >
      <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
    </svg>
  );
}

function MaximizeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 256 256"
      className="size-4 fill-current"
    >
      <path d="M208,28H48A20,20,0,0,0,28,48V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V48A20,20,0,0,0,208,28Zm-4,176H52V52H204Z" />
    </svg>
  );
}

export default function PostersWindow({
  onClose,
  onToggleMaximize,
  maximized,
  title,
  apiPath,
  refreshToken = 0,
}: {
  onClose: () => void;
  onToggleMaximize: () => void;
  maximized: boolean;
  title: string;
  apiPath: string;
  refreshToken?: number;
}) {
  const [posters, setPosters] = useState<PosterAsset[]>([]);
  const [columnStop, setColumnStop] = useState(
    COLUMN_OPTIONS.indexOf(DEFAULT_COLUMN_COUNT),
  );
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>({
    clientHeight: 0,
    scrollHeight: 0,
    scrollTop: 0,
  });
  const [draggingThumb, setDraggingThumb] = useState<{
    pointerOffset: number;
  } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const columnCount = COLUMN_OPTIONS[columnStop] ?? DEFAULT_COLUMN_COUNT;

  useEffect(() => {
    const controller = new AbortController();

    const loadPosters = async () => {
      try {
        const response = await fetch(apiPath, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { posters?: PosterAsset[] };
        setPosters(data.posters ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    };

    void loadPosters();

    return () => {
      controller.abort();
    };
  }, [apiPath, refreshToken]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    const content = contentRef.current;

    if (!scrollArea) {
      return;
    }

    const updateMetrics = () => {
      setScrollMetrics({
        clientHeight: scrollArea.clientHeight,
        scrollHeight: scrollArea.scrollHeight,
        scrollTop: scrollArea.scrollTop,
      });
    };

    updateMetrics();

    scrollArea.addEventListener("scroll", updateMetrics);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            updateMetrics();
          });

    resizeObserver?.observe(scrollArea);

    if (content) {
      resizeObserver?.observe(content);
    }

    window.addEventListener("resize", updateMetrics);

    return () => {
      scrollArea.removeEventListener("scroll", updateMetrics);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, [posters]);

  const trackHeight = useMemo(
    () => Math.max(scrollMetrics.clientHeight - SCROLL_BUTTON_HEIGHT * 2, 0),
    [scrollMetrics.clientHeight],
  );

  const maxScrollTop = useMemo(
    () => Math.max(scrollMetrics.scrollHeight - scrollMetrics.clientHeight, 0),
    [scrollMetrics.clientHeight, scrollMetrics.scrollHeight],
  );

  const thumbHeight = useMemo(() => {
    if (trackHeight <= 0 || scrollMetrics.scrollHeight <= 0) {
      return 0;
    }

    const nextHeight =
      (scrollMetrics.clientHeight / scrollMetrics.scrollHeight) * trackHeight;

    return Math.max(MIN_THUMB_HEIGHT, Math.min(trackHeight, nextHeight));
  }, [scrollMetrics.clientHeight, scrollMetrics.scrollHeight, trackHeight]);

  const thumbTop = useMemo(() => {
    if (maxScrollTop <= 0 || trackHeight <= thumbHeight) {
      return 0;
    }

    return (scrollMetrics.scrollTop / maxScrollTop) * (trackHeight - thumbHeight);
  }, [maxScrollTop, scrollMetrics.scrollTop, thumbHeight, trackHeight]);

  useEffect(() => {
    if (!draggingThumb) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const scrollArea = scrollAreaRef.current;

      if (!scrollArea || trackHeight <= thumbHeight) {
        return;
      }

      const scrollAreaBounds = scrollArea.getBoundingClientRect();
      const trackTop = scrollAreaBounds.top + SCROLL_BUTTON_HEIGHT;
      const nextThumbTop = Math.min(
        Math.max(event.clientY - trackTop - draggingThumb.pointerOffset, 0),
        trackHeight - thumbHeight,
      );

      scrollArea.scrollTop = (nextThumbTop / (trackHeight - thumbHeight)) * maxScrollTop;
    };

    const handlePointerUp = () => {
      setDraggingThumb(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingThumb, maxScrollTop, thumbHeight, trackHeight]);

  const handleStepScroll = (direction: "up" | "down") => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) {
      return;
    }

    scrollArea.scrollBy({
      top: direction === "up" ? -260 : 260,
      behavior: "smooth",
    });
  };

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden rounded-none shadow-none">
      <Card.Header
        data-gallery-drag-handle
        className="grid cursor-grab grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)] items-center gap-4 border-b-2 border-black bg-primary px-3.5 py-1.5 select-none active:cursor-grabbing"
      >
        <p className="justify-self-start font-mono text-[15px] leading-none text-black">
          {title}
        </p>
        <div
          data-gallery-control
          className="flex w-full items-center justify-center"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <Slider
            min={0}
            max={COLUMN_OPTIONS.length - 1}
            step={1}
            value={[columnStop]}
            aria-label="Adjust poster size"
            rangeClassName="bg-[#e7e7e7]"
            onValueChange={([nextStop]) => {
              setColumnStop(nextStop ?? COLUMN_OPTIONS.indexOf(DEFAULT_COLUMN_COUNT));
            }}
          />
        </div>
        <div className="flex items-center justify-self-end gap-2">
          <button
            type="button"
            data-gallery-control
            aria-label={maximized ? "Restore posters window" : "Maximize posters window"}
            className="flex items-center justify-center text-black"
            onClick={(event) => {
              event.stopPropagation();
              onToggleMaximize();
            }}
          >
            <MaximizeIcon />
          </button>
          <button
            type="button"
            data-gallery-control
            aria-label="Close posters window"
            className="flex items-center justify-center text-black"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
          >
            <CloseIcon />
          </button>
        </div>
      </Card.Header>

      <Card.Content className="relative min-h-0 flex-1 bg-white p-0">
        <div
          ref={scrollAreaRef}
          className={`${styles.scrollArea} h-full overflow-y-auto`}
        >
          <div
            ref={contentRef}
            className={`${styles.masonryGallery} p-3`}
            style={{
              columnGap: "0.75rem",
              columnCount,
              paddingRight: SCROLLBAR_WIDTH + 12,
            }}
          >
            {posters.map((poster) => (
              <div key={poster.name} className={`${styles.masonryItem} mb-3`}>
                <Image
                  src={poster.src}
                  alt={poster.name}
                  width={poster.width}
                  height={poster.height}
                  unoptimized
                  className="block h-auto w-full"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 bottom-0 flex w-5 flex-col border-l-2 border-black bg-white">
          <button
            type="button"
            aria-label="Scroll posters up"
            className="flex h-5 items-center justify-center border-b-2 border-black bg-white"
            onClick={() => handleStepScroll("up")}
          >
            <span
              aria-hidden="true"
              className="block h-0 w-0 border-r-[5px] border-b-[7px] border-l-[5px] border-r-transparent border-b-black border-l-transparent"
            />
          </button>
          <div className="relative flex-1 border-b-2 border-black bg-white">
            <button
              type="button"
              aria-label="Scrollbar thumb"
              className={cn(
                "absolute left-0 right-0 border-t-2 border-b-2 border-black active:cursor-grabbing",
                thumbTop <= 0 && "border-t-0",
                thumbTop >= trackHeight - thumbHeight && "border-b-0",
              )}
              style={{
                height: `${thumbHeight}px`,
                transform: `translateY(${thumbTop}px)`,
                backgroundColor: SOFT_NEUTRAL_FILL,
              }}
              onPointerDown={(event) => {
                const thumbBounds = event.currentTarget.getBoundingClientRect();
                setDraggingThumb({
                  pointerOffset: event.clientY - thumbBounds.top,
                });
              }}
            />
          </div>
          <button
            type="button"
            aria-label="Scroll posters down"
            className="flex h-5 items-center justify-center bg-white"
            onClick={() => handleStepScroll("down")}
          >
            <span
              aria-hidden="true"
              className="block h-0 w-0 border-t-[7px] border-r-[5px] border-l-[5px] border-t-black border-r-transparent border-l-transparent"
            />
          </button>
        </div>
      </Card.Content>
    </Card>
  );
}
