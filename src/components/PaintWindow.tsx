"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Card } from "@/components/retroui";
import { Slider } from "@/components/retroui/Slider";
import styles from "@/components/PostersWindow.module.css";

type Tool = "pencil" | "eraser";
type PaintView = "paint" | "drawings";

type Point = {
  x: number;
  y: number;
};

type PaintWindowProps = {
  onClose: () => void;
  maximized: boolean;
  onToggleMaximize: () => void;
};

type DrawingAsset = {
  name: string;
  src: string;
  width: number;
  height: number;
};

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1000;
const MIN_STROKE_WIDTH = 4;
const MAX_STROKE_WIDTH = 36;
const DRAWINGS_COLUMN_OPTIONS = [5, 4, 3, 2] as const;
const DEFAULT_DRAWINGS_COLUMN_COUNT = 4;
const COLOR_PRESETS = [
  { name: "black", value: "#000000" },
  { name: "blue", value: "#2563eb" },
  { name: "brown", value: "#a47148" },
  { name: "cyan", value: "#3fe0f5" },
  { name: "green", value: "#39ff14" },
  { name: "magenta", value: "#f04df8" },
  { name: "orange", value: "#ff9800" },
  { name: "purple", value: "#7c3aed" },
  { name: "red", value: "#ff2a00" },
  { name: "yellow", value: "#fff200" },
  { name: "white", value: "#ffffff" },
] as const;

function PencilIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 256 256"
      className="size-4 fill-current"
    >
      <path d="M230.14,70.54,185.46,25.85a20,20,0,0,0-28.29,0L33.86,149.17A19.85,19.85,0,0,0,28,163.31V208a20,20,0,0,0,20,20H92.69a19.86,19.86,0,0,0,14.14-5.86L230.14,98.82a20,20,0,0,0,0-28.28ZM93,180l71-71,11,11-71,71ZM76,163,65,152l71-71,11,11ZM52,173l15.51,15.51h0L83,204H52ZM192,103,153,64l18.34-18.34,39,39Z" />
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 256 256"
      className="size-4 fill-current"
    >
      <path d="M216,204H141l86.84-86.84a28,28,0,0,0,0-39.6L186.43,36.19a28,28,0,0,0-39.6,0L28.19,154.82a28,28,0,0,0,0,39.6l30.06,30.07A12,12,0,0,0,66.74,228H216a12,12,0,0,0,0-24ZM163.8,53.16a4,4,0,0,1,5.66,0l41.38,41.38a4,4,0,0,1,0,5.65L160,151l-47-47ZM71.71,204,45.16,177.45a4,4,0,0,1,0-5.65L96,121l47,47-36,36Z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 256 256"
      className="size-4 fill-current"
    >
      <path d="M224,68H130.7L104.3,41.7A16,16,0,0,0,93,37H32A20,20,0,0,0,12,57V188a20,20,0,0,0,20,20H224a20,20,0,0,0,20-20V88A20,20,0,0,0,224,68Z" />
    </svg>
  );
}

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

