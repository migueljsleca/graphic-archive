"use client";

import Link from "next/link";

import { Card } from "@/components/retroui";

type NoteLink = {
  label: string;
  href: string;
};

type AboutNotepadProps = {
  onClose: () => void;
  title?: string;
  closeLabel?: string;
  paragraphs?: string[];
  links?: NoteLink[];
};

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

const DEFAULT_PARAGRAPHS = [
  "hey there, welcome to my graphic archive",
  "here you can find some of my past self eheh",
  "when i started in the design field, i was actually more of a generalist and graphic designer (still am sometimes)",
  "obsessed with making posters and zines, typography, threshold and halftone effects, visual identities, riso printing, etc etc",
  "i still love these, but right now my heart is more on the digital/web side <3",
];

export default function AboutNotepad({
  onClose,
  title = "about.txt",
  closeLabel = "Close note",
  paragraphs = DEFAULT_PARAGRAPHS,
  links,
}: AboutNotepadProps) {
  return (
    <Card className="w-[420px] overflow-hidden rounded-none shadow-none">
      <Card.Header
        data-note-drag-handle
        className="flex cursor-grab flex-row items-center justify-between border-b-2 border-black bg-primary px-3.5 py-1.5 select-none active:cursor-grabbing"
      >
        <p className="font-mono text-[15px] leading-none text-black">{title}</p>
        <button
          type="button"
          data-note-control
          aria-label={closeLabel}
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
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {links?.length ? (
            <div className="space-y-2">
              {links.map((link) => (
                <p key={link.href}>
                  <Link
                    href={link.href}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    className="inline-block"
                    style={{
                      textDecorationLine: "underline",
                      textDecorationColor: "#000000",
                      textDecorationThickness: "1.5px",
                      textUnderlineOffset: "2px",
                    }}
                  >
                    {link.label}
                  </Link>
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </Card.Content>
    </Card>
  );
}
