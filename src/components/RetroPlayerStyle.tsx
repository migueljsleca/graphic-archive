"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button, Card } from "@/components/retroui";

type LocalTrack = {
  id: string;
  title: string;
  src: string;
  artist: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
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

function LibraryActionButton({
  disabled,
  label,
  onClick,
}: {
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-8 rounded-none border-black bg-white px-3 font-mono text-[13px] leading-none text-black shadow-none transition-none hover:translate-x-0 hover:translate-y-0 hover:bg-white hover:shadow-none active:translate-x-0 active:translate-y-0 active:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}

function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (value: number) => void;
}) {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div>
      <div className="relative h-3.5 w-full border-2 border-black bg-white">
        <div
          className="h-full border-r-2 border-black bg-primary"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="absolute top-1/2 h-3.5 w-3 -translate-y-1/2 border-2 border-black bg-zinc-100"
          style={{ left: `calc(${progressPercent}% - 6px)` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Seek through track"
          disabled={duration <= 0}
        />
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[12px] leading-none text-black/80">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

function TransportControls({
  canPlay,
  isPlaying,
  onNext,
  onPrevious,
  onTogglePlayback,
}: {
  canPlay: boolean;
  isPlaying: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onTogglePlayback: () => void;
}) {
  return (
    <div className="mt-3.5 flex items-center justify-center gap-8">
      <Button
        type="button"
        variant="ghost"
        className="h-auto p-0 font-sans text-black hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onPrevious}
        disabled={!canPlay}
      >
        <PreviousIcon />
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-10 w-10 rounded-full border-black bg-white p-0 text-black shadow-none transition-none hover:translate-x-0 hover:translate-y-0 active:translate-x-0 active:translate-y-0 hover:bg-white active:bg-white hover:shadow-none active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onTogglePlayback}
        disabled={!canPlay}
      >
        <span className="scale-175">{isPlaying ? <PauseIcon /> : <PlayIcon />}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-auto p-0 font-sans text-black hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onNext}
        disabled={!canPlay}
      >
        <NextIcon />
      </Button>
    </div>
  );
}

function EmptyPlayerState({
  isLoading,
  message,
  onRefresh,
}: {
  isLoading: boolean;
  message: string;
  onRefresh?: () => void;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-8 text-center">
      <p className="font-mono text-[15px] leading-none text-black">
        {isLoading ? "Loading library" : "No tracks found"}
      </p>
      <p className="mt-3 max-w-[260px] font-mono text-[13px] leading-5 text-black/70">
        {message}
      </p>
      <p className="mt-2 font-mono text-[12px] leading-5 text-black/60">
        Drop `.mp3` files into `public/audio`, then refresh the library.
      </p>
      {onRefresh ? (
        <div className="mt-5">
          <LibraryActionButton
            label={isLoading ? "refreshing..." : "refresh library"}
            onClick={onRefresh}
            disabled={isLoading}
          />
        </div>
      ) : null}
    </div>
  );
}

function PlaylistTitle({
  active,
  title,
}: {
  active: boolean;
  title: string;
}) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const contentRef = useRef<HTMLSpanElement | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }

    const measure = () => {
      const container = containerRef.current;
      const content = contentRef.current;

      if (!container || !content) {
        return;
      }

      setShouldScroll(content.scrollWidth > container.clientWidth + 1);
    };

    measure();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            measure();
          });

    if (resizeObserver) {
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      if (contentRef.current) {
        resizeObserver.observe(contentRef.current);
      }
    }

    return () => {
      resizeObserver?.disconnect();
    };
  }, [active, title]);

  return (
    <span ref={containerRef} className="block overflow-hidden">
      {active && shouldScroll ? (
        <span className="player-marquee inline-flex min-w-full gap-6 whitespace-nowrap pr-6">
          <span ref={contentRef}>{title}</span>
          <span aria-hidden="true">{title}</span>
        </span>
      ) : (
        <span ref={contentRef} className={active ? "block" : "block truncate"}>
          {title}
        </span>
      )}
    </span>
  );
}

function DotMatrixVisualizer({
  columnHeights,
}: {
  columnHeights: number[];
}) {
  const spokes = columnHeights.length;
  const viewBoxSize = 220;
  const center = viewBoxSize / 2;
  const baseRadius = 58;
  const dotSpacing = 6.5;
  const maxDots = 9;

  return (
    <div className="mx-auto aspect-square w-[84%]">
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="h-full w-full"
      >
        {Array.from({ length: spokes }, (_, spoke) => {
          const angle = (spoke / spokes) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle);
          const y = Math.sin(angle);
          const amplitude = Math.max(1.15, Math.min(maxDots, columnHeights[spoke] ?? 1.15));

          return Array.from({ length: maxDots }, (_, dotIndex) => {
            const strength = Math.max(
              0,
              Math.min(1, amplitude - dotIndex),
            );
            const radius = baseRadius + dotIndex * dotSpacing;
            const cx = center + x * radius;
            const cy = center + y * radius;
            const dotRadius = 1.25 + strength * 0.45;
            const opacity = 0.04 + strength * 0.96;

            return (
              <circle
                key={`${spoke}-${dotIndex}`}
                cx={cx}
                cy={cy}
                r={dotRadius}
                fill="currentColor"
                className="text-black"
                opacity={opacity}
              />
            );
          });
        })}
      </svg>
    </div>
  );
}