export default function PaintWindow({
  onClose,
  maximized,
  onToggleMaximize,
}: PaintWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [view, setView] = useState<PaintView>("paint");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(16);
  const [drawingsColumnStop, setDrawingsColumnStop] = useState(
    DRAWINGS_COLUMN_OPTIONS.indexOf(DEFAULT_DRAWINGS_COLUMN_COUNT),
  );
  const [drawingsRefreshToken, setDrawingsRefreshToken] = useState(0);
  const [drawings, setDrawings] = useState<DrawingAsset[]>([]);
  const [saveState, setSaveState] = useState<{
    status: "idle" | "saving" | "saved" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });
  const drawingsColumnCount =
    DRAWINGS_COLUMN_OPTIONS[drawingsColumnStop] ?? DEFAULT_DRAWINGS_COLUMN_COUNT;

  const getContext = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.lineCap = "round";
    context.lineJoin = "round";

    return context;
  };

  const fillCanvasWhite = () => {
    const context = getContext();
    const canvas = canvasRef.current;

    if (!context || !canvas) {
      return;
    }

    context.save();
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.save();
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }, []);

  useEffect(() => {
    if (view !== "drawings") {
      return;
    }

    const controller = new AbortController();

    const loadDrawings = async () => {
      try {
        const response = await fetch("/api/drawings", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { posters?: DrawingAsset[] };
        setDrawings(data.posters ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    };

    void loadDrawings();

    return () => {
      controller.abort();
    };
  }, [drawingsRefreshToken, view]);

  const getPointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const bounds = canvas.getBoundingClientRect();

    if (bounds.width === 0 || bounds.height === 0) {
      return null;
    }

    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;

    return {
      x: (event.clientX - bounds.left) * scaleX,
      y: (event.clientY - bounds.top) * scaleY,
    };
  };

  const drawLine = (from: Point, to: Point) => {
    const context = getContext();

    if (!context) {
      return;
    }

    context.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    context.lineWidth = strokeWidth;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPointFromEvent(event);

    if (!point) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = point;
    drawLine(point, point);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) {
      return;
    }

    const point = getPointFromEvent(event);
    const previousPoint = lastPointRef.current;

    if (!point || !previousPoint) {
      return;
    }

    drawLine(previousPoint, point);
    lastPointRef.current = point;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    fillCanvasWhite();
    setSaveState({
      status: "idle",
      message: "",
    });
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    setSaveState({
      status: "saving",
      message: "saving...",
    });

    try {
      const response = await fetch("/api/drawings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          imageData: canvas.toDataURL("image/png"),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "could not save drawing");
      }

      setSaveState({
        status: "saved",
        message: "saved to drawings",
      });
      setDrawingsRefreshToken((current) => current + 1);
    } catch (error) {
      setSaveState({
        status: "error",
        message: error instanceof Error ? error.message : "could not save drawing",
      });
    }
  };

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden rounded-none shadow-none">
      <Card.Header
        data-paint-drag-handle
        className="grid cursor-grab grid-cols-[minmax(0,1fr)_180px_minmax(0,1fr)] items-center gap-2 border-b-2 border-black bg-primary px-3.5 py-1.5 select-none active:cursor-grabbing"
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            data-paint-control
            className={`flex items-center gap-2 border-2 px-2 py-1 font-mono text-[13px] leading-none text-black ${
              view === "paint" ? "border-black bg-white" : "border-black bg-primary"
            }`}
            onClick={(event) => {
              event.stopPropagation();
              setView("paint");
            }}
          >
            <PencilIcon />
            <span>paint</span>
          </button>
          <button
            type="button"
            data-paint-control
            className={`flex items-center gap-2 border-2 px-2 py-1 font-mono text-[13px] leading-none text-black ${
              view === "drawings" ? "border-black bg-white" : "border-black bg-primary"
            }`}
            onClick={(event) => {
              event.stopPropagation();
              setView("drawings");
            }}
          >
            <FolderIcon />
            <span>drawings</span>
          </button>
        </div>
        {view === "drawings" ? (
          <div
            data-paint-control
            className="flex w-full items-center justify-center justify-self-center"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            <Slider
              min={0}
              max={DRAWINGS_COLUMN_OPTIONS.length - 1}
              step={1}
              value={[drawingsColumnStop]}
              aria-label="Adjust drawing size"
              rangeClassName="bg-[#e7e7e7]"
              onValueChange={([nextStop]) => {
                setDrawingsColumnStop(
                  nextStop ?? DRAWINGS_COLUMN_OPTIONS.indexOf(DEFAULT_DRAWINGS_COLUMN_COUNT),
                );
              }}
            />
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center justify-self-end gap-2">
          <button
            type="button"
            data-paint-control
            aria-label={maximized ? "Restore paint window" : "Maximize paint window"}
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
            data-paint-control
            aria-label="Close paint window"
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

      <Card.Content className="flex min-h-0 flex-1 flex-col bg-[#fafafa] p-3">
        {view === "paint" ? (
          <div className="min-h-0 flex-1 border-2 border-black bg-white">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="h-full w-full touch-none bg-white"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto border-2 border-black bg-white">
            <div
              className={`${styles.masonryGallery} p-3`}
              style={{
                columnGap: "0.75rem",
                columnCount: drawingsColumnCount,
              }}
            >
              {drawings.map((drawing) => (
                <div key={drawing.name} className={`${styles.masonryItem} mb-3`}>
                  <Image
                    src={drawing.src}
                    alt={drawing.name}
                    width={drawing.width}
                    height={drawing.height}
                    unoptimized
                    className="block h-auto w-full"
                  />
                </div>
              ))}
            </div>
            {drawings.length === 0 ? (
              <div className="flex h-full min-h-[220px] items-center justify-center px-6 font-mono text-[13px] text-black">
                no drawings yet
              </div>
            ) : null}
          </div>
        )}
        {view === "paint" ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-2 border-black bg-white p-2 font-mono text-[13px] text-black">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Use pencil"
                className={`flex h-8 w-8 items-center justify-center border-2 ${
                  tool === "pencil" ? "border-black bg-primary" : "border-black bg-white"
                }`}
                onClick={() => setTool("pencil")}
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                aria-label="Use eraser"
                className={`flex h-8 w-8 items-center justify-center border-2 ${
                  tool === "eraser" ? "border-black bg-primary" : "border-black bg-white"
                }`}
                onClick={() => setTool("eraser")}
              >
                <EraserIcon />
              </button>
            </div>

            <div className="flex min-w-[140px] items-center gap-2">
              <span>size</span>
              <div className="w-full max-w-[140px]">
                <Slider
                  min={MIN_STROKE_WIDTH}
                  max={MAX_STROKE_WIDTH}
                  step={1}
                  value={[strokeWidth]}
                  aria-label="Adjust stroke size"
                  onValueChange={([nextWidth]) => {
                    setStrokeWidth(nextWidth ?? 16);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span>color</span>
              <div className="flex flex-wrap items-center gap-1">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    aria-label={`Use ${preset.name}`}
                    className={`flex h-5 w-5 items-center justify-center border-2 border-black transition-opacity ${
                      color === preset.value ? "scale-110 opacity-100" : "opacity-45"
                    }`}
                    style={{ backgroundColor: preset.value }}
                    onClick={() => setColor(preset.value)}
                  />
                ))}
              </div>
            </div>

            <span
              className={`ml-auto ${
                saveState.status === "error" ? "text-red-600" : "text-black"
              }`}
            >
              {saveState.message}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="border-2 border-black bg-white px-2 py-0.5"
                onClick={handleClear}
              >
                reset
              </button>
              <button
                type="button"
                className="border-2 border-black bg-white px-2 py-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  void handleSave();
                }}
                disabled={saveState.status === "saving"}
              >
                save
              </button>
            </div>
          </div>
        ) : null}
      </Card.Content>
    </Card>
  );
}
