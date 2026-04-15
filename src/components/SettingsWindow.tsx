"use client";

import { Card } from "@/components/retroui";
import { Slider } from "@/components/retroui/Slider";

type TitleControls = {
  weight: number;
  slant: number;
  elementShape: number;
  style: "double" | "single";
};

type SettingsMode = "cursor" | "manual";

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

export default function SettingsWindow({
  onClose,
  controls,
  onControlsChange,
  mode,
  onModeChange,
}: {
  onClose: () => void;
  controls: TitleControls;
  onControlsChange: (nextControls: TitleControls) => void;
  mode: SettingsMode;
  onModeChange: (nextMode: SettingsMode) => void;
}) {
  return (
    <Card className="w-fit overflow-hidden rounded-none shadow-none">
      <Card.Header
        data-settings-drag-handle
        className="flex cursor-grab flex-row items-center justify-between border-b-2 border-black bg-primary px-3.5 py-1.5 select-none active:cursor-grabbing"
      >
        <p className="font-mono text-[15px] leading-none text-black">settings.cfg</p>
        <button
          type="button"
          aria-label="Close settings window"
          className="flex items-center justify-center text-black"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          <CloseIcon />
        </button>
      </Card.Header>

      <Card.Content className="w-[312px] space-y-5 bg-[#fafafa] p-4">
        <div className="flex w-full items-center justify-between font-mono text-[12px]">
          <div className="inline-flex border-2 border-black bg-white">
            <button
              type="button"
              className={`px-2.5 py-1 transition-colors ${
                mode === "cursor"
                  ? "bg-primary text-black"
                  : "bg-white text-black hover:bg-[#f2eddc]"
              }`}
              onClick={() => onModeChange("cursor")}
            >
              Cursor
            </button>
            <button
              type="button"
              className={`border-l-2 border-black px-2.5 py-1 transition-colors ${
                mode === "manual"
                  ? "bg-primary text-black"
                  : "bg-white text-black hover:bg-[#f2eddc]"
              }`}
              onClick={() => onModeChange("manual")}
            >
              Manual
            </button>
          </div>
          <div className="inline-flex border-2 border-black bg-white">
            <button
              type="button"
              className={`px-2.5 py-1 transition-colors ${
                controls.style === "single"
                  ? "bg-primary text-black"
                  : "bg-white text-black hover:bg-[#f2eddc]"
              }`}
              onClick={() =>
                onControlsChange({
                  ...controls,
                  style: "single",
                })
              }
            >
              Single
            </button>
            <button
              type="button"
              className={`border-l-2 border-black px-2.5 py-1 transition-colors ${
                controls.style === "double"
                  ? "bg-primary text-black"
                  : "bg-white text-black hover:bg-[#f2eddc]"
              }`}
              onClick={() =>
                onControlsChange({
                  ...controls,
                  style: "double",
                })
              }
            >
              Double
            </button>
          </div>
        </div>

        <div
          className={`space-y-3 ${
            mode === "cursor" ? "opacity-40" : "opacity-100"
          }`}
        >
          <div className="space-y-2 font-mono">
            <div className="text-[12px] text-black">
              <label className="leading-none">Weight</label>
            </div>
            <Slider
              min={100}
              max={900}
              step={1}
              value={[controls.weight]}
              disabled={mode === "cursor"}
              onValueChange={([weight]) =>
                onControlsChange({ ...controls, weight: weight ?? controls.weight })
              }
            />
          </div>

          <div className="space-y-2 font-mono">
            <div className="text-[12px] text-black">
              <label className="leading-none">Slant</label>
            </div>
            <Slider
              min={-8}
              max={0}
              step={0.1}
              value={[controls.slant]}
              disabled={mode === "cursor"}
              onValueChange={([slant]) =>
                onControlsChange({
                  ...controls,
                  slant: slant ?? controls.slant,
                })
              }
            />
          </div>

          <div className="space-y-2 font-mono">
            <div className="text-[12px] text-black">
              <label className="leading-none">Element Shape</label>
            </div>
            <Slider
              min={0}
              max={100}
              step={0.1}
              value={[controls.elementShape]}
              disabled={mode === "cursor"}
              onValueChange={([elementShape]) =>
                onControlsChange({
                  ...controls,
                  elementShape: elementShape ?? controls.elementShape,
                })
              }
            />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
