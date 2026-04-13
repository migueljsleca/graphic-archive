"use client";

import { useState } from "react";

import { Button, Card } from "@/components/retroui";

const TRACKS = Array.from({ length: 12 }, () => "music name");

function WindowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 256 256"
      className="size-4.5 fill-current"
    >
      <path d="M216,44H40A20,20,0,0,0,20,64V192a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V64A20,20,0,0,0,216,44ZM44,68H212v48H136a12,12,0,0,0-12,12v60H44ZM148,188V140h64v48Z" />
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

function PauseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 256 256" className="size-4 fill-current">
      <path d="M116,96v64a12,12,0,0,1-24,0V96a12,12,0,0,1,24,0Zm48,0v64a12,12,0,0,1-24,0V96a12,12,0,0,1,24,0Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 256 256" className="size-4 fill-current">
      <path d="M176,128a12,12,0,0,1-5.17,9.87l-52,36A12,12,0,0,1,100,164V92a12,12,0,0,1,18.83-9.87l52,36A12,12,0,0,1,176,128Z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 256 256"
      className="size-[18px] fill-current"
    >
      <path d="M200,28a12,12,0,0,0-12,12v62l-113.45-71A20,20,0,0,0,44,47.88V208.12A20,20,0,0,0,74.55,225L188,154v62a12,12,0,0,0,24,0V40A12,12,0,0,0,200,28ZM68,200.73V55.27L184.3,128Z" />
    </svg>
  );
}

function PreviousIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 256 256"
      className="size-[18px] fill-current"
    >
      <path d="M201.75,30.52a20,20,0,0,0-20.3.53L68,102V40a12,12,0,0,0-24,0V216a12,12,0,0,0,24,0V154l113.45,71A20,20,0,0,0,212,208.12V47.88A19.86,19.86,0,0,0,201.75,30.52ZM188,200.73,71.7,128,188,55.27Z" />
    </svg>
  );
}

function TransportControls() {
  return (
    <div className="mt-3.5 flex items-center justify-center gap-8">
      <Button
        variant="ghost"
        className="h-auto p-0 font-sans text-black hover:bg-transparent"
      >
        <PreviousIcon />
      </Button>
      <Button
        variant="outline"
        className="h-10 w-10 rounded-full border-black bg-white p-0 text-black shadow-none transition-none hover:translate-x-0 hover:translate-y-0 active:translate-x-0 active:translate-y-0 hover:bg-white active:bg-white hover:shadow-none active:shadow-none"
      >
        <span className="scale-175">
          <PauseIcon />
        </span>
      </Button>
      <Button
        variant="ghost"
        className="h-auto p-0 font-sans text-black hover:bg-transparent"
      >
        <NextIcon />
      </Button>
    </div>
  );
}

function HeaderControls({
  expanded,
  onClose,
  onToggle,
}: {
  expanded: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 text-black">
      <button
        type="button"
        data-player-control
        aria-label={expanded ? "Minimize player" : "Expand player"}
        className="flex items-center justify-center text-black"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        <WindowIcon />
      </button>
      <button
        type="button"
        data-player-control
        aria-label="Close player"
        className="flex items-center justify-center text-black"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function CompactPlayer() {
  return (
    <Card.Content className="px-5 pb-5 pt-3.5">
      <p className="text-center font-mono text-[15px] leading-none text-black">
        Punk Anthem Music
      </p>

      <div className="mt-3.5">
        <div className="relative h-3.5 w-full border-2 border-black bg-white">
          <div className="h-full w-[48%] border-r-2 border-black bg-primary" />
          <div className="absolute left-[47%] top-1/2 h-3.5 w-3 -translate-y-1/2 border-2 border-black bg-zinc-100" />
        </div>
      </div>

      <TransportControls />
    </Card.Content>
  );
}

function ExpandedPlayer() {
  return (
    <Card.Content className="grid grid-cols-[182px_1fr] p-0">
      <div className="border-r-2 border-black bg-white">
        <div className="max-h-[430px] overflow-hidden">
          {TRACKS.map((track, index) => (
            <div
              key={`${track}-${index}`}
              className={
                index === 6
                  ? "border-y-2 border-black bg-primary px-3 py-1.5 font-mono text-[15px] leading-none text-black"
                  : "px-3 py-1.5 font-mono text-[15px] leading-none text-black"
              }
            >
              {track}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white px-7 pb-6 pt-5">
        <div className="border-2 border-dashed border-black/15 bg-[linear-gradient(45deg,rgba(0,0,0,0.045)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.045)_75%),linear-gradient(45deg,rgba(0,0,0,0.045)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.045)_75%)] bg-[length:36px_36px] bg-[position:0_0,18px_18px]">
          <img
            src="/images/punk.svg"
            alt="retro player album"
            className="aspect-[4/3] w-full object-cover opacity-85 mix-blend-multiply"
          />
        </div>

        <p className="mt-5 text-center font-mono text-[15px] leading-none text-black">
          Punk Anthem Music
        </p>

        <div className="mt-3.5">
          <div className="relative h-3.5 w-full border-2 border-black bg-white">
            <div className="h-full w-[48%] border-r-2 border-black bg-primary" />
            <div className="absolute left-[47%] top-1/2 h-3.5 w-3 -translate-y-1/2 border-2 border-black bg-zinc-100" />
          </div>
        </div>

        <TransportControls />
      </div>
    </Card.Content>
  );
}

export default function RetroPlayerStyle({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={
        expanded
          ? "w-[640px] overflow-hidden rounded-none shadow-none"
          : "w-[320px] overflow-hidden rounded-none shadow-none"
      }
    >
      <Card.Header
        data-player-drag-handle
        className="flex cursor-grab flex-row items-center justify-between border-b-2 border-black bg-primary px-3.5 py-1.5 select-none active:cursor-grabbing"
      >
        <p className="font-mono text-[15px] leading-none text-black">media player</p>
        <HeaderControls
          expanded={expanded}
          onClose={onClose}
          onToggle={() => setExpanded((current) => !current)}
        />
      </Card.Header>

      {expanded ? <ExpandedPlayer /> : <CompactPlayer />}
    </Card>
  );
}
