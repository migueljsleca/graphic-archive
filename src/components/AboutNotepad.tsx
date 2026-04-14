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

export default function AboutNotepad({ onClose }: { onClose: () => void }) {
  return (
    <Card className="w-[420px] overflow-hidden rounded-none shadow-none">
      <Card.Header
        data-note-drag-handle
        className="flex cursor-grab flex-row items-center justify-between border-b-2 border-black bg-primary px-3.5 py-1.5 select-none active:cursor-grabbing"
      >
        <p className="font-mono text-[15px] leading-none text-black">about.txt</p>
        <button
          type="button"
          data-note-control
          aria-label="Close about note"
          className="flex items-center justify-center text-black"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          <CloseIcon />
        </button>
      </Card.Header>

      <Card.Content className="bg-[#fafafa] px-5 py-4">
        <div className="space-y-4 font-mono text-[14px] leading-6 text-black">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
            ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore.
          </p>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}