function CompactPlayer({
  currentTime,
  currentTrack,
  duration,
  emptyMessage,
  isLoading,
  isPlaying,
  onNext,
  onPrevious,
  onSeek,
  onTogglePlayback,
}: {
  currentTime: number;
  currentTrack: LocalTrack | null;
  duration: number;
  emptyMessage: string;
  isLoading: boolean;
  isPlaying: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (value: number) => void;
  onTogglePlayback: () => void;
}) {
  if (!currentTrack) {
    return (
      <Card.Content className="px-5 pb-5 pt-3.5">
        <EmptyPlayerState isLoading={isLoading} message={emptyMessage} />
      </Card.Content>
    );
  }

  return (
    <Card.Content className="px-5 pb-5 pt-3.5">
      <p className="text-center font-mono text-[15px] leading-none text-black">
        {currentTrack.title}
      </p>

      <p className="mt-2 text-center font-mono text-[12px] leading-none text-black/70">
        {currentTrack.artist}
      </p>

      <div className="mt-3.5">
        <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
      </div>

      <TransportControls
        canPlay
        isPlaying={isPlaying}
        onNext={onNext}
        onPrevious={onPrevious}
        onTogglePlayback={onTogglePlayback}
      />
    </Card.Content>
  );
}

function ExpandedPlayer({
  currentTime,
  currentTrack,
  currentTrackIndex,
  duration,
  emptyMessage,
  isLoading,
  isPlaying,
  onNext,
  onPrevious,
  onSeek,
  onSelectTrack,
  onTogglePlayback,
  tracks,
  visualizerHeights,
}: {
  currentTime: number;
  currentTrack: LocalTrack | null;
  currentTrackIndex: number;
  duration: number;
  emptyMessage: string;
  isLoading: boolean;
  isPlaying: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (value: number) => void;
  onSelectTrack: (index: number) => void;
  onTogglePlayback: () => void;
  tracks: LocalTrack[];
  visualizerHeights: number[];
}) {
  return (
    <Card.Content className="grid grid-cols-[182px_1fr] p-0">
      <div className="border-r-2 border-black bg-white">
        {tracks.length > 0 ? (
          <div className="max-h-[430px] overflow-x-hidden overflow-y-auto">
            {tracks.map((track, index) => {
              const active = index === currentTrackIndex;

              return (
                <button
                  key={track.id}
                  type="button"
                  className={
                    active
                      ? index === 0
                        ? "block w-full bg-primary/20 px-3 py-1.5 text-left font-mono text-[14px] leading-[1.15] text-black shadow-[inset_0_-2px_0_0_#000]"
                        : "block w-full bg-primary/20 px-3 py-1.5 text-left font-mono text-[14px] leading-[1.15] text-black shadow-[inset_0_2px_0_0_#000,inset_0_-2px_0_0_#000]"
                      : "block w-full px-3 py-1.5 text-left font-mono text-[14px] leading-[1.15] text-black hover:bg-black/5"
                  }
                  onClick={() => onSelectTrack(index)}
                >
                  <PlaylistTitle active={active} title={track.title} />
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyPlayerState isLoading={isLoading} message={emptyMessage} />
        )}
      </div>

      <div className="bg-white px-7 pb-6 pt-5">
        <DotMatrixVisualizer columnHeights={visualizerHeights} />

        <div className="mt-5">
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
        </div>

        <TransportControls
          canPlay={Boolean(currentTrack)}
          isPlaying={isPlaying}
          onNext={onNext}
          onPrevious={onPrevious}
          onTogglePlayback={onTogglePlayback}
        />
      </div>
    </Card.Content>
  );
}

export default function RetroPlayerStyle({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) {
  const [displayMode, setDisplayMode] = useState<"compact" | "expanded">("compact");
  const [shellExpanded, setShellExpanded] = useState(false);
  const [pendingDisplayMode, setPendingDisplayMode] = useState<"compact" | "expanded" | null>(
    null,
  );
  const [tracks, setTracks] = useState<LocalTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>(
    Array.from({ length: 56 }, () => 1.15),
  );
  const [emptyMessage, setEmptyMessage] = useState(
    "Your playlist is empty right now.",
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analysisFrameRef = useRef<number | null>(null);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const timeDomainDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const visualizerSmoothRef = useRef<number[]>(Array.from({ length: 56 }, () => 1.15));
  const playRequestedRef = useRef(false);

  const currentTrack = tracks[currentTrackIndex] ?? null;
  const currentSource = useMemo(() => currentTrack?.src ?? "", [currentTrack]);
  const visualizerColumns = 56;

  const stopVisualizer = () => {
    if (analysisFrameRef.current !== null) {
      window.cancelAnimationFrame(analysisFrameRef.current);
      analysisFrameRef.current = null;
    }
  };

  const ensureAudioAnalysis = () => {
    const audio = audioRef.current;

    if (!audio || typeof window === "undefined") {
      return null;
    }

    const audioWindow = window as Window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextClass = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.46;
      frequencyDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      timeDomainDataRef.current = new Uint8Array(analyserRef.current.fftSize);
    }

    if (!mediaSourceRef.current) {
      mediaSourceRef.current = audioContextRef.current.createMediaElementSource(audio);
      mediaSourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    return {
      context: audioContextRef.current,
      analyser: analyserRef.current,
      data: frequencyDataRef.current,
    };
  };

  const loadLibrary = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/tracks", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load track library.");
      }

      const data = (await response.json()) as { tracks: LocalTrack[] };
      const nextTracks = data.tracks ?? [];

      setTracks(nextTracks);
      setCurrentTrackIndex((currentIndex) =>
        nextTracks.length === 0 ? 0 : Math.min(currentIndex, nextTracks.length - 1),
      );
      setEmptyMessage(
        nextTracks.length === 0
          ? "Your playlist is empty right now."
          : "Library loaded successfully.",
      );
    } catch {
      setTracks([]);
      setCurrentTrackIndex(0);
      setEmptyMessage("Could not load the library from public/audio.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLibrary();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!currentSource) {
      audio.pause();
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    audio.load();

    if (!playRequestedRef.current) {
      return;
    }

    playRequestedRef.current = false;
    void audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, [currentSource]);

  useEffect(() => {
    const resetLevels = Array.from({ length: visualizerColumns }, () => 1.15);
    visualizerSmoothRef.current = resetLevels;
    setVisualizerHeights(resetLevels);
  }, [currentSource, visualizerColumns]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || isVisible) {
      return;
    }

    playRequestedRef.current = false;
    audio.pause();
  }, [isVisible]);

  useEffect(() => {
    if (!isPlaying) {
      stopVisualizer();
      const resetLevels = Array.from({ length: visualizerColumns }, () => 1.15);
      visualizerSmoothRef.current = resetLevels;
      setVisualizerHeights(resetLevels);
      return;
    }

    const analysis = ensureAudioAnalysis();

    if (!analysis) {
      return;
    }

    void analysis.context.resume().catch(() => {});

    const tick = () => {
      const data = analysis.data;
      const timeData = timeDomainDataRef.current;

      if (!data || !timeData) {
        return;
      }

      analysis.analyser.getByteFrequencyData(data);
      analysis.analyser.getByteTimeDomainData(timeData);

      let rmsSum = 0;

      for (let index = 0; index < timeData.length; index += 1) {
        const normalized = ((timeData[index] ?? 128) - 128) / 128;
        rmsSum += normalized * normalized;
      }

      const rms = Math.sqrt(rmsSum / timeData.length);
      const usableBins = Math.max(40, Math.floor(data.length * 0.82));
      const rawHeights = Array.from({ length: visualizerColumns }, (_, index) => {
        const progress = index / visualizerColumns;
        const sampleIndex = Math.floor(progress * timeData.length);
        const currentSample = Math.abs(((timeData[sampleIndex] ?? 128) - 128) / 128);
        const prevSample = Math.abs(
          ((timeData[(sampleIndex - 1 + timeData.length) % timeData.length] ?? 128) - 128) /
            128,
        );
        const nextSample = Math.abs(
          ((timeData[(sampleIndex + 1) % timeData.length] ?? 128) - 128) / 128,
        );
        const wave = currentSample * 0.45 + Math.max(prevSample, nextSample) * 0.55;

        const start = Math.floor(Math.pow(progress, 1.2) * usableBins);
        const end = Math.floor(Math.pow((index + 1) / visualizerColumns, 1.2) * usableBins);
        const sliceEnd = Math.max(start + 1, end);
        let total = 0;
        let peak = 0;

        for (let bandIndex = start; bandIndex < sliceEnd; bandIndex += 1) {
          const value = data[bandIndex] ?? 0;
          total += value;
          peak = Math.max(peak, value);
        }

        const average = total / (sliceEnd - start);
        const spectral = Math.min(1, (average * 0.2 + peak * 0.8) / 255);
        const combined = Math.min(1, wave * 0.72 + spectral * 0.55 + rms * 0.28);
        const shaped = Math.pow(combined, 0.58);

        return Math.max(1.15, Math.min(9, 1.15 + shaped * 7.85));
      });
      const circularHeights = rawHeights.map((height, index, values) => {
        const previous = values[(index - 1 + values.length) % values.length] ?? height;
        const next = values[(index + 1) % values.length] ?? height;
        const farPrevious = values[(index - 2 + values.length) % values.length] ?? previous;
        const farNext = values[(index + 2) % values.length] ?? next;
        const blended =
          height * 0.78 +
          (previous + next) * 0.09 +
          (farPrevious + farNext) * 0.02;

        return Math.max(1.15, Math.min(9, blended));
      });
      const smoothedHeights = circularHeights.map((height, index) => {
        const previous = visualizerSmoothRef.current[index] ?? 1.15;
        const mix = height > previous ? 0.56 : 0.24;
        const eased = previous + (height - previous) * mix;

        return Math.max(1.15, Math.min(9, eased));
      });

      visualizerSmoothRef.current = smoothedHeights;
      setVisualizerHeights(smoothedHeights);
      analysisFrameRef.current = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      stopVisualizer();
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      stopVisualizer();
      void audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  const handleTogglePlayback = () => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    if (audio.paused) {
      playRequestedRef.current = false;
      const analysis = ensureAudioAnalysis();
      void analysis?.context.resume().catch(() => {});
      void audio.play().catch(() => {
        setIsPlaying(false);
      });
      return;
    }

    audio.pause();
  };

  const jumpToTrack = (index: number) => {
    if (!tracks[index]) {
      return;
    }

    playRequestedRef.current = true;
    setCurrentTrackIndex(index);
  };

  const handlePrevious = () => {
    if (tracks.length === 0) {
      return;
    }

    const nextIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    jumpToTrack(nextIndex);
  };

  const handleNext = () => {
    if (tracks.length === 0) {
      return;
    }

    const nextIndex = currentTrackIndex === tracks.length - 1 ? 0 : currentTrackIndex + 1;
    jumpToTrack(nextIndex);
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleClosePlayer = () => {
    setPendingDisplayMode(null);
    setDisplayMode("compact");
    setShellExpanded(false);
    onClose();
  };

  const handleToggleWindow = () => {
    if (pendingDisplayMode) {
      return;
    }

    if (shellExpanded) {
      setPendingDisplayMode("compact");
      setShellExpanded(false);
      return;
    }

    setPendingDisplayMode("expanded");
    setShellExpanded(true);
  };

  const playerBody =
    displayMode === "expanded" ? (
      <ExpandedPlayer
        currentTime={currentTime}
        currentTrack={currentTrack}
        currentTrackIndex={currentTrackIndex}
        duration={duration}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        isPlaying={isPlaying}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        onSelectTrack={jumpToTrack}
        onTogglePlayback={handleTogglePlayback}
        tracks={tracks}
        visualizerHeights={visualizerHeights}
      />
    ) : (
      <CompactPlayer
        currentTime={currentTime}
        currentTrack={currentTrack}
        duration={duration}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        isPlaying={isPlaying}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        onTogglePlayback={handleTogglePlayback}
      />
    );

  return (
    <Card
      className={
        shellExpanded
          ? "w-[640px] overflow-hidden rounded-none shadow-none transition-[width] duration-220 ease-[cubic-bezier(0.4,0,0.2,1)]"
          : "w-[320px] overflow-hidden rounded-none shadow-none transition-[width] duration-220 ease-[cubic-bezier(0.4,0,0.2,1)]"
      }
      onTransitionEnd={(event) => {
        if (
          event.target !== event.currentTarget ||
          event.propertyName !== "width" ||
          !pendingDisplayMode
        ) {
          return;
        }

        setDisplayMode(pendingDisplayMode);
        setPendingDisplayMode(null);
      }}
    >
      <audio
        ref={audioRef}
        src={currentSource || undefined}
        preload="metadata"
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={handleNext}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />

      <Card.Header
        data-player-drag-handle
        className="flex cursor-grab flex-row items-center justify-between border-b-2 border-black bg-primary px-3.5 py-1.5 select-none active:cursor-grabbing"
      >
        <p className="font-mono text-[15px] leading-none text-black">#tbt 2010</p>
        <HeaderControls
          expanded={shellExpanded}
          onClose={handleClosePlayer}
          onToggle={handleToggleWindow}
        />
      </Card.Header>

      {playerBody}
    </Card>
  );
}
