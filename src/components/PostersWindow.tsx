"use client";

import { Card } from "@/components/retroui";

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

export default function PostersWindow({ onClose }: { onClose: () => void }) {
  return (
    <Card className="flex h-[90vh] w-[90vw] flex-col overflow-hidden rounded-none shadow-none">
      <Card.Header
        data-posters-drag-handle
        className="flex cursor-grab flex-row items-center justify-between border-b-2 border-black bg-primary px-3.5 py-1.5 select-none active:cursor-grabbing"
      >
        <p className="font-mono text-[15px] leading-none text-black">posters</p>
        <button
          type="button"
          data-posters-control
          aria-label="Close posters window"
          className="flex items-center justify-center text-black"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          <CloseIcon />
        </button>
      </Card.Header>

      <Card.Content className="min-h-0 flex-1 bg-white p-0" />
    </Card>
  );
}
