"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { Card } from "@/components/retroui";
import { Slider } from "@/components/retroui/Slider";
import { cn } from "@/lib/utils";
import styles from "@/components/PostersWindow.module.css";

type EditorialAsset = {
  name: string;
  src: string;
  width: number;
  height: number;
};

type EditorialSection = {
  id: string;
  title: string;
  items: EditorialAsset[];
};

type ScrollMetrics = {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
};

const MIN_THUMB_HEIGHT = 48;
const SCROLLBAR_WIDTH = 20;
const SCROLL_BUTTON_HEIGHT = 20;
const DEFAULT_COLUMN_WIDTH = 260;
const SOFT_NEUTRAL_FILL = "#e7e7e7";

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

function WindowIcon() {
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

export default function EditorialWindow({
  onClose,
  onToggleMaximize,
  maximized,
}: {
  onClose: () => void;
  onToggleMaximize: () => void;
  maximized: boolean;
}) {
  const [sections, setSections] = useState<EditorialSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [columnWidth, setColumnWidth] = useState(DEFAULT_COLUMN_WIDTH);
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

  useEffect(() => {
    const controller = new AbortController();

    const loadSections = async () => {
      try {
        const response = await fetch("/api/editorial", {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { sections?: EditorialSection[] };
        const nextSections = data.sections ?? [];
        setSections(nextSections);
        setSelectedSectionId((current) =>
          current && nextSections.some((section) => section.id === current)
            ? current
            : (nextSections[0]?.id ?? null),
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    };

    void loadSections();

    return () => {
      controller.abort();
    };
  }, []);

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) ?? sections[0] ?? null,
    [sections, selectedSectionId],
  );

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
    scrollArea.scrollTop = 0;
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
  }, [selectedSection]);

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
        data-editorial-drag-handle
        className="grid cursor-grab grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)] items-center gap-4 border-b-2 border-black bg-primary px-3.5 py-1.5 select-none active:cursor-grabbing"
      >
        <p className="justify-self-start font-mono text-[15px] leading-none text-black">
          editorial
        </p>
        <div
          data-editorial-control
          className="flex w-full items-center justify-center"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <Slider
            min={180}
            max={420}
            step={1}
            value={[columnWidth]}
            aria-label="Adjust editorial image size"
            rangeClassName="bg-[#e7e7e7]"
            onValueChange={([nextWidth]) => {
              setColumnWidth(nextWidth ?? DEFAULT_COLUMN_WIDTH);
            }}
          />
        </div>
        <div className="flex items-center justify-self-end gap-2">
          <button
            type="button"
            data-editorial-control
            aria-label={maximized ? "Restore editorial window" : "Maximize editorial window"}
            className="flex items-center justify-center text-black"
            onClick={(event) => {
              event.stopPropagation();
              onToggleMaximize();
            }}
          >
            <WindowIcon />
          </button>
          <button
            type="button"
            data-editorial-control
            aria-label="Close editorial window"
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

      <Card.Content className="grid min-h-0 flex-1 grid-cols-[210px_1fr] bg-white p-0">
        <div className="border-r-2 border-black bg-white">
          <div className="max-h-full overflow-x-hidden overflow-y-auto">
            {sections.map((section, index) => {
              const active = section.id === selectedSection?.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  className={
                    active
                      ? index === 0
                        ? "block w-full bg-black/8 px-3 py-1.5 text-left font-mono text-[14px] leading-[1.15] text-black shadow-[inset_0_-2px_0_0_#000]"
                        : "block w-full bg-black/8 px-3 py-1.5 text-left font-mono text-[14px] leading-[1.15] text-black shadow-[inset_0_2px_0_0_#000,inset_0_-2px_0_0_#000]"
                      : "block w-full px-3 py-1.5 text-left font-mono text-[14px] leading-[1.15] text-black hover:bg-black/5"
                  }
                  onClick={() => setSelectedSectionId(section.id)}
                >
                  {section.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-0 bg-white">
          <div
            ref={scrollAreaRef}
            className={`${styles.scrollArea} h-full overflow-y-auto`}
          >
            <div
              ref={contentRef}
              className={`${styles.masonryGallery} p-3`}
              style={{
                columnGap: "0.75rem",
                columnWidth: `${columnWidth}px`,
                paddingRight: SCROLLBAR_WIDTH + 12,
              }}
            >
              {selectedSection?.items.map((item) => (
                <div key={item.name} className={`${styles.masonryItem} mb-3`}>
                  <Image
                    src={item.src}
                    alt={item.name}
                    width={item.width}
                    height={item.height}
                    unoptimized
                    className="block h-auto w-full"
                  />
                </div>
              )) ?? null}
            </div>
          </div>

          <div className="absolute top-0 right-0 bottom-0 flex w-5 flex-col border-l-2 border-black bg-white">
            <button
              type="button"
              aria-label="Scroll editorial up"
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
                aria-label="Editorial scrollbar thumb"
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
              aria-label="Scroll editorial down"
              className="flex h-5 items-center justify-center bg-white"
              onClick={() => handleStepScroll("down")}
            >
              <span
                aria-hidden="true"
                className="block h-0 w-0 border-t-[7px] border-r-[5px] border-l-[5px] border-t-black border-r-transparent border-l-transparent"
              />
            </button>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
