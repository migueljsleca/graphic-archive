"use client";

import Image from "next/image";

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

export default function ImagePreviewWindow({ onClose }: { onClose: () => void }) {
  return (
    <Card className="w-[320px] overflow-hidden rounded-none shadow-none">
      <Card.Header
        data-image-drag-handle
        className="flex cursor-grab flex-row items-center justify-between border-b-2 border-black bg-primary px-3.5 py-1.5 select-none active:cursor-grabbing"
      >
        <p className="font-mono text-[15px] leading-none text-black">image-3713.png</p>
        <button
          type="button"
          data-image-control
          aria-label="Close image preview"
          className="flex items-center justify-center text-black"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          <CloseIcon />
        </button>
      </Card.Header>

      <Card.Content className="bg-[#fafafa] p-4">
        <div className="overflow-hidden border-2 border-black bg-white">
          <Image
            src="/image-3713.png"
            alt="Preview for image-3713.png"
            width={414}
            height={444}
            className="h-auto w-full object-contain"
            priority
          />
        </div>
      </Card.Content>
    </Card>
  );
}
