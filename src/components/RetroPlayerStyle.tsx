"use client";

import { ArrowLeft, Heart, Pause, Repeat, Shuffle, Sparkle, StepBack, StepForward } from "lucide-react";

import { Button, Card } from "@/components/retroui";
import { Slider } from "@/components/retroui/Slider";

export default function RetroPlayerStyle() {
  return (
    <Card className="w-full max-w-sm rounded-lg shadow-none">
      <Card.Header
        data-player-drag-handle
        className="flex cursor-grab flex-row justify-between border-b border-black/50 select-none active:cursor-grabbing dark:border-white/50"
      >
        <Button variant="ghost" className="p-0">
          <ArrowLeft className="size-5" />
        </Button>
        <p className="text-sm font-bold">Now playing</p>
        <Button variant="ghost" className="p-0">
          <Heart className="size-5" />
        </Button>
      </Card.Header>

      <Card.Content className="relative overflow-hidden px-4 py-6 sm:px-12">
        <div className="mb-6 flex items-center gap-4">
          <img
            src="/images/punk.svg"
            alt="retro player album"
            className="size-12 rounded-md border object-contain"
          />
          <div className="flex-1">
            <p className="font-semibold">Punk Anthem Music</p>
            <p className="text-sm text-muted-foreground">by Punk</p>
          </div>
        </div>

        <div>
          <div>
            <Slider value={[50]} />
            <div className="mt-1.5 flex items-center justify-between select-none">
              <p className="text-xs text-muted-foreground">01:10</p>
              <p className="text-xs text-muted-foreground">02:15</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 sm:gap-3">
            <Button variant="ghost" className="p-0">
              <Repeat className="size-4" />
            </Button>
            <Button variant="ghost" className="p-0">
              <StepBack className="size-5" />
            </Button>
            <Button
              variant="outline"
              className="h-14 w-14 rounded-full p-0 shadow-[3px_4px_0_0_#000]"
            >
              <Pause className="size-5" />
            </Button>
            <Button variant="ghost" className="p-0">
              <StepForward className="size-5" />
            </Button>
            <Button variant="ghost" className="p-0">
              <Shuffle className="size-4" />
            </Button>
          </div>
        </div>

        <Sparkle
          size={30}
          strokeWidth={0.5}
          className="absolute -right-2 top-26 hidden rotate-12 fill-amber-300 sm:block"
        />
        <Sparkle
          size={20}
          strokeWidth={0.5}
          className="absolute bottom-20 left-1 hidden fill-slate-500 sm:block"
        />
      </Card.Content>
    </Card>
  );
}
